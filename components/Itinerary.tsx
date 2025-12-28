
import React, { useState, useEffect } from 'react';
import { TripSegment, TripItem, Category, PaymentStatus } from '../types';
import { Plus, Trash2, Plane, Train, Bus, Bed, Utensils, Camera, Map, MoreHorizontal, DollarSign, Pencil, MapPin, Calendar as CalendarIcon, AlertCircle, MessageSquare, Check, X } from 'lucide-react';

interface ItineraryProps {
  segments: TripSegment[];
  onAddSegment: (segment: TripSegment) => void;
  onAddItem: (segmentId: string, item: TripItem) => void;
  onUpdateItem: (segmentId: string, item: TripItem) => void;
  onDeleteItem: (segmentId: string, itemId: string) => void;
  onDeleteSegment: (id: string) => void;
}

const CategoryIcon = ({ category }: { category: Category }) => {
  switch (category) {
    case Category.FLIGHT: return <Plane size={16} />;
    case Category.TRAIN: return <Train size={16} />;
    case Category.BUS: return <Bus size={16} />;
    case Category.HOTEL: return <Bed size={16} />;
    case Category.DINING: return <Utensils size={16} />;
    case Category.ACTIVITY: return <Camera size={16} />;
    case Category.MUSEUM: return <Map size={16} />;
    default: return <MoreHorizontal size={16} />;
  }
};

