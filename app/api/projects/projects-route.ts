import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. Vérifier qui est connecté
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    
    // 2. Créer le projet avec l'ID de la session
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        max_members: Number(body.max_members) || 10,
        owner_id: abdoulmalick2977@gmail.com, // Utilise ton ID de session réel
        status: 'PLANNING',
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Erreur API Projects:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { created_at: 'desc' },
    include: { owner: true } // Pour voir qui a créé quoi
  });
  return NextResponse.json(projects);
}
