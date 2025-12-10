import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ivljovrpknkawheuyiir.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bGpvdnJwa25rYXdoZXV5aWlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzODE3MDgsImV4cCI6MjA4MDk1NzcwOH0.BnKft5I_89ZJrfZ5GaKCT06UuieERC7AhWMehtSWaig';

export const supabase = createClient(supabaseUrl, supabaseKey);