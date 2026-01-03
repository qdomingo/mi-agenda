const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
let AdmZip;
try {
  AdmZip = require('adm-zip');
} catch {
  AdmZip = null;
}

function fileExists(p) {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function hasWalletFiles(dir) {
  return fileExists(path.join(dir, 'tnsnames.ora')) && fileExists(path.join(dir, 'sqlnet.ora'));
}

function unzipWithSystem(zipPath, targetDir) {
  // Prefer unzip on Linux/Heroku
  const unzip = spawnSync('unzip', ['-o', zipPath, '-d', targetDir], { stdio: 'inherit' });
  if (unzip.status === 0) return true;

  // Fallback for Windows environments without unzip: PowerShell Expand-Archive
  if (process.platform === 'win32') {
    const cmd = `Expand-Archive -LiteralPath \"${zipPath}\" -DestinationPath \"${targetDir}\" -Force`;
    const ps = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', cmd], { stdio: 'inherit' });
    return ps.status === 0;
  }

  return false;
}

function unzipWithJs(zipPath, targetDir) {
  if (!AdmZip) return false;
  try {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(targetDir, true);
    return true;
  } catch {
    return false;
  }
}

(function main() {
  const walletZipBase64 = (() => {
    if (process.env.WALLET_ZIP_BASE64) return process.env.WALLET_ZIP_BASE64;

    // Allow chunked env vars (useful if the zip exceeds per-var limits)
    // Example: WALLET_ZIP_BASE64_1, WALLET_ZIP_BASE64_2, ...
    const parts = [];
    for (let i = 1; i < 100; i++) {
      const part = process.env[`WALLET_ZIP_BASE64_${i}`];
      if (!part) break;
      parts.push(part);
    }
    return parts.length ? parts.join('') : undefined;
  })();
  const walletLocation = process.env.WALLET_LOCATION || path.join(os.tmpdir(), 'mi-agenda-wallet');

  // If wallet already present, do nothing.
  if (hasWalletFiles(walletLocation)) {
    return;
  }

  if (!walletZipBase64) {
    // No wallet provided via env; keep silent to avoid breaking local dev.
    return;
  }

  ensureDir(walletLocation);

  const zipPath = path.join(os.tmpdir(), `mi-agenda-wallet-${Date.now()}.zip`);
  fs.writeFileSync(zipPath, Buffer.from(walletZipBase64, 'base64'));

  const ok = unzipWithSystem(zipPath, walletLocation) || unzipWithJs(zipPath, walletLocation);
  try {
    fs.unlinkSync(zipPath);
  } catch {
    // ignore
  }

  if (!ok || !hasWalletFiles(walletLocation)) {
    throw new Error(
      `Wallet bootstrap failed. Expected tnsnames.ora + sqlnet.ora under WALLET_LOCATION=${walletLocation}`
    );
  }
})();
