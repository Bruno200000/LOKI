import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface VideoDebugProps {
  isVisible?: boolean;
}

export const VideoDebug: React.FC<VideoDebugProps> = ({ isVisible = false }) => {
  const [videoData, setVideoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      checkVideoData();
    }
  }, [isVisible]);

  const checkVideoData = async () => {
    setLoading(true);
    try {
      // Récupérer toutes les propriétés avec des URLs de vidéos
      const { data, error } = await supabase
        .from('houses')
        .select('id, title, video_url, videos, image_url, created_at')
        .or('video_url.not.is.null,videos.not.is.null');

      if (error) {
        console.error('Error fetching video data:', error);
        return;
      }

      console.log('=== DEBUG DES VIDÉOS ===');
      console.log('Propriétés avec vidéos trouvées:', data?.length || 0);

      if (data) {
        data.forEach((house, index) => {
          console.log(`\n--- Propriété ${index + 1}: ${house.title} (ID: ${house.id}) ---`);
          console.log(`video_url: ${house.video_url || 'NULL'}`);
          console.log(`videos[]: ${house.videos ? JSON.stringify(house.videos) : 'NULL'}`);
          console.log(`image_url: ${house.image_url || 'NULL'}`);
          console.log(`created_at: ${house.created_at}`);

          // Vérifier si les URLs sont accessibles (format basique)
          if (house.video_url) {
            const isValidUrl = house.video_url.startsWith('http://') || house.video_url.startsWith('https://');
            console.log(`video_url format valide: ${isValidUrl ? '✅' : '❌'}`);
          }

          if (house.videos) {
            house.videos.forEach((videoUrl: string, videoIndex: number) => {
              const isValidUrl = videoUrl.startsWith('http://') || videoUrl.startsWith('https://');
              console.log(`videos[${videoIndex}] format valide: ${isValidUrl ? '✅' : '❌'} (${videoUrl})`);
            });
          }
        });
      }

      setVideoData(data || []);
    } catch (error) {
      console.error('Error in checkVideoData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixVideoUrls = async () => {
    if (!videoData.length) return;

    setLoading(true);
    try {
      for (const house of videoData) {
        let needsUpdate = false;
        let updateData: any = {};

        // Vérifier et corriger video_url
        if (house.video_url && !house.video_url.startsWith('http')) {
          console.log(`Correction de video_url pour ${house.title}`);
          updateData.video_url = null;
          needsUpdate = true;
        }

        // Vérifier et corriger videos[]
        if (house.videos) {
          const validVideos = house.videos.filter((url: string) =>
            url && (url.startsWith('http://') || url.startsWith('https://'))
          );

          if (validVideos.length !== house.videos.length) {
            console.log(`Correction de videos[] pour ${house.title}: ${house.videos.length} -> ${validVideos.length}`);
            updateData.videos = validVideos.length > 0 ? validVideos : null;
            needsUpdate = true;
          }
        }

        // Appliquer les corrections
        if (needsUpdate) {
          const { error } = await supabase
            .from('houses')
            .update(updateData)
            .eq('id', house.id);

          if (error) {
            console.error(`Erreur lors de la mise à jour de ${house.title}:`, error);
          } else {
            console.log(`✅ ${house.title} mis à jour avec succès`);
          }
        }
      }

      // Recharger les données après correction
      await checkVideoData();
    } catch (error) {
      console.error('Error in fixVideoUrls:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-md">
      <h3 className="font-bold mb-2">Debug des vidéos</h3>

      <div className="space-y-2 mb-4">
        <p className="text-sm">Propriétés avec vidéos: {videoData.length}</p>
        {loading && <p className="text-sm text-blue-600">Chargement...</p>}
      </div>

      <div className="flex gap-2">
        <button
          onClick={checkVideoData}
          disabled={loading}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          Vérifier
        </button>
        <button
          onClick={fixVideoUrls}
          disabled={loading || videoData.length === 0}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
        >
          Corriger URLs
        </button>
      </div>
    </div>
  );
};
