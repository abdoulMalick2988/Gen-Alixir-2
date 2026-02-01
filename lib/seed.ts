import { supabase } from './supabase';

export async function seedDatabase() {
  // 1. Insertion de quelques partenaires tests à Bujumbura
  const { data: partners } = await supabase.from('partners').insert([
    { name: 'Kaze Burger', domain: 'Alimentation', level: 'Pro', city: 'Bujumbura' },
    { name: 'Pharmacie de la Paix', domain: 'Santé', level: 'Business', city: 'Gitega' }
  ]).select();

  // 2. Insertion de clients tests
  await supabase.from('users_data').insert([
    { gender: 'M', age_range: '25-35', loyalty_level: 'Gold', total_ecolixir: 500 },
    { gender: 'F', age_range: '18-24', loyalty_level: 'Karibu', total_ecolixir: 50 },
    { gender: 'M', age_range: '45+', loyalty_level: 'Elite', total_ecolixir: 1200 }
  ]);
  
  return "Base de données ECODREUM initialisée !";
}
