const https = require('https');

// URLs de test basées sur les erreurs du log
const testUrls = [
  'https://tcvvczdwchowscaaeezd.supabase.co/storage/v1/object/public/house-media/videos/1760696590445-k5joot3rpg.mp4',
  'https://tcvvczdwchowscaaeezd.supabase.co/storage/v1/object/public/house-media/videos/1760623427063-u8tmywurjbf.mp4'
];

async function testVideoUrls() {
  console.log('🔍 TEST D\'ACCESSIBILITÉ DES VIDÉOS SUPABASE STORAGE');
  console.log('=================================================\n');

  for (const url of testUrls) {
    console.log(`🎬 Test de: ${url}`);

    try {
      await new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
          console.log(`   ✅ HTTP Status: ${res.statusCode}`);
          console.log(`   ✅ Status Text: ${res.statusMessage}`);
          console.log(`   ✅ Content-Type: ${res.headers['content-type']}`);
          console.log(`   ✅ Content-Length: ${res.headers['content-length']}`);

          if (res.statusCode === 200) {
            console.log(`   ✅ VIDÉO ACCESSIBLE!`);
          } else if (res.statusCode === 404) {
            console.log(`   ❌ Fichier introuvable (404)`);
          } else if (res.statusCode === 403) {
            console.log(`   ❌ Accès interdit (403) - Vérifiez les politiques RLS`);
          } else {
            console.log(`   ⚠️ Status inattendu: ${res.statusCode}`);
          }

          resolve();
        });

        req.on('error', (error) => {
          console.log(`   ❌ Erreur de connexion: ${error.message}`);
          reject(error);
        });

        req.setTimeout(10000, () => {
          console.log(`   ⏰ Timeout après 10 secondes`);
          req.destroy();
          resolve();
        });

        req.end();
      });
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }

    console.log('');
  }

  console.log('💡 DIAGNOSTIC:');
  console.log('- Si 404: Les fichiers n\'existent pas dans Supabase Storage');
  console.log('- Si 403: Les politiques RLS bloquent l\'accès public');
  console.log('- Si timeout: Problème de réseau ou fichier très volumineux');
  console.log('- Si 200: Les vidéos sont accessibles!');

  console.log('\n🚀 PROCHAINES ÉTAPES:');
  console.log('1. Exécutez le script storage_policies.sql dans Supabase SQL Editor');
  console.log('2. Vérifiez que les fichiers existent dans Storage → house-media/videos/');
  console.log('3. Rechargez votre app React avec npm run dev');
}

testVideoUrls();
