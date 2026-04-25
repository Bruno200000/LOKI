import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, House } from '../../lib/supabase';
import { X, AlertCircle, CheckCircle, Upload, Loader, FileText } from 'lucide-react';

const BOUAKE_NEIGHBORHOODS = [
  "Aéroport", "Ahougnanssou", "Air France 1", "Air France 2", "Air France 3",
  "Allokokro", "Attienkro", "Beaufort", "Belleville 1", "Belleville 2",
  "Broukro 1", "Broukro 2", "Camp Militaire", "Commerce", "Dar-es-Salam 1",
  "Dar-es-Salam 2", "Dar-es-Salam 3", "Dougouba", "Gonfreville", "Houphouët-Ville",
  "IDESSA", "Kamounoukro", "Kanakro", "Kennedy", "Koko", "Kodiakoffikro",
  "Konankankro", "Liberté", "Lycée Municipal", "Mamianou", "N'Dakro",
  "N'Gattakro", "N'Gouatanoukro", "Niankoukro", "Nimbo", "Sokoura",
  "Tièrèkro", "Tolla Kouadiokro", "Zone Industrielle",
];

const ABIDJAN_NEIGHBORHOODS = [
  "Abobo", "Adjamé", "Anyama", "Attécoubé", "Bingerville",
  "Cocody - Angré", "Cocody - Deux Plateaux", "Cocody - M'Pouto", "Cocody - Palmeraie",
  "Cocody - Riviera 1", "Cocody - Riviera 2", "Cocody - Riviera 3", "Cocody - Riviera 4",
  "Cocody - Riviera Faya", "Koumassi", "Marcory - Biétry", "Marcory - Résidentiel",
  "Marcory - Zone 4", "Plateau", "Port-Bouët", "Songon", "Treichville",
  "Yopougon - Maroc", "Yopougon - Niangon", "Yopougon - Selmer",
];

const NEIGHBORHOODS_BY_CITY: Record<string, string[]> = {
  "Bouaké": BOUAKE_NEIGHBORHOODS,
  "Abidjan": ABIDJAN_NEIGHBORHOODS,
};

interface HouseFormProps {
  house?: House | null;
  onClose: () => void;
  onSuccess: () => void;
  propertyType: 'residence' | 'house' | 'land' | 'shop';
}

