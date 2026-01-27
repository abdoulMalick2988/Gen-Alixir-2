// GEN ALIXIR - Database Seed Script
// Peuple la base de données avec des données de test

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPin(pin) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}

async function main() {
  console.log('🌱 Démarrage du seed...');

  // Nettoyer les données existantes
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✓ Nettoyage des données existantes');

  // Créer des utilisateurs de test
  const users = [
    {
      email: 'test@genalixir.com',
      pin: '123456',
      role: 'MEMBER',
      profile: {
        full_name: 'Jean Dupont',
        country: 'Burundi',
        pco: 45,
        skills: ['Développement', 'Design'],
        aura: ['Créatif', 'Collaboratif'],
        aura_verified: false,
      },
    },
    {
      email: 'chef@genalixir.com',
      pin: '654321',
      role: 'PROJECT_LEAD',
      profile: {
        full_name: 'Marie Kante',
        country: 'Sénégal',
        pco: 120,
        skills: ['Gestion de Projet', 'Marketing', 'Rédaction'],
        aura: ['Leader', 'Dynamique', 'Visionnaire'],
        aura_verified: true,
      },
    },
    {
      email: 'fondateur@genalixir.com',
      pin: '111111',
      role: 'FOUNDER',
      profile: {
        full_name: 'Ahmed Diallo',
        country: 'Guinée',
        pco: 200,
        skills: ['Développement', 'Data Analysis', 'UI/UX'],
        aura: ['Innovant', 'Empathique', 'Rigoureux'],
        aura_verified: true,
      },
    },
    {
      email: 'moderateur@genalixir.com',
      pin: '222222',
      role: 'MODERATOR',
      profile: {
        full_name: 'Aminata Ndiaye',
        country: 'Mali',
        pco: 95,
        skills: ['Community Management', 'Rédaction'],
        aura: ['Empathique', 'Rigoureux', 'Collaboratif'],
        aura_verified: true,
      },
    },
  ];

  for (const userData of users) {
    const pin_hash = await hashPin(userData.pin);

    await prisma.user.create({
      data: {
        email: userData.email,
        pin_hash,
        role: userData.role,
        profile: {
          create: userData.profile,
        },
      },
    });

    console.log(`✓ Créé: ${userData.email} (PIN: ${userData.pin})`);
  }

  console.log('');
  console.log('🎉 Seed terminé avec succès !');
  console.log('');
  console.log('📋 Comptes de test créés :');
  console.log('');
  
  users.forEach((user) => {
    console.log(`   Email: ${user.email}`);
    console.log(`   PIN:   ${user.pin}`);
    console.log(`   Rôle:  ${user.role}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
