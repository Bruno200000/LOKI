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
  "N'Dakro",
  "N'Gattakro",
  "N'Gouatanoukro",
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
  onSuccess: () => void;
  propertyType: 'residence' | 'house' | 'land' | 'shop';
}

export const HouseForm = ({ house, onClose, onSuccess, propertyType }: HouseFormProps): React.JSX.Element => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const getDefaultFormData = () => {
    const baseData = {
      // Champs de base
      title: '',
      description: '',
      price: '',
      type: propertyType,
      status: 'available' as 'available' | 'taken',
      location: '',
      city: 'Bouaké',
      neighborhood: '',

      // Médias
      image_url: '',
      video_url: '',
      virtual_tour_url: '',
      photos: [] as string[],
      videos: [] as string[],

      // Caractéristiques générales
      area_sqm: '',
      parking: false,
      security_cameras: false,
      guardian: false,
      furnished: false,
      floor: '',
    };

    if (propertyType === 'residence' || propertyType === 'house') {
      return {
        ...baseData,
        bedrooms: '',
        bathrooms: '',
        air_conditioning: false,
        heating: false,
        hot_water: false,
        internet: false,
        elevator: false,
        balcony: false,
        garden: false,
        pool: false,
        alarm_system: false,
        interphone: false,
      };
    }

    if (propertyType === 'land') {
      return {
        ...baseData,
        land_type: 'residential' as 'residential' | 'commercial' | 'agricultural',
        has_water: false,
        has_electricity: false,
        is_flat: false,
        has_fence: false,
      };
    }

    if (propertyType === 'shop') {
      return {
        ...baseData,
        shop_type: 'retail' as 'retail' | 'restaurant' | 'office' | 'other',
        has_toilet: false,
        has_storage: false,
        has_showcase: false,
        has_ac: false,
        has_security_system: false,
      };
    }

    return baseData;
  };

  const getPriceLabel = () => {
    switch (propertyType) {
      case 'residence':
        return 'Prix par nuit (FCFA) *';
      case 'land':
        return 'Prix fixe (FCFA) *';
      case 'house':
      case 'shop':
      default:
        return 'Prix mensuel (FCFA) *';
    }
  };

  const getPricePlaceholder = () => {
    switch (propertyType) {
      case 'residence':
        return '15000';
      case 'land':
        return '5000000';
      case 'house':
      case 'shop':
      default:
        return '150000';
    }
  };

  const [formData, setFormData] = useState(getDefaultFormData());

  // Reinitialize form when propertyType changes
  useEffect(() => {
    setFormData(getDefaultFormData());
  }, [propertyType]);

  // Initialize form data when editing
  useEffect(() => {
    if (house) {
      const baseFormData = {
        ...getDefaultFormData(),
        title: house.title,
        location: house.location || '',
        description: house.description || '',
        price: house.price.toString(),
        status: house.status,
        image_url: house.image_url || '',
        video_url: house.video_url || '',
        virtual_tour_url: house.virtual_tour_url || '',
        city: house.city || 'Bouaké',
        neighborhood: house.neighborhood || '',
        photos: house.photos || [],
        area_sqm: house.area_sqm?.toString() || '',
        parking: house.parking || false,
        security_cameras: house.security_cameras || false,
        guardian: house.guardian || false,
      };

      // Ajouter les champs spécifiques selon le type
      if (house.type === 'residence' || house.type === 'house') {
        setFormData({
          ...baseFormData,
          bedrooms: house.bedrooms?.toString() || '',
          bathrooms: house.bathrooms?.toString() || '',
          furnished: house.furnished || false,
          floor: house.floor?.toString() || '',
          air_conditioning: house.air_conditioning || false,
          heating: house.heating || false,
          hot_water: house.hot_water || false,
          internet: house.internet || false,
          elevator: house.elevator || false,
          balcony: house.balcony || false,
          garden: house.garden || false,
          pool: house.pool || false,
          alarm_system: house.alarm_system || false,
          interphone: house.interphone || false,
        } as any);
      } else if (house.type === 'land') {
        setFormData({
          ...baseFormData,
          land_type: house.land_type || 'residential',
          has_water: house.has_water || false,
          has_electricity: house.has_electricity || false,
          is_flat: house.is_flat || false,
          has_fence: house.has_fence || false,
        } as any);
      } else if (house.type === 'shop') {
        setFormData({
          ...baseFormData,
          shop_type: house.shop_type || 'retail',
          has_toilet: house.has_toilet || false,
          has_storage: house.has_storage || false,
          has_showcase: house.has_showcase || false,
          has_ac: house.has_ac || false,
          has_security_system: house.has_security_system || false,
        } as any);
      } else {
        setFormData(baseFormData as any);
      }
    }
  }, [house, propertyType]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const getSupabaseErrorMessage = (err: unknown): string => {
      if (!err || typeof err !== 'object') return 'Erreur lors de la sauvegarde';
      const anyErr = err as any;
      const parts = [anyErr.message, anyErr.details, anyErr.hint, anyErr.code].filter(Boolean);
      return parts.length > 0 ? String(parts.join(' - ')) : 'Erreur lors de la sauvegarde';
    };

    try {
      if (!profile) throw new Error('Vous devez être connecté pour ajouter une propriété');

      const parsedPrice = Number(formData.price);
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        throw new Error('Veuillez saisir un prix valide (strictement supérieur à 0)');
      }

      const parsedArea = formData.area_sqm ? Number(formData.area_sqm) : null;
      if (parsedArea !== null && (!Number.isFinite(parsedArea) || parsedArea <= 0)) {
        throw new Error('Veuillez saisir une surface valide (strictement supérieure à 0)');
      }

      // Données de base communes à tous les types de propriété
      const propertyData: Record<string, unknown> = {
        owner_id: profile.id,
        title: formData.title,
        description: formData.description || null,
        price: parsedPrice,
        status: formData.status,
        type: propertyType,
        property_type: propertyType, // Alias pour la BDD
        city: formData.city,
        neighborhood: formData.neighborhood || null,
        area_sqm: parsedArea,

        // Médias
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
        virtual_tour_url: formData.virtual_tour_url || null,
        photos: formData.photos.length > 0 ? formData.photos : null,

        // Équipements généraux
        parking: formData.parking || false,
        security_cameras: formData.security_cameras || false,
        guardian: formData.guardian || false,
        furnished: formData.furnished || false,
      };

      // Ajouter le floor si présent
      const parsedFloor = (formData as any).floor ? Number((formData as any).floor) : null;
      if (parsedFloor !== null) {
        propertyData.floor = parsedFloor;
      }

      // Caractéristiques spécifiques aux résidences et maisons
      if (propertyType === 'residence' || propertyType === 'house') {
        const bedrooms = (formData as any).bedrooms ? Number((formData as any).bedrooms) : null;
        const bathrooms = (formData as any).bathrooms ? Number((formData as any).bathrooms) : null;

        propertyData.bedrooms = bedrooms;
        propertyData.bathrooms = bathrooms;
        propertyData.air_conditioning = (formData as any).air_conditioning || false;
        propertyData.heating = (formData as any).heating || false;
        propertyData.hot_water = (formData as any).hot_water || false;
        propertyData.internet = (formData as any).internet || false;
        propertyData.elevator = (formData as any).elevator || false;
        propertyData.balcony = (formData as any).balcony || false;
        propertyData.garden = (formData as any).garden || false;
        propertyData.pool = (formData as any).pool || false;
        propertyData.alarm_system = (formData as any).alarm_system || false;
        propertyData.interphone = (formData as any).interphone || false;
      }

      // Caractéristiques spécifiques aux terrains
      if (propertyType === 'land') {
        propertyData.land_type = (formData as any).land_type || 'residential';
        propertyData.has_water = (formData as any).has_water || false;
        propertyData.has_electricity = (formData as any).has_electricity || false;
        propertyData.is_flat = (formData as any).is_flat || false;
        propertyData.has_fence = (formData as any).has_fence || false;
      }

      // Caractéristiques spécifiques aux commerces
      if (propertyType === 'shop') {
        propertyData.shop_type = (formData as any).shop_type || 'retail';
        propertyData.has_toilet = (formData as any).has_toilet || false;
        propertyData.has_storage = (formData as any).has_storage || false;
        propertyData.has_showcase = (formData as any).has_showcase || false;
        propertyData.has_ac = (formData as any).has_ac || false;
        propertyData.has_security_system = (formData as any).has_security_system || false;
      }

      if (house) {
        // Update existing property
        const { error } = await supabase
          .from('houses')
          .update(propertyData)
          .eq('id', house.id);

        if (error) throw error;
      } else {
        // Create new property
        const { error } = await supabase
          .from('houses')
          .insert([propertyData]);

        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error saving property:', err);
      setError(getSupabaseErrorMessage(err));
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
                  {getPriceLabel()}
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                  placeholder={getPricePlaceholder()}
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
                Adresse complète *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                placeholder="Ex: Rue des Jardins, près du marché"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Surface (m²) *
              </label>
              <input
                type="number"
                name="area_sqm"
                value={formData.area_sqm}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                placeholder="120"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Statut *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'taken' })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                required
              >
                <option value="available">Disponible</option>
                <option value="taken">Pris</option>
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
                  className={`inline-flex items-center px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-ci-orange-500 hover:bg-orange-50 transition ${uploadingVideo ? 'opacity-50 cursor-not-allowed' : ''
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



            {/* Champs spécifiques aux maisons et résidences */}
            {(propertyType === 'house' || propertyType === 'residence') && (
              <div className="bg-slate-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Caractéristiques du logement</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chambres</label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={(formData as any).bedrooms || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                      placeholder="3"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Salles de bain</label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={(formData as any).bathrooms || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                      placeholder="2"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Étage</label>
                    <input
                      type="number"
                      name="floor"
                      value={(formData as any).floor || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                      placeholder="1"
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="furnished"
                        checked={formData.furnished}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Meublé</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Équipements */}
                  <div>
                    <h4 className="text-md font-medium text-slate-800 mb-3">Équipements</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'air_conditioning', label: 'Climatisation' },
                        { name: 'heating', label: 'Chauffage' },
                        { name: 'hot_water', label: 'Eau chaude' },
                        { name: 'internet', label: 'Internet' },
                        { name: 'elevator', label: 'Ascenseur' },
                      ].map((item) => (
                        <label key={item.name} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name={item.name}
                            checked={formData[item.name as keyof typeof formData] as boolean}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                          />
                          <span className="text-slate-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium text-slate-800 mb-3">Extérieur</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'balcony', label: 'Balcon' },
                        { name: 'garden', label: 'Jardin' },
                        { name: 'pool', label: 'Piscine' },
                      ].map((item) => (
                        <label key={item.name} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name={item.name}
                            checked={formData[item.name as keyof typeof formData] as boolean}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                          />
                          <span className="text-slate-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Champs spécifiques aux terrains */}
            {propertyType === 'land' && (
              <div className="bg-slate-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Caractéristiques du terrain</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type de terrain</label>
                  <select
                    name="land_type"
                    value={(formData as any).land_type || 'residential'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                  >
                    <option value="residential">Résidentiel</option>
                    <option value="commercial">Commercial</option>
                    <option value="agricultural">Agricole</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-slate-800 mb-3">Équipements</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'has_water', label: 'Accès à l\'eau' },
                        { name: 'has_electricity', label: 'Électricité disponible' },
                        { name: 'is_flat', label: 'Terrain plat' },
                        { name: 'has_fence', label: 'Clôturé' },
                      ].map((item) => (
                        <label key={item.name} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name={item.name}
                            checked={formData[item.name as keyof typeof formData] as boolean}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                          />
                          <span className="text-slate-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Champs spécifiques aux locaux commerciaux */}
            {propertyType === 'shop' && (
              <div className="bg-slate-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Caractéristiques du local commercial</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type de commerce</label>
                  <select
                    name="shop_type"
                    value={(formData as any).shop_type || 'retail'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                  >
                    <option value="retail">Commerce de détail</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="office">Bureau</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-slate-800 mb-3">Équipements</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'has_toilet', label: 'Toilettes' },
                        { name: 'has_storage', label: 'Local de stockage' },
                        { name: 'has_showcase', label: 'Vitrine' },
                        { name: 'has_ac', label: 'Climatisation' },
                        { name: 'has_security_system', label: 'Système de sécurité' },
                      ].map((item) => (
                        <label key={item.name} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            name={item.name}
                            checked={formData[item.name as keyof typeof formData] as boolean}
                            onChange={handleCheckboxChange}
                            className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                          />
                          <span className="text-slate-700">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Équipements généraux et Sécurité */}
            <div className="bg-slate-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Équipements généraux et Sécurité</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-slate-800 mb-3">Équipements généraux</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.parking}
                        onChange={(e) => setFormData({ ...formData, parking: e.target.checked })}
                        className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                      />
                      <span className="text-slate-700">Parking</span>
                    </label>
                  </div>
                </div>

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
                      <span className="text-slate-700">Caméras de sécurité</span>
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

                    {(propertyType === 'house' || propertyType === 'residence') && (
                      <>
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={(formData as any).alarm_system || false}
                            onChange={(e) => setFormData({ ...formData, alarm_system: e.target.checked })}
                            className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                          />
                          <span className="text-slate-700">Système d'alarme</span>
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={(formData as any).interphone || false}
                            onChange={(e) => setFormData({ ...formData, interphone: e.target.checked })}
                            className="w-4 h-4 text-ci-orange-600 rounded focus:ring-ci-orange-500"
                          />
                          <span className="text-slate-700">Interphone</span>
                        </label>
                      </>
                    )}
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
                  className={`inline-flex items-center px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-ci-orange-500 hover:bg-orange-50 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''
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
