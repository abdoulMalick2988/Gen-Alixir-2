// GEN ALIXIR - Authentication Utilities
// Gestion du hashing PIN et des tokens JWT

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Génère un PIN aléatoire à 6 chiffres
 */
export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash un PIN de manière sécurisée avec bcrypt
 */
export async function hashPin(pin: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}

/**
 * Vérifie qu'un PIN correspond au hash stocké
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Génère un token JWT pour un utilisateur
 */
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d', // Token valide 7 jours
    }
  );
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyToken(token: string): { id: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}

/**
 * Extrait le token du header Authorization
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Valide le format d'un PIN (4-6 chiffres)
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

/**
 * Valide le format d'un email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
