import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  value2?: number;
}

interface StatsChartProps {
  data: ChartData[];
  title: string;
  type: 'line' | 'bar';
  dataKey: string;
  dataKey2?: string;
  color: string;
  color2?: string;
}

export const StatsChart: React.FC<StatsChartProps> = ({ 
  data, 
  title, 
  type, 
  dataKey, 
  dataKey2, 
  color, 
  color2 
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
              name={dataKey}
            />
            {dataKey2 && (
              <Line 
                type="monotone" 
                dataKey={dataKey2} 
                stroke={color2 || '#8884d8'} 
                strokeWidth={2}
                dot={{ fill: color2 || '#8884d8', r: 4 }}
                activeDot={{ r: 6 }}
                name={dataKey2}
              />
            )}
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar dataKey={dataKey} fill={color} name={dataKey} radius={[8, 8, 0, 0]} />
            {dataKey2 && (
              <Bar dataKey={dataKey2} fill={color2 || '#8884d8'} name={dataKey2} radius={[8, 8, 0, 0]} />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// Composant pour le graphique des réservations mensuelles
export const BookingsChart: React.FC<{ data: ChartData[] }> = ({ data }) => (
  <StatsChart
    data={data}
    title="Évolution des Réservations"
    type="line"
    dataKey="réservations"
    color="#3b82f6"
  />
);

// Composant pour le graphique des revenus
export const RevenueChart: React.FC<{ data: ChartData[] }> = ({ data }) => (
  <StatsChart
    data={data}
    title="Revenus Mensuels (FCFA)"
    type="bar"
    dataKey="revenus"
    color="#10b981"
  />
);

// Composant pour le graphique des types de propriétés
export const PropertyTypesChart: React.FC<{ data: ChartData[] }> = ({ data }) => (
  <StatsChart
    data={data}
    title="Répartition des Types de Propriétés"
    type="bar"
    dataKey="nombre"
    color="#f59e0b"
  />
);

// Composant pour le graphique des utilisateurs
export const UsersChart: React.FC<{ data: ChartData[] }> = ({ data }) => (
  <StatsChart
    data={data}
    title="Évolution des Utilisateurs"
    type="line"
    dataKey="propriétaires"
    dataKey2="locataires"
    color="#8b5cf6"
    color2="#ec4899"
  />
);

// Données par défaut pour les graphiques
export const generateMockData = (): {
  bookingsData: ChartData[];
  revenueData: ChartData[];
  propertyTypesData: ChartData[];
  usersData: ChartData[];
} => {
  return {
    bookingsData: [
      { name: 'Jan', value: 12 },
      { name: 'Fév', value: 19 },
      { name: 'Mar', value: 25 },
      { name: 'Avr', value: 32 },
      { name: 'Mai', value: 28 },
      { name: 'Jun', value: 35 },
    ],
    revenueData: [
      { name: 'Jan', value: 2400000 },
      { name: 'Fév', value: 3800000 },
      { name: 'Mar', value: 5000000 },
      { name: 'Avr', value: 6400000 },
      { name: 'Mai', value: 5600000 },
      { name: 'Jun', value: 7000000 },
    ],
    propertyTypesData: [
      { name: 'Résidence', value: 45 },
      { name: 'Maison', value: 32 },
      { name: 'Terrain', value: 18 },
      { name: 'Boutique', value: 25 },
    ],
    usersData: [
      { name: 'Jan', value: 120, value2: 280 },
      { name: 'Fév', value: 145, value2: 320 },
      { name: 'Mar', value: 168, value2: 385 },
      { name: 'Avr', value: 195, value2: 420 },
      { name: 'Mai', value: 210, value2: 465 },
      { name: 'Jun', value: 235, value2: 510 },
    ],
  };
};
