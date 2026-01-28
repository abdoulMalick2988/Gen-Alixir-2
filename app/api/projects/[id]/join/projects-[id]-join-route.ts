// GEN ALIXIR - Phase 2 - API Rejoindre un Projet
// Fichier: src/app/api/projects/[id]/join/route.ts
// Endpoint: POST /api/projects/[id]/join - Rejoindre un projet

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

    // Récupérer le projet avec ses membres
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        members: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le projet n'est pas archivé ou terminé
    if (project.status === 'ARCHIVED' || project.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, message: 'Ce projet n\'accepte plus de nouveaux membres' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur n'est pas déjà le owner
    if (project.owner_id === payload.id) {
      return NextResponse.json(
        { success: false, message: 'Vous êtes déjà le chef de ce projet' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur n'est pas déjà membre
    const existingMember = project.members.find(m => m.user_id === payload.id);
    if (existingMember) {
      return NextResponse.json(
        { success: false, message: 'Vous êtes déjà membre de ce projet' },
        { status: 400 }
      );
    }

    // Vérifier que le projet n'est pas complet
    if (project._count.members >= project.max_members) {
      return NextResponse.json(
        { success: false, message: 'Ce projet a atteint le nombre maximum de membres' },
        { status: 400 }
      );
    }

    // Ajouter l'utilisateur comme membre
    const member = await prisma.projectMember.create({
      data: {
        project_id: params.id,
        user_id: payload.id,
        role: 'MEMBER',
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    // TODO Phase 2 Sprint 4: Créer une notification pour le chef du projet

    return NextResponse.json({
      success: true,
      message: 'Vous avez rejoint le projet',
      member,
    });
    
  } catch (error) {
    console.error('Join project error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la tentative de rejoindre le projet' },
      { status: 500 }
    );
  }
}
