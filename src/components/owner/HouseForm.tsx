import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, House } from '../../lib/supabase';
import { X, AlertCircle, CheckCircle, Upload, Loader } from 'lucide-react';

const BOUAKE_NEIGHBORHOODS = [
  "Aéroport",
  "Ahougnanssou",
  "Air France 1",
  "Air France 2",
  "Air France 3",
  "Allokokro",
  "Attienkro",
  "Beaufort",
  "Belleville 1",
  "Belleville 2",
  "Broukro 1",
  "Broukro 2",
  "Camp Militaire",
  "Commerce",
  "Dar-es-Salam 1",
  "Dar-es-Salam 2",
  "Dar-es-Salam 3",
  "Dougouba",
  "Gonfreville",
  "Houphouët-Ville",
  "IDESSA",
  "Kamounoukro",
  "Kanakro",
  "Kennedy",
  "Koko",
  "Kodiakoffikro",
  "Konankankro",
  "Liberté",
  "Lycée Municipal",
  "Mamianou",
  "N’Dakro",
  "N’Gattakro",
  "N’Gouatanoukro",
  "Niankoukro",
  "Nimbo",
  "Sokoura",
  "Tièrèkro",
  "Tolla Kouadiokro",
  "Zone Industrielle",
];

interface HouseFormProps {
  house?: House | null;
  onClose: () => void;
}

