// GEN ALIXIR - Phase 2 - API Quitter un Projet
// Fichier: src/app/api/projects/[id]/leave/route.ts
// Endpoint: POST /api/projects/[id]/leave - Quitter un projet

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
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

    // Récupérer le projet
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    // Le owner ne peut pas quitter son propre projet
    if (project.owner_id === payload.id) {
      return NextResponse.json(
        { success: false, message: 'Le chef du projet ne peut pas quitter. Supprimez le projet si nécessaire.' },
        { status: 400 }
      );
    }

    // Trouver le membre
    const member = await prisma.projectMember.findUnique({
      where: {
        project_id_user_id: {
          project_id: params.id,
          user_id: payload.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Vous n\'êtes pas membre de ce projet' },
        { status: 400 }
      );
    }

    // Supprimer le membre
    await prisma.projectMember.delete({
      where: {
        id: member.id,
      },
    });

    // TODO Phase 2 Sprint 4: Créer une notification pour le chef du projet

    return NextResponse.json({
      success: true,
      message: 'Vous avez quitté le projet',
    });
    
  } catch (error) {
    console.error('Leave project error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la tentative de quitter le projet' },
      { status: 500 }
    );
  }
}
