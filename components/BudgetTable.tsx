
import React, { useState } from 'react';
import { TripSegment, Category, PaymentStatus, TripItem } from '../types';
import { CreditCard, MapPin, Tag, Calendar, DollarSign, Filter, Search, X } from 'lucide-react';

interface BudgetTableProps {
  segments: TripSegment[];
}

// Define the type for items with location info
type ItemWithLocation = TripItem & { cityName: string; countryName: string };

export const BudgetTable: React.FC<BudgetTableProps> = ({ segments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Flatten all items with their segment city
  const allItems: ItemWithLocation[] = segments.flatMap(segment => 
    segment.items.map(item => ({
      ...item,
      cityName: segment.city,
      countryName: segment.country
    }))
  ).sort((a, b) => (a.date > b.date ? 1 : -1));

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.cityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.paymentStatus === statusFilter;
    const matchesDate = dateFilter === '' || item.date === dateFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  // Group items by category for the "grouped" view
  const groupedByCategory = filteredItems.reduce((acc, item) => {
    const categoryKey = item.category as string;
    if (!acc[categoryKey]) acc[categoryKey] = [];
    acc[categoryKey].push(item);
    return acc;
  }, {} as Record<string, ItemWithLocation[]>);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="text-blue-500" />
            Consolidado de Gastos
          </h2>
          <p className="text-slate-500 text-sm">Gestiona todos los rubros de tu viaje en un solo lugar.</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar actividad o ciudad..." 
              className="pl-10 pr-4 py-2 w-full border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <div className="relative min-w-[160px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            <input 
              type="date" 
              className="pl-10 pr-8 py-2 w-full border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:light]"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select 
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">Todas las Categorías</option>
            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Status Filter */}
          <select 
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Destino</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Item / Actividad</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rubro</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Fecha</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Costo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(Object.entries(groupedByCategory) as [string, ItemWithLocation[]][]).map(([category, items]) => (
                <React.Fragment key={category}>
                  {/* Group Header Row */}
                  <tr className="bg-slate-50/50">
                    <td colSpan={6} className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-blue-500" />
                        <span className="text-sm font-bold text-slate-700">{category}</span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                          {items.length} {items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Item Rows */}
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.cityName}</p>
                            <p className="text-xs text-slate-400">{item.countryName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        {item.notes && <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.notes}</p>}
                      </td>
                      <td className="px-6 py-4">
                         <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
                           {item.category}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-sm text-slate-600">{item.date}</p>
                        <p className="text-xs text-slate-400">{item.time || '--:--'}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-bold text-slate-900">
                          {item.cost > 0 ? `$${item.cost.toLocaleString()}` : '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {item.paymentStatus === PaymentStatus.PAID ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                              <DollarSign size={12} /> PAGADO
                            </span>
                          ) : item.paymentStatus === PaymentStatus.PENDING ? (
                            <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                              PENDIENTE
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                              PARCIAL
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                    <Filter className="mx-auto mb-2 opacity-20" size={48} />
                    <p>No se encontraron ítems que coincidan con los filtros.</p>
                  </td>
                </tr>
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white">
                  <td colSpan={4} className="px-6 py-4 text-right font-bold uppercase text-xs tracking-widest">Inversión Total en Viaje</td>
                  <td className="px-6 py-4 text-right text-lg font-bold">
                    ${filteredItems.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
           <p className="text-xs font-bold text-green-700 uppercase mb-1">Total Pagado</p>
           <h4 className="text-xl font-bold text-green-900">
             ${filteredItems.filter(i => i.paymentStatus === PaymentStatus.PAID).reduce((sum, i) => sum + i.cost, 0).toLocaleString()}
           </h4>
        </div>
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
           <p className="text-xs font-bold text-orange-700 uppercase mb-1">Total Pendiente</p>
           <h4 className="text-xl font-bold text-orange-900">
             ${filteredItems.filter(i => i.paymentStatus === PaymentStatus.PENDING).reduce((sum, i) => sum + i.cost, 0).toLocaleString()}
           </h4>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
           <p className="text-xs font-bold text-blue-700 uppercase mb-1">Promedio por Item</p>
           <h4 className="text-xl font-bold text-blue-900">
             ${filteredItems.length > 0 ? (filteredItems.reduce((sum, i) => sum + i.cost, 0) / filteredItems.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
           </h4>
        </div>
      </div>
    </div>
  );
};