export const HouseForm = ({ house, onClose, onSuccess, propertyType }: HouseFormProps): JSX.Element => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
      description_documents: [] as Array<{ url: string, name: string, type: 'image' | 'document' }>,

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

    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Veuillez sélectionner une vidéo valide');
      return;
    }

    // Limite pour les vidéos (50MB standard, 100MB pour PRO)
    const maxVideoSize = profile?.plan === 'pro' ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxVideoSize) {
      setError(`La vidéo ne doit pas dépasser ${profile?.plan === 'pro' ? '100MB' : '50MB'}.`);
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

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxDocuments = 5;
    const currentDocuments = (formData as any).description_documents?.length || 0;
    const availableSlots = maxDocuments - currentDocuments;

    if (files.length > availableSlots) {
      setError(`Vous ne pouvez ajouter que ${availableSlots} document(s) supplémentaire(s)`);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const newDocuments: Array<{ url: string, name: string, type: 'image' | 'document' }> = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Vérifier le type de fichier (images et documents PDF)
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          setError('Veuillez sélectionner uniquement des images (JPG, PNG, GIF, WebP) ou des documents (PDF, DOC, DOCX)');
          return;
        }

        // Vérifier la taille (max 10MB pour les documents)
        if (file.size > 10 * 1024 * 1024) {
          setError('Chaque document ne doit pas dépasser 10MB');
          return;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `doc-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        // Upload vers Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('house-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data } = supabase.storage
          .from('house-media')
          .getPublicUrl(filePath);

        newDocuments.push({
          url: data.publicUrl,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'document'
        });
      }

      // Mettre à jour le formulaire avec les nouveaux documents
      const currentDocuments = (formData as any).description_documents || [];
      setFormData({
        ...formData,
        description_documents: [...currentDocuments, ...newDocuments]
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload des documents');
    } finally {
      setLoading(false);
    }
  };

  const removeDocument = (index: number) => {
    const currentDocuments = (formData as any).description_documents || [];
    const newDocuments = currentDocuments.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, description_documents: newDocuments });
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

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.title && formData.price && formData.description && formData.city && formData.neighborhood && formData.location && formData.area_sqm;
    }
    if (currentStep === 2) {
      // Au moins une image est recommandée mais pas strictement bloquante par la BDD
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setCurrentStep(prev => prev + 1);
    } else {
      setError('Veuillez remplir tous les champs obligatoires (*) avant de continuer.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        description_documents: (formData as any).description_documents && (formData as any).description_documents.length > 0 ? (formData as any).description_documents : null,

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

      const performSave = async () => {
        if (house) {
          return await supabase
            .from('houses')
            .update(propertyData)
            .eq('id', house.id);
        } else {
          return await supabase
            .from('houses')
            .insert([propertyData]);
        }
      };

      let { error } = await performSave();

      // Si erreur de clé étrangère (profil manquant), on essaie de créer le profil
      if (error && (error.code === '23503' || error.message?.includes('violates foreign key constraint'))) {
        console.log('Profil manquant détecté, tentative de création...');

        // Création du profil manquant
        const { error: createProfileError } = await supabase
          .from('profiles')
          .upsert([{
            id: profile.id,
            email: profile.email || undefined,
            full_name: profile.full_name || 'Utilisateur',
            role: profile.role || 'owner',
            city: profile.city || (formData.city === 'Bouaké' ? 'Bouaké' : 'Abidjan'), // Fallback sur la ville du bien
            created_at: new Date().toISOString()
          }]);

        if (!createProfileError) {
          // Retry save after profile creation
          const retryResult = await performSave();
          error = retryResult.error;
        } else {
          console.error('Erreur lors de la création du profil automatique:', createProfileError);
        }
      }

      if (error) throw error;

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

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-ci-orange-600 uppercase tracking-widest">Étape {currentStep} sur 3</span>
              <span className="text-xs font-bold text-slate-500">{currentStep === 1 ? 'Informations de base' : currentStep === 2 ? 'Médias & Visibilité' : 'Détails & Équipements'}</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-ci-orange-600 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* STEP 1: BASE INFO */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Titre de l'annonce *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition shadow-sm"
                    placeholder="Ex: Villa de luxe avec piscine à Cocody"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{getPriceLabel()}</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition shadow-sm"
                      placeholder={getPricePlaceholder()}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Surface (m²) *</label>
                    <input
                      type="number"
                      name="area_sqm"
                      value={formData.area_sqm}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition shadow-sm"
                      placeholder="120"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Ville *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value, neighborhood: '' })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition shadow-sm"
                      required
                    >
                      <option value="Abidjan">Abidjan</option>
                      <option value="Bouaké">Bouaké</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Quartier *</label>
                    <select
                      value={formData.neighborhood}
                      onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition shadow-sm"
                      required
                    >
                      <option value="">Sélectionner</option>
                      {(NEIGHBORHOODS_BY_CITY[formData.city] || []).map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Adresse précise / Point de repère *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition shadow-sm"
                    placeholder="Ex: Rue des Jardins, près de la pharmacie..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Statut de disponibilité *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'available' | 'taken' })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition shadow-sm"
                    required
                  >
                    <option value="available">Disponible immédiatement</option>
                    <option value="taken">Déjà loué / occupé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description détaillée *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition shadow-sm"
                    rows={4}
                    placeholder="Décrivez les atouts de votre bien..."
                    required
                  />
                </div>
              </div>
            )}

            {/* STEP 2: MEDIA */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">Photos de la propriété (Max 6)</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square group overflow-hidden rounded-2xl border border-slate-200">
                        <img src={photo} alt="" className="w-full h-full object-cover transition transform group-hover:scale-110" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.photos.length < 6 && (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-ci-orange-500 hover:bg-orange-50 transition group transition-all">
                        <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} className="hidden" />
                        <div className="bg-slate-100 p-3 rounded-full group-hover:bg-ci-orange-100 transition">
                          <Upload className="w-6 h-6 text-slate-400 group-hover:text-ci-orange-600" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-wide group-hover:text-ci-orange-600">Ajouter</span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    Vidéo (MP4, WebM - Max {profile?.plan === 'pro' ? '100MB' : '50MB'})
                    {profile?.plan !== 'pro' && (
                      <span className="bg-ci-orange-100 text-ci-orange-600 text-[10px] px-2 py-0.5 rounded-full font-black">STANDARD</span>
                    )}
                  </label>
                  
                  {formData.video_url ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video mb-4">
                      <video src={formData.video_url} controls className="w-full h-full" />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, video_url: ''})}
                        className="absolute top-2 right-2 bg-black/50 text-white hover:bg-red-600 p-2 rounded-full backdrop-blur-sm transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-ci-orange-500 hover:bg-white transition group">
                      <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploadingVideo} />
                      {uploadingVideo ? (
                        <Loader className="w-10 h-10 animate-spin text-ci-orange-600" />
                      ) : (
                        <>
                          <div className="bg-ci-orange-50 p-4 rounded-full mb-3 group-hover:scale-110 transition">
                            <Upload className="w-8 h-8 text-ci-orange-600" />
                          </div>
                          <p className="font-bold text-slate-900">Cliquez pour télécharger</p>
                          <p className="text-xs text-slate-500 mt-1">Format recommandé: MP4 Portrait ou Paysage</p>
                        </>
                      )}
                    </label>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700">Documents descriptifs (PDF, DOC)</label>
                  <div className="flex flex-wrap gap-3">
                    {(formData as any).description_documents?.map((doc: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm shadow-sm group">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="truncate max-w-[120px] font-medium">{doc.name}</span>
                        <button type="button" onClick={() => removeDocument(index)} className="text-slate-300 hover:text-red-600 transition">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(formData as any).description_documents?.length < 5 && (
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl cursor-pointer transition text-xs font-bold uppercase tracking-wider">
                        <input type="file" multiple onChange={handleDocumentUpload} className="hidden" />
                        <Upload className="w-3 h-3" /> Ajouter document
                      </label>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Lien de visite virtuelle (URL)</label>
                  <input
                    type="url"
                    value={formData.virtual_tour_url}
                    onChange={(e) => setFormData({ ...formData, virtual_tour_url: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition shadow-sm"
                    placeholder="https://my.matterport.com/show/?m=..."
                  />
                  <p className="text-[10px] text-slate-500 mt-2 italic">Permet aux clients de visiter votre bien à distance.</p>
                </div>
              </div>
            )}

            {/* STEP 3: FEATURES */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Specific fields based on type */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Caractéristiques</h3>
                    
                    {(propertyType === 'house' || propertyType === 'residence') && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Chambres</label>
                            <input type="number" name="bedrooms" value={(formData as any).bedrooms} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 py-2 focus:border-ci-orange-500 outline-none font-bold" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Salles de bain</label>
                            <input type="number" name="bathrooms" value={(formData as any).bathrooms} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 py-2 focus:border-ci-orange-500 outline-none font-bold" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Étage</label>
                          <input type="number" name="floor" value={(formData as any).floor} onChange={handleInputChange} className="w-full bg-transparent border-b border-slate-300 py-2 focus:border-ci-orange-500 outline-none font-bold" placeholder="0 pour RDC" />
                        </div>
                        <label className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl cursor-pointer hover:shadow-sm transition">
                          <input type="checkbox" name="furnished" checked={formData.furnished} onChange={handleCheckboxChange} className="w-5 h-5 text-ci-orange-600 rounded" />
                          <span className="text-sm font-bold text-slate-700">Meublé</span>
                        </label>
                      </div>
                    )}

                    {propertyType === 'land' && (
                       <div className="space-y-4">
                          <select name="land_type" value={(formData as any).land_type} onChange={handleInputChange} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold">
                            <option value="residential">Résidentiel</option>
                            <option value="commercial">Commercial</option>
                            <option value="agricultural">Agricole</option>
                          </select>
                          {['has_water', 'has_electricity', 'is_flat', 'has_fence'].map(key => (
                             <label key={key} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl cursor-pointer">
                                <input type="checkbox" name={key} checked={(formData as any)[key]} onChange={handleCheckboxChange} className="w-5 h-5 text-ci-orange-600 rounded" />
                                <span className="text-sm font-bold text-slate-700">{key === 'has_water' ? 'Eau' : key === 'has_electricity' ? 'Électricité' : key === 'is_flat' ? 'Terrain plat' : 'Clôturé'}</span>
                             </label>
                          ))}
                       </div>
                    )}
                  </div>

                  {/* General Amenities */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Equipements & Sécurité</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { name: 'parking', label: 'Parking' },
                        { name: 'security_cameras', label: 'Vidéosurveillance' },
                        { name: 'guardian', label: 'Gardiennage' },
                        { name: 'air_conditioning', label: 'Climatisation' },
                        { name: 'internet', label: 'WiFi Haut Débit' },
                      ].map((item) => (
                        <label key={item.name} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition group">
                          <input
                            type="checkbox"
                            name={item.name}
                            checked={(formData as any)[item.name]}
                            onChange={handleCheckboxChange}
                            className="w-5 h-5 text-ci-orange-600 rounded border-slate-300 focus:ring-ci-orange-500"
                          />
                          <span className="text-sm font-bold text-slate-700 group-hover:text-ci-orange-600 transition">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-12 pt-6 border-t border-slate-200">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-8 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition shadow-sm"
                >
                  Précédent
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-xl transform active:scale-95"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-ci-orange-600 to-ci-orange-700 hover:from-ci-orange-700 hover:to-ci-orange-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-xl shadow-ci-orange-200 transform active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : (house ? 'Mettre à jour' : 'Publier l\'annonce')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
