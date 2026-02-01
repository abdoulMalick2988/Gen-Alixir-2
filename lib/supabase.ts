import { createClient } from '@supabase/supabase-js';

// Remplace ces deux valeurs par celles de ton tableau de bord Supabase
const supabaseUrl = 'https://cfommdpitsmwcunbtkob.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmb21tZHBpdHNtd2N1bmJ0a29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MDYwNzYsImV4cCI6MjA4NTA4MjA3Nn0.Vsv8IveRTafkiEdOav0eh0zSt9VcQCZA4h4vq97qhf4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