export const HouseForm = ({ house, onClose }: HouseFormProps): React.JSX.Element => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    status: 'available' as 'available' | 'taken' | 'pending',
    image_url: '',
    video_url: '',
    virtual_tour_url: '',
    city: 'Bouaké',
    neighborhood: '',
    photos: [] as string[],

    // Caractéristiques de base
    bedrooms: '',
    bathrooms: '',
    area_sqm: '',

    // Équipements
    air_conditioning: false,
    heating: false,
    hot_water: false,
    internet: false,
    parking: false,
    elevator: false,
    balcony: false,
    garden: false,
    pool: false,

    // Sécurité
    security_cameras: false,
    alarm_system: false,
    interphone: false,
    guardian: false
  });

  // Initialize form data when editing
  useEffect(() => {
    if (house) {
      setFormData({
        title: house.title,
        description: house.description || '',
        price: house.price.toString(),
        status: house.status,
        image_url: house.image_url || '',
        video_url: house.video_url || '',
        virtual_tour_url: house.virtual_tour_url || '',
        city: house.city || 'Bouaké',
        neighborhood: (house as any).neighborhood || '',
        photos: house.photos || [],

        // Caractéristiques de base
        bedrooms: house.bedrooms?.toString() || '',
        bathrooms: house.bathrooms?.toString() || '',
        area_sqm: house.area_sqm?.toString() || '',

        // Équipements
        air_conditioning: house.air_conditioning || false,
        heating: house.heating || false,
        hot_water: house.hot_water || false,
        internet: house.internet || false,
        parking: house.parking || false,
        elevator: house.elevator || false,
        balcony: house.balcony || false,
        garden: house.garden || false,
        pool: house.pool || false,

        // Sécurité
        security_cameras: house.security_cameras || false,
        alarm_system: house.alarm_system || false,
        interphone: house.interphone || false,
        guardian: house.guardian || false
      });
    }
  }, [house]);

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxImages = 6;
    const currentPhotos = formData.photos.length;
    const availableSlots = maxImages - currentPhotos;

    if (files.length > availableSlots) {
      setError(`Vous ne pouvez ajouter que ${availableSlots} image(s) supplémentaire(s)`);
      return;
    }

    setError('');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner uniquement des images');
        return;
      }

      // Vérifier la taille (max 5MB par image)
      if (file.size > 5 * 1024 * 1024) {
        setError('Chaque image ne doit pas dépasser 5MB');
        return;
      }
    }

    setUploading(true);

    try {
      const newPhotos: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `images/${fileName}`;

        // Upload vers Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('house-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data } = supabase.storage
          .from('house-media')
          .getPublicUrl(filePath);

        newPhotos.push(data.publicUrl);
      }

      // Mettre à jour le formulaire avec les nouvelles images
      setFormData({ ...formData, photos: [...formData.photos, ...newPhotos] });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload des images');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Veuillez sélectionner une vidéo valide');
      return;
    }

    // Limite 50MB pour les vidéos
    if (file.size > 50 * 1024 * 1024) {
      setError('La vidéo ne doit pas dépasser 50MB');
      return;
    }

    setUploadingVideo(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('house-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('house-media')
        .getPublicUrl(filePath);

      setFormData({ ...formData, video_url: data.publicUrl });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload de la vidéo');
    } finally {
      setUploadingVideo(false);
    }
  };
  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const houseData = {
        owner_id: profile?.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        status: formData.status,
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        virtual_tour_url: formData.virtual_tour_url || null,
        city: formData.city || null,
        neighborhood: formData.neighborhood || null,
        photos: formData.photos.length > 0 ? formData.photos : null,

        // Caractéristiques de base
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 1,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 1,
        area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,

        // Équipements
        air_conditioning: formData.air_conditioning || null,
        heating: formData.heating || null,
        hot_water: formData.hot_water || null,
        internet: formData.internet || null,
        parking: formData.parking || null,
        elevator: formData.elevator || null,
        balcony: formData.balcony || null,
        garden: formData.garden || null,
        pool: formData.pool || null,

        // Sécurité
        security_cameras: formData.security_cameras || null,
        alarm_system: formData.alarm_system || null,
        interphone: formData.interphone || null,
        guardian: formData.guardian || null
      };

      if (house) {
        const { error } = await supabase
          .from('houses')
          .update(houseData)
          .eq('id', house.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('houses').insert([houseData]);

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              {house ? 'Modifier la propriété' : 'Ajouter une propriété'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="m-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-green-800 text-sm">Propriété enregistrée avec succès!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                placeholder="Belle villa à Cocody"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                rows={4}
                placeholder="Décrivez votre propriété..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prix mensuel (FCFA) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                  placeholder="150000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ville (Bouaké)
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                  required
                >
                  <option value="Bouaké">Bouaké</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quartier (Bouaké) *
              </label>
              <select
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                required
              >
                <option value="">Sélectionner un quartier</option>
                {BOUAKE_NEIGHBORHOODS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Statut *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'taken' | 'pending' })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                required
              >
                <option value="available">Disponible</option>
                <option value="taken">Pris</option>
                <option value="pending">En attente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lien de visite virtuelle (optionnel)
              </label>
              <input
                type="url"
                value={formData.virtual_tour_url}
                onChange={(e) => setFormData({ ...formData, virtual_tour_url: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                placeholder="https://example.com/virtual-tour"
              />
              <p className="text-xs text-slate-500 mt-1">Lien vers une visite virtuelle 360° ou vidéo (optionnel)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vidéo de la propriété (optionnel)
              </label>
              <div className="mb-3">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                  disabled={uploadingVideo}
                />
                <label
                  htmlFor="video-upload"
                  className={`inline-flex items-center px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-ci-orange-500 hover:bg-orange-50 transition ${
                    uploadingVideo ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingVideo ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Upload vidéo en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Télécharger une vidéo
                    </>
                  )}
                </label>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">OU</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL de la vidéo
                </label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                  placeholder="https://example.com/video.mp4"
                />
                <p className="text-xs text-slate-500 mt-1">Ou collez l'URL d'une vidéo hébergée en ligne</p>
              </div>
            </div>

            {/* Caractéristiques de base */}
            <div className="bg-slate-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Caractéristiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre de chambres *
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                    placeholder="2"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre de salles de bain *
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Surface (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.area_sqm}
                    onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                    placeholder="120"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Équipements et Sécurité */}
            <div className="bg-slate-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Équipements et Sécurité</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Équipements */}
                <div>
                  <h4 className="text-md font-medium text-slate-800 mb-3">Équipements</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.air_conditioning}
                        onChange={(e) => setFormData({ ...formData, air_conditioning: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Climatisation</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.heating}
                        onChange={(e) => setFormData({ ...formData, heating: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Chauffage</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.hot_water}
                        onChange={(e) => setFormData({ ...formData, hot_water: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Eau chaude</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.internet}
                        onChange={(e) => setFormData({ ...formData, internet: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Internet</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.parking}
                        onChange={(e) => setFormData({ ...formData, parking: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Parking</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.elevator}
                        onChange={(e) => setFormData({ ...formData, elevator: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Ascenseur</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.balcony}
                        onChange={(e) => setFormData({ ...formData, balcony: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Balcon/Terrasse</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.garden}
                        onChange={(e) => setFormData({ ...formData, garden: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Jardin</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.pool}
                        onChange={(e) => setFormData({ ...formData, pool: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Piscine</span>
                    </label>
                  </div>
                </div>

                {/* Sécurité */}
                <div>
                  <h4 className="text-md font-medium text-slate-800 mb-3">Sécurité</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.security_cameras}
                        onChange={(e) => setFormData({ ...formData, security_cameras: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Caméras de surveillance</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.alarm_system}
                        onChange={(e) => setFormData({ ...formData, alarm_system: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Système d'alarme</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.interphone}
                        onChange={(e) => setFormData({ ...formData, interphone: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Interphone</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.guardian}
                        onChange={(e) => setFormData({ ...formData, guardian: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Gardien</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Images de la propriété (jusqu'à 6 images)
              </label>

              {/* Afficher les images existantes */}
              {formData.photos.length > 0 && (
                <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Bouton d'upload pour images principales */}
              <div className="mb-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleImageUpload}
                  className="hidden"
                  id="multiple-image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="multiple-image-upload"
                  className={`inline-flex items-center px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-ci-orange-500 hover:bg-orange-50 transition ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Ajouter des images ({formData.photos.length}/6)
                    </>
                  )}
                </label>
                <p className="text-xs text-slate-500 mt-2">
                  JPG, PNG ou GIF (max 5MB par image) - Vous pouvez sélectionner plusieurs images à la fois
                </p>
              </div>

              {/* Séparateur OU pour URL manuelle */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">OU</span>
                </div>
              </div>

              {/* URL manuelle pour image principale */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  URL d'image principale (optionnel)
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                  placeholder="https://example.com/image-principale.jpg"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Collez l'URL d'une image principale hébergée en ligne (sera utilisée si aucune image n'est uploadée)
                </p>
              </div>
            </div>

            {formData.image_url && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Aperçu de l'image
                </label>
                <div className="border border-slate-200 rounded-lg p-4">
                  <img
                    src={formData.image_url}
                    alt="Aperçu"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
              </div>
            )}

            {formData.video_url && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Aperçu de la vidéo
                </label>
                <div className="border border-slate-200 rounded-lg p-4">
                  <video
                    src={formData.video_url}
                    controls
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-ci-orange-600 hover:bg-ci-orange-700 disabled:bg-slate-400 text-white rounded-lg font-semibold transition"
              >
                {loading ? 'Enregistrement...' : house ? 'Mettre à jour' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
