import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oliizzwqbmlpeqozhofm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saWl6endxYm1scGVxb3pob2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTU5MzYsImV4cCI6MjA3NDk3MTkzNn0.G_E-bPzPZXEMbKZvUdhmaF3X1uH6_HVibVXiA42XhDs';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create storage bucket for house media
async function createStorageBucket() {
  try {
    const { data, error } = await supabase.storage.createBucket('house-media', {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*'],
      fileSizeLimit: 52428800 // 50MB
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return false;
    }

    console.log('Storage bucket created successfully:', data);
    return true;
  } catch (err) {
    console.error('Failed to create storage bucket:', err);
    return false;
  }
}

// Run the function
createStorageBucket();
