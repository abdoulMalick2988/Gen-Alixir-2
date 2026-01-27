// GEN ALIXIR - Register API
// Endpoint pour l'inscription de nouveaux membres

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generatePin, hashPin } from '@/lib/auth';

// Schéma de validation
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  country: z.string().min(2, 'Le pays doit être spécifié'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validatedData = registerSchema.parse(body);
    
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }
    
    // Générer un PIN aléatoire
    const pin = generatePin();
    const pin_hash = await hashPin(pin);
    
    // Créer l'utilisateur et son profil
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        pin_hash,
        role: 'MEMBER',
        profile: {
          create: {
            full_name: validatedData.full_name,
            country: validatedData.country,
            pco: 0,
            aura: [],
            aura_verified: false,
            skills: [],
          },
        },
      },
      include: {
        profile: true,
      },
    });
    
    // En production, envoyer le PIN par email
    // Pour l'instant, on le retourne dans la réponse (développement uniquement)
    
    return NextResponse.json({
      success: true,
      message: 'Inscription réussie ! Votre PIN a été généré.',
      pin: pin, // ⚠️ À supprimer en production, envoyer par email
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
