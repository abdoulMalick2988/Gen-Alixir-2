// GEN ALIXIR - Login API
// Endpoint pour la connexion avec email + PIN

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPin, generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Schéma de validation
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  pin: z.string().regex(/^\d{4,6}$/, 'Le PIN doit contenir 4 à 6 chiffres'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = loginSchema.parse(body);
    
    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: { profile: true },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Email ou PIN incorrect' },
        { status: 401 }
      );
    }
    
    // Vérifier le PIN
    const isValidPin = await verifyPin(validatedData.pin, user.pin_hash);
    
    if (!isValidPin) {
      return NextResponse.json(
        { success: false, message: 'Email ou PIN incorrect' },
        { status: 401 }
      );
    }
    
    // Générer le token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    });
    
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      profile: user.profile,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
