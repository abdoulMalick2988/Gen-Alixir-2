// GEN ALIXIR - API Projets Simplifiée (Mode Test)
// Fichier: src/app/api/projects/route.ts
// ❗ CRÉER ce nouveau fichier

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/projects - Liste tous les projets
export async function GET(request: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
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
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      projects,
    });
    
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Créer un nouveau projet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // En mode test, utiliser l'ID fondateur fixe
    const founderId = 'founder-test-id';

    // Créer le projet
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        max_members: body.max_members || 10,
        skills_required: body.skills_required || [],
        owner_id: founderId,
        status: 'PLANNING',
      },
      include: {
        owner: {
          include: {
            profile: true,
          },
        },
        members: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Projet créé avec succès',
      project,
    });
    
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}
