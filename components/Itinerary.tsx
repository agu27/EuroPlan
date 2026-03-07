import React from "react";
import { Plus } from "lucide-react";
import { TripSegment } from "../types";

interface ItineraryProps {
  segments: TripSegment[];
  onAddSegment: () => void;
}

export const Itinerary: React.FC<ItineraryProps> = ({
  segments,
  onAddSegment,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Itinerario</h2>

        <button
          onClick={onAddSegment}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          <Plus size={18} />
          Agregar destino
        </button>
      </div>

      {/* Lista de destinos */}
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div
            key={segment.id}
            className="p-4 bg-white border border-slate-200 rounded-lg"
          >
            <h3 className="font-semibold text-slate-900">
              {index + 1}. {segment.city}, {segment.country}
            </h3>

            <p className="text-sm text-slate-500">
              {segment.arrivalDate} → {segment.departureDate}
            </p>
          </div>
        ))}

        {segments.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            No hay destinos todavía. Agrega el primero arriba.
          </div>
        )}
      </div>
    </div>
  );
};