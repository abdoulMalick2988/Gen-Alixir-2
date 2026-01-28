import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // On cherche ton compte directement par ton email
    const user = await prisma.user.findUnique({
      where: { email: "abdoulmalick2977@gmail.com" }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // On crée le projet avec ton ID trouvé
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        max_members: 10,
        owner_id: user.id, // Ton ID réel récupéré proprement
        status: 'PLANNING',
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
  }
}

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { created_at: 'desc' }
  });
  return NextResponse.json(projects);
}
