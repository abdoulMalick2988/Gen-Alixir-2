import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Test de recherche utilisateur (On vérifie si l'email marche)
    const user = await prisma.user.findUnique({
      where: { email: "abdoulmalick2977@gmail.com" }
    });

    if (!user) {
      return NextResponse.json({ 
        error: "Utilisateur introuvable", 
        details: "Aucun user avec l'email abdoulmalick2977@gmail.com dans la table User" 
      }, { status: 404 });
    }

    // 2. Tentative de création avec logs détaillés
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        max_members: 10,
        owner_id: user.id, 
        status: 'PLANNING',
      },
    });

    return NextResponse.json(project);

  } catch (error: any) {
    // ON RENVOIE L'ERREUR EXACTE A L'ECRAN
    console.error("ERREUR PRISMA:", error);
    return NextResponse.json({ 
      error: "Echec écriture DB", 
      details: error.message || String(error) 
    }, { status: 500 });
  }
}

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { created_at: 'desc' }
  });
  return NextResponse.json(projects);
}
