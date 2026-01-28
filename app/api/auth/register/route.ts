import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generatePin, hashPin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  country: z.string().min(2, 'Le pays doit être spécifié'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // TEST 1: Vérifier si Prisma répond
    console.log("Tentative de vérification d'utilisateur...");
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    }).catch(err => {
      throw new Error("Erreur Connexion Prisma: " + err.message);
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    // TEST 2: Vérifier le Hachage
    console.log("Tentative de hachage du PIN...");
    const pin = generatePin();
    let pin_hash;
    try {
      pin_hash = await hashPin(pin);
    } catch (err) {
      throw new Error("Erreur Hachage PIN: " + err.message);
    }

    // TEST 3: Création
    console.log("Tentative de création dans la DB...");
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        pin_hash,
        role: 'MEMBER',
        profile: {
          create: {
            full_name: validatedData.full_name,
            country: validatedData.country,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie !',
      pin: pin,
      user: { id: user.id, email: user.email },
    });

  } catch (error: any) {
    // ICI : On renvoie l'erreur RÉELLE au lieu du message générique
    console.error('DETAILED ERROR:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'DEBUG: ' + (error.message || 'Erreur inconnue'),
        details: error.stack 
      },
      { status: 500 }
    );
  }
}
