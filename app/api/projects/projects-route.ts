// GEN ALIXIR - Phase 2 - API Liste des Projets
// Fichier: src/app/api/projects/route.ts
// Endpoint: GET /api/projects - Liste tous les projets
// Endpoint: POST /api/projects - Créer un nouveau projet

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth';

// Schéma de validation pour la création de projet
const createProjectSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères').max(100),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  max_members: z.number().min(2).max(50).default(10),
  skills_required: z.array(z.string()).max(5).default([]),
});

// GET /api/projects - Liste tous les projets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const skill = searchParams.get('skill');

    // Construire les filtres
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (skill) {
      where.skills_required = {
        has: skill,
      };
    }

    // Récupérer les projets avec leurs relations
    const projects = await prisma.project.findMany({
      where,
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
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // On crée le projet en forçant l'ID du propriétaire (le tien dans Supabase)
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        max_members: Number(body.max_members) || 10,
        owner_id: "TON_UUID_SUPABASE_ICI", // Récupère cet ID dans ta table users sur Supabase
        status: 'PLANNING',
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur creation" }, { status: 500 });
  }
}

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { created_at: 'desc' }
  });
  return NextResponse.json(projects);
}

    // Vérifier que l'utilisateur a le droit de créer des projets
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Seuls PROJECT_LEAD, FOUNDER, MODERATOR peuvent créer des projets
    if (!['PROJECT_LEAD', 'FOUNDER', 'MODERATOR'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Vous n\'avez pas les permissions pour créer un projet' },
        { status: 403 }
      );
    }

    // Valider les données
    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    // Créer le projet
    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        max_members: validatedData.max_members,
        skills_required: validatedData.skills_required,
        owner_id: user.id,
        status: 'PLANNING',
      },
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
      message: 'Projet créé avec succès',
      project,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}
