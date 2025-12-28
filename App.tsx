
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Map, CreditCard, Plane, Download, Upload, Trash2, Settings } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Itinerary } from './components/Itinerary';
import { BudgetTable } from './components/BudgetTable';
import { TripSegment, TripItem } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'itinerary' | 'table' | 'settings'>('dashboard');
  const [segments, setSegments] = useState<TripSegment[]>(() => {
    const saved = localStorage.getItem('europlan_local_v2');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('europlan_local_v2', JSON.stringify(segments));
  }, [segments]);

  // Handlers de Datos
  const addSegment = (segment: TripSegment) => {
    setSegments(prev => [...prev, segment].sort((a,b) => a.arrivalDate > b.arrivalDate ? 1 : -1));
  };

  const deleteSegment = (id: string) => {
    if(window.confirm('¿Eliminar este destino y todos sus datos?')) {
      setSegments(prev => prev.filter(s => s.id !== id));
    }
  };

  const addItem = (segmentId: string, item: TripItem) => {
    setSegments(prev => prev.map(seg => seg.id === segmentId ? { ...seg, items: [...seg.items, item] } : seg));
  };

  const updateItem = (segmentId: string, updatedItem: TripItem) => {
    setSegments(prev => prev.map(seg => seg.id === segmentId ? {
      ...seg,
      items: seg.items.map(item => item.id === updatedItem.id ? updatedItem : item)
    } : seg));
  };

  const deleteItem = (segmentId: string, itemId: string) => {
    if(window.confirm('¿Eliminar este registro?')) {
      setSegments(prev => prev.map(seg => seg.id === segmentId ? { ...seg, items: seg.items.filter(i => i.id !== itemId) } : seg));
    }
  };

  // Funciones de Respaldo (Críticas para App Local)
  const exportData = () => {
    const dataStr = JSON.stringify(segments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `mi-viaje-europa-${new Date().toISOString().slice(0,10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (Array.isArray(json)) {
            setSegments(json);
            alert('¡Datos importados con éxito!');
            setActiveTab('dashboard');
          }
        } catch (err) {
          alert('Error: El archivo no es un respaldo válido.');
        }
      };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header Fijo */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane size={20} className="text-blue-400 -rotate-45" />
          <h1 className="text-lg font-black tracking-tighter uppercase">EuroPlan Local</h1>
        </div>
        <div className="text-[10px] bg-blue-600 px-2 py-1 rounded font-bold uppercase">Modo Offline</div>
      </header>

      {/* Contenido Principal con Padding Inferior para la Nav Bar de Móvil */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 mb-20">
        {activeTab === 'dashboard' && <Dashboard segments={segments} />}
        {activeTab === 'itinerary' && (
          <Itinerary 
            segments={segments} 
            onAddSegment={addSegment}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onDeleteItem={deleteItem}
            onDeleteSegment={deleteSegment}
          />
        )}
        {activeTab === 'table' && <BudgetTable segments={segments} />}
        
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Settings className="text-blue-500" /> Configuración y Respaldo
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Como esta aplicación funciona <b>localmente</b> en tu celular, es importante que hagas copias de seguridad de tus datos periódicamente.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={exportData}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                      <Download size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Exportar Datos</p>
                      <p className="text-xs text-slate-500">Descarga tu viaje en un archivo .json</p>
                    </div>
                  </div>
                </button>

                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Upload size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-800">Importar Datos</p>
                      <p className="text-xs text-slate-500">Cargar un archivo de respaldo previo</p>
                    </div>
                  </div>
                  <input type="file" className="hidden" accept=".json" onChange={importData} />
                </label>

                <button 
                  onClick={() => {
                    if(confirm('¿BORRAR TODO? Esta acción es irreversible si no tienes respaldo.')) {
                      setSegments([]);
                      localStorage.removeItem('europlan_local_v2');
                    }
                  }}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                      <Trash2 size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-red-800">Borrar Todo</p>
                      <p className="text-xs text-red-500">Limpiar toda la memoria de la aplicación</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-xl">
               <h3 className="font-black mb-2 flex items-center gap-2 text-lg">💡 Tip de Viajero</h3>
               <p className="text-blue-100 text-sm leading-relaxed">
                 Guarda el archivo exportado en tu correo o en la nube. Así, si pierdes tu celular, podrás recuperar todo tu itinerario en el nuevo dispositivo en segundos.
               </p>
            </div>
          </div>
        )}
      </main>

      {/* Navegación Inferior Estilo App Móvil */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 h-18 pb-safe flex items-center justify-around z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'dashboard' ? 'bg-blue-50' : ''}`}>
            <LayoutDashboard size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase">Resumen</span>
        </button>
        <button 
          onClick={() => setActiveTab('itinerary')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'itinerary' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'itinerary' ? 'bg-blue-50' : ''}`}>
            <Map size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase">Itinerario</span>
        </button>
        <button 
          onClick={() => setActiveTab('table')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'table' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'table' ? 'bg-blue-50' : ''}`}>
            <CreditCard size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase">Gastos</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'settings' ? 'bg-blue-50' : ''}`}>
            <Settings size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase">Ajustes</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
