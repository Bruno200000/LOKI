import React, { useState } from 'react';
import { HouseForm } from './HouseForm';
import { House } from '../../lib/supabase';

type PropertyType = 'residence' | 'house' | 'land' | 'shop';

interface PropertyFormProps {
  house?: House | null;
  onClose: () => void;
  onSuccess: () => void;
}

const propertyTypes = [
  { value: 'house', label: 'Maison', icon: '🏠' },
  { value: 'residence', label: 'Résidence', icon: '🏢' },
  { value: 'land', label: 'Terrain', icon: '🌳' },
  { value: 'shop', label: 'Local commercial', icon: '🏪' },
];

export const PropertyForm: React.FC<PropertyFormProps> = ({ house, onClose, onSuccess }) => {
  const [propertyType, setPropertyType] = useState<PropertyType>(
    (house?.type as PropertyType) || 'house'
  );
  const [showForm, setShowForm] = useState(!!house);

  const handleTypeSelect = (type: PropertyType) => {
    setPropertyType(type);
    setShowForm(true);
  };

  const renderTypeSelector = () => (
    <div className="text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Sélectionnez le type de bien</h3>
      <div className="grid grid-cols-2 gap-4">
        {propertyTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => handleTypeSelect(type.value as PropertyType)}
            className={`p-6 border-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center h-32
              ${propertyType === type.value 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
          >
            <span className="text-3xl mb-2">{type.icon}</span>
            <span className="font-medium text-gray-900">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="space-y-6">
      {!house && (
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setShowForm(false)}
            className="mr-4 text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-medium text-gray-900">
            {propertyType === 'house' && 'Ajouter une maison'}
            {propertyType === 'residence' && 'Ajouter une résidence'}
            {propertyType === 'land' && 'Ajouter un terrain'}
            {propertyType === 'shop' && 'Ajouter un local commercial'}
          </h3>
        </div>
      )}
      <HouseForm 
        house={house} 
        onClose={onClose} 
        onSuccess={onSuccess}
        propertyType={propertyType}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {house ? 'Modifier le bien' : 'Ajouter un nouveau bien'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {!showForm ? renderTypeSelector() : renderForm()}
        </div>
      </div>
    </div>
  );
};
