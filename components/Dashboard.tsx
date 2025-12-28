import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TripSegment, PaymentStatus, Category } from '../types';
import { Wallet, Calendar, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardProps {
  segments: TripSegment[];
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

export const Dashboard: React.FC<DashboardProps> = ({ segments }) => {
  const allItems = segments.flatMap(s => s.items);
  
  const totalCost = allItems.reduce((acc, item) => acc + item.cost, 0);
  const paidAmount = allItems
    .filter(item => item.paymentStatus === PaymentStatus.PAID)
    .reduce((acc, item) => acc + item.cost, 0);
  
  const pendingAmount = totalCost - paidAmount;
  const percentPaid = totalCost > 0 ? Math.round((paidAmount / totalCost) * 100) : 0;

  // Data for chart
  const costByCategory = allItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.cost;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(costByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Budget Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Presupuesto Total</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">${totalCost.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-600">
            <span className="font-medium text-green-600">${paidAmount.toLocaleString()} pagado</span>
            <span className="mx-2">•</span>
            <span className="font-medium text-orange-500">${pendingAmount.toLocaleString()} pendiente</span>
          </div>
        </div>

        {/* Days Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Duración del Viaje</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {segments.length > 0 ? 
                  Math.ceil((new Date(segments[segments.length-1].departureDate).getTime() - new Date(segments[0].arrivalDate).getTime()) / (1000 * 3600 * 24)) 
                  : 0} días
              </h3>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            {segments.length} Ciudades planificadas
          </div>
        </div>

         {/* Status Card */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Estado de Pagos</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{percentPaid}%</h3>
            </div>
            <div className={`p-2 rounded-lg ${percentPaid === 100 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
              {percentPaid === 100 ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
            <div 
              className="bg-slate-800 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${percentPaid}%` }}
            ></div>
          </div>
        </div>

        {/* Next Stop */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Próximo Destino</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1 truncate">
                {segments.length > 0 ? segments[0].city : 'Sin plan'}
              </h3>
            </div>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
              <MapPin size={20} />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-600 truncate">
             {segments.length > 0 ? `${segments[0].country}` : 'Agrega un destino'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Gastos por Categoría</h4>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No hay gastos registrados aún.
            </div>
          )}
        </div>

        {/* Quick List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-96 overflow-y-auto">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Resumen de Ruta</h4>
          <div className="space-y-4">
            {segments.map((seg, idx) => (
              <div key={seg.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-100 rounded-lg text-slate-600 font-bold text-lg">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-slate-900">{seg.city}, {seg.country}</h5>
                  <p className="text-sm text-slate-500">{seg.arrivalDate} - {seg.departureDate}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {seg.items.length} items
                  </span>
                </div>
              </div>
            ))}
            {segments.length === 0 && (
              <p className="text-slate-500 text-center mt-10">Comienza agregando ciudades en la pestaña Itinerario.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};