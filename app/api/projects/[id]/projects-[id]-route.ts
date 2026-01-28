// GEN ALIXIR - Phase 2 - API Projet Spécifique
// Fichier: src/app/api/projects/[id]/route.ts
// Endpoint: GET /api/projects/[id] - Détails d'un projet
// Endpoint: PUT /api/projects/[id] - Modifier un projet
// Endpoint: DELETE /api/projects/[id] - Supprimer un projet

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth';

// Schéma de validation pour la mise à jour
const updateProjectSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
  max_members: z.number().min(2).max(50).optional(),
  skills_required: z.array(z.string()).max(5).optional(),
});

// GET /api/projects/[id] - Détails d'un projet
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
        members: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
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

    return NextResponse.json({
      success: true,
      project,
    });
    
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération du projet' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Modifier un projet
export async function PUT(
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

    // Vérifier que l'utilisateur est le owner du projet
    if (project.owner_id !== payload.id) {
      return NextResponse.json(
        { success: false, message: 'Seul le chef du projet peut le modifier' },
        { status: 403 }
      );
    }

    // Valider les données
    const body = await request.json();
    const validatedData = updateProjectSchema.parse(body);

    // Si le statut passe à COMPLETED, enregistrer la date
    const updateData: any = { ...validatedData };
    if (validatedData.status === 'COMPLETED' && project.status !== 'COMPLETED') {
      updateData.completed_at = new Date();
    }

    // Mettre à jour le projet
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: updateData,
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
        members: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Projet mis à jour',
      project: updatedProject,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Update project error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la mise à jour du projet' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Supprimer un projet
export async function DELETE(
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

    // Vérifier que l'utilisateur est le owner du projet
    if (project.owner_id !== payload.id) {
      return NextResponse.json(
        { success: false, message: 'Seul le chef du projet peut le supprimer' },
        { status: 403 }
      );
    }

    // Supprimer le projet (les membres seront supprimés en cascade)
    await prisma.project.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Projet supprimé',
    });
    
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la suppression du projet' },
      { status: 500 }
    );
  }
}
