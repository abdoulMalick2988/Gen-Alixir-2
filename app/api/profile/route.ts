// GEN ALIXIR - Profile API
// Endpoint pour mettre à jour le profil utilisateur

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth';
import { AVAILABLE_SKILLS, AVAILABLE_AURA } from '@/types';

// Schéma de validation pour la mise à jour du profil
const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  country: z.string().min(2).optional(),
  skills: z.array(z.enum(AVAILABLE_SKILLS as [string, ...string[]])).max(3).optional(),
  aura: z.array(z.enum(AVAILABLE_AURA as [string, ...string[]])).max(3).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }
    
    const profile = await prisma.profile.findUnique({
      where: { user_id: payload.id },
    });
    
    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profil non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, profile });
    
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractToken(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token invalide' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);
    
    // Mettre à jour le profil
    const profile = await prisma.profile.update({
      where: { user_id: payload.id },
      data: validatedData,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour',
      profile,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
