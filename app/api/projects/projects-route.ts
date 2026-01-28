import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. On récupère ta session actuelle
    const session = await getServerSession(authOptions);
    
    // Si la session est vide, on refuse la création
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    
    // 2. On crée le projet en utilisant ton ID utilisateur (session.user.id)
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        max_members: Number(body.max_members) || 10,
        owner_id: (session.user as any).id, // C'est ici que ça se joue
        status: 'PLANNING',
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { created_at: 'desc' },
    include: { owner: true }
  });
  return NextResponse.json(projects);
}
