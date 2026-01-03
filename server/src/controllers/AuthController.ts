import { Request, Response } from 'express';
import { UsuarioRepository } from '../repositories/UsuarioRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class AuthController {
  /**
   * POST /api/auth/register
   * Registrar nuevo usuario
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, nombre, password } = req.body;

      // Validar campos requeridos
      if (!email || !nombre || !password) {
        res.status(400).json({ 
          error: 'Email, nombre y password son requeridos' 
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Email inválido' });
        return;
      }

      // Validar longitud de password
      if (password.length < 6) {
        res.status(400).json({ 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        });
        return;
      }

      // Verificar si el usuario ya existe
      const existingUser = await UsuarioRepository.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ error: 'El email ya está registrado' });
        return;
      }

      // Hash del password
      const password_hash = await bcrypt.hash(password, 10);

      // Crear usuario
      const usuario = await UsuarioRepository.create({
        email,
        nombre,
        password_hash,
      });

      // Generar token JWT
      const token = jwt.sign(
        { userId: usuario.id, email: usuario.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
        },
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }

  /**
   * POST /api/auth/login
   * Iniciar sesión
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validar campos requeridos
      if (!email || !password) {
        res.status(400).json({ error: 'Email y password son requeridos' });
        return;
      }

      // Buscar usuario por email
      const usuario = await UsuarioRepository.findByEmail(email);
      if (!usuario) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      // Verificar password
      const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
      if (!passwordMatch) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      // Generar token JWT
      const token = jwt.sign(
        { userId: usuario.id, email: usuario.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
        },
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }

  /**
   * GET /api/auth/me
   * Obtener información del usuario autenticado
   */
  static async me(req: Request, res: Response): Promise<void> {
    try {
      // El userId viene del middleware de autenticación
      const userId = (req as any).userId;

      const usuario = await UsuarioRepository.findById(userId);
      if (!usuario) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json({
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
      });
    } catch (error) {
      console.error('Error getting user info:', error);
      res.status(500).json({ error: 'Error al obtener información del usuario' });
    }
  }
}