export const Itinerary: React.FC<ItineraryProps> = ({ segments, onAddSegment, onAddItem, onUpdateItem, onDeleteItem, onDeleteSegment }) => {
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCity, setNewCity] = useState({ city: '', country: '', arrivalDate: '', departureDate: '' });

  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [costInputValue, setCostInputValue] = useState<string>('0');
  const [costError, setCostError] = useState<string | null>(null);
  const [isPaidActivity, setIsPaidActivity] = useState<boolean>(true);

  const [newItem, setNewItem] = useState<Partial<TripItem>>({
    category: Category.ACTIVITY,
    paymentStatus: PaymentStatus.PENDING,
    currency: 'USD',
    cost: 0,
    notes: ''
  });

  const handleCostChange = (val: string) => {
    setCostInputValue(val);
    if (val === '') {
      setCostError(null);
      return;
    }
    // Validación: solo números y punto decimal
    if (!/^\d*\.?\d*$/.test(val)) {
      setCostError('No se puede ingresar texto en el costo, solo números.');
    } else {
      setCostError(null);
    }
  };

  // Fix: Added handleAddCity function to process the new destination form
  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.city || !newCity.arrivalDate || !newCity.departureDate) return;

    onAddSegment({
      id: crypto.randomUUID(),
      city: newCity.city,
      country: newCity.country,
      arrivalDate: newCity.arrivalDate,
      departureDate: newCity.departureDate,
      items: []
    });

    setNewCity({ city: '', country: '', arrivalDate: '', departureDate: '' });
    setShowAddCity(false);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSegmentId || !newItem.title) return;
    
    const finalCost = isPaidActivity || newItem.category !== Category.ACTIVITY ? Number(costInputValue) : 0;
    
    if (isNaN(finalCost) && (isPaidActivity || newItem.category !== Category.ACTIVITY)) {
      setCostError('No se puede ingresar texto en el costo, solo números.');
      return;
    }

    const itemData: TripItem = {
      id: editingItemId || crypto.randomUUID(),
      title: newItem.title!,
      category: newItem.category as Category,
      date: newItem.date || '',
      time: newItem.time || '',
      location: newItem.location || '',
      cost: finalCost,
      currency: newItem.currency || 'USD',
      paymentStatus: (isPaidActivity || newItem.category !== Category.ACTIVITY) ? (newItem.paymentStatus as PaymentStatus) : PaymentStatus.PAID,
      notes: newItem.notes || '',
      duration: newItem.duration || '',
      bookingReference: newItem.bookingReference || ''
    };

    if (editingItemId) {
      onUpdateItem(activeSegmentId, itemData);
    } else {
      onAddItem(activeSegmentId, itemData);
    }

    resetItemForm();
  };

  const startEditing = (segmentId: string, item: TripItem) => {
    setActiveSegmentId(segmentId);
    setEditingItemId(item.id);
    setCostInputValue(item.cost.toString());
    setIsPaidActivity(item.cost > 0 || item.category !== Category.ACTIVITY);
    setNewItem({
      title: item.title,
      category: item.category,
      date: item.date,
      time: item.time,
      location: item.location,
      cost: item.cost,
      currency: item.currency,
      paymentStatus: item.paymentStatus,
      notes: item.notes,
      duration: item.duration,
      bookingReference: item.bookingReference
    });
  };

  const resetItemForm = () => {
    setActiveSegmentId(null);
    setEditingItemId(null);
    setCostInputValue('0');
    setCostError(null);
    setIsPaidActivity(true);
    setNewItem({ 
      category: Category.ACTIVITY, 
      paymentStatus: PaymentStatus.PENDING, 
      currency: 'USD', 
      cost: 0,
      notes: ''
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 px-2 md:px-0">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           <Map className="text-blue-500" size={20} /> Itinerario
        </h2>
        <button 
          onClick={() => setShowAddCity(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition flex items-center gap-2 text-sm font-bold shadow-md active:scale-95"
        >
          <Plus size={18} /> Destino
        </button>
      </div>

      {showAddCity && (
        <form onSubmit={handleAddCity} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
          <h3 className="font-bold mb-6 text-lg text-slate-900 flex items-center gap-2">
            <MapPin size={18} className="text-blue-500" /> Nuevo Destino
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Ciudad</label>
              <input 
                required
                placeholder="Ej. Madrid" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={newCity.city}
                onChange={e => setNewCity({...newCity, city: e.target.value})}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">País</label>
              <input 
                placeholder="Ej. España" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={newCity.country}
                onChange={e => setNewCity({...newCity, country: e.target.value})}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Llegada</label>
              <input 
                required
                type="date" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 [color-scheme:light] focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={newCity.arrivalDate}
                onChange={e => setNewCity({...newCity, arrivalDate: e.target.value})}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Salida</label>
              <input 
                required
                type="date" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 [color-scheme:light] focus:ring-2 focus:ring-blue-500 outline-none transition"
                value={newCity.departureDate}
                onChange={e => setNewCity({...newCity, departureDate: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={() => setShowAddCity(false)} className="text-slate-500 hover:text-slate-700 font-bold px-4 py-2 transition">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-bold transition shadow-lg shadow-blue-200 active:scale-95">Guardar Destino</button>
          </div>
        </form>
      )}

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
        {segments.map((segment) => (
          <div key={segment.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-blue-600 text-white shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
               <MapPin size={18} />
            </div>

            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="font-bold text-slate-900 text-lg leading-tight">{segment.city}, {segment.country}</h3>
                   <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mt-1 bg-slate-50 w-fit px-2 py-1 rounded-md">
                     <CalendarIcon size={12} className="text-slate-600" />
                     <span>{segment.arrivalDate} al {segment.departureDate}</span>
                   </div>
                </div>
                <button 
                  onClick={() => onDeleteSegment(segment.id)}
                  className="text-slate-300 hover:text-red-500 p-1 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-3">
                {segment.items.sort((a,b) => (a.date > b.date ? 1 : -1)).map(item => (
                  <div key={item.id} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100 group/item hover:bg-white hover:border-blue-200 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg text-white shrink-0 shadow-sm ${
                        item.category === Category.FLIGHT ? 'bg-sky-500' :
                        item.category === Category.HOTEL ? 'bg-indigo-500' :
                        item.category === Category.ACTIVITY ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}>
                        <CategoryIcon category={item.category} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] mt-1">
                          <span className="text-slate-500 font-bold">{item.date} {item.time}</span>
                          {item.cost > 0 && (
                            <span className={`px-2 py-0.5 rounded-full font-bold border ${item.paymentStatus === PaymentStatus.PAID ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                              ${item.cost.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <button onClick={() => startEditing(segment.id, item)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => onDeleteItem(segment.id, item.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="mt-2 pl-11 flex gap-2 items-start opacity-70">
                         <MessageSquare size={12} className="text-slate-400 mt-0.5" />
                         <p className="text-[11px] text-slate-600 italic line-clamp-2">{item.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {activeSegmentId === segment.id ? (
                  <div className="mt-4 p-5 bg-white border-2 border-blue-500 rounded-2xl shadow-2xl animate-in zoom-in-95">
                    <h4 className="font-bold text-slate-900 mb-4 text-base flex items-center gap-2">
                       {editingItemId ? <Pencil size={16} /> : <Plus size={16} />}
                       {editingItemId ? 'Editar Item' : 'Agregar Actividad'}
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre / Título</label>
                        <input 
                          placeholder="Ej. Vuelo a Paris, Museo del Prado..." 
                          className="p-3 rounded-xl border border-slate-200 text-slate-900 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          value={newItem.title || ''}
                          onChange={e => setNewItem({...newItem, title: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Categoría</label>
                          <select 
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newItem.category}
                            onChange={e => {
                              const cat = e.target.value as Category;
                              setNewItem({...newItem, category: cat});
                              if (cat !== Category.ACTIVITY) setIsPaidActivity(true);
                            }}
                          >
                            {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col">
                           <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Fecha</label>
                           <input 
                            type="date" 
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm [color-scheme:light] focus:ring-2 focus:ring-blue-500 outline-none" 
                            value={newItem.date || ''} 
                            onChange={e => setNewItem({...newItem, date: e.target.value})} 
                           />
                        </div>
                      </div>

                      {newItem.category === Category.ACTIVITY && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                           <span className="text-sm font-bold text-slate-700">¿Es paga?</span>
                           <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-inner">
                              <button 
                                type="button"
                                onClick={() => setIsPaidActivity(true)}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${isPaidActivity ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
                              >
                                SÍ
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setIsPaidActivity(false);
                                  setCostInputValue('0');
                                }}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${!isPaidActivity ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}
                              >
                                NO
                              </button>
                           </div>
                        </div>
                      )}

                      {(isPaidActivity || newItem.category !== Category.ACTIVITY) && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Estado</label>
                            <select 
                              className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              value={newItem.paymentStatus}
                              onChange={e => setNewItem({...newItem, paymentStatus: e.target.value as PaymentStatus})}
                            >
                              {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="flex flex-col">
                             <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Monto USD</label>
                             <div className="relative">
                               <input 
                                type="text" 
                                placeholder="0.00" 
                                className={`w-full p-3 pr-8 rounded-xl border ${costError ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'} text-sm focus:ring-2 focus:ring-blue-500 outline-none`} 
                                value={costInputValue} 
                                onChange={e => handleCostChange(e.target.value)} 
                               />
                               <DollarSign size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                             </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1">Comentarios</label>
                        <textarea 
                          placeholder="Añade notas, reservas o detalles..." 
                          rows={2}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          value={newItem.notes || ''}
                          onChange={e => setNewItem({...newItem, notes: e.target.value})}
                        />
                      </div>

                      {costError && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-600 text-[10px] font-bold animate-bounce">
                          <AlertCircle size={14} />
                          {costError}
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={handleSaveItem} 
                          disabled={!!costError}
                          className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
                        >
                          Guardar
                        </button>
                        <button onClick={resetItemForm} className="px-4 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition">Cancelar</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                        resetItemForm();
                        setActiveSegmentId(segment.id);
                    }}
                    className="w-full py-3 mt-2 text-xs font-bold text-blue-600 border-2 border-dashed border-blue-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition active:scale-[0.98]"
                  >
                    + Agregar Item o Actividad
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {segments.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm w-full relative z-10">
             <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Map size={40} />
             </div>
             <h3 className="text-2xl font-black text-slate-900">Planifica tu Viaje</h3>
             <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm leading-relaxed">Organiza tus destinos en Europa y gestiona cada reserva con inteligencia artificial.</p>
             <button 
                onClick={() => setShowAddCity(true)}
                className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-slate-800 transition font-black shadow-xl active:scale-95"
             >
                Agregar mi primer destino
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
