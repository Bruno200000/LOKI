import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tcvvczdwchowscaaeezd.supabase.co';
const supabaseAnonKey = ''; // À remplir avec votre clé anon

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
