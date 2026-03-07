import React from "react";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { TripSegment, TripItem } from "../types";

interface Props {
  segments: TripSegment[];
  onAddSegment: (segment: TripSegment) => void;
  onAddItem: (segmentId: string, item: TripItem) => void;
  onUpdateItem: (segmentId: string, item: TripItem) => void;
  onDeleteItem: (segmentId: string, itemId: string) => void;
  onDeleteSegment: (segmentId: string) => void;
}

export const Itinerary: React.FC<Props> = ({
  segments,
  onDeleteItem,
  onDeleteSegment
}) => {

  const moveItem = (
    segment: TripSegment,
    index: number,
    direction: number
  ) => {

    const newItems = [...segment.items];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    segment.items = newItems;
  };

  return (
    <div className="space-y-6">

      {segments.map(segment => (

        <div
          key={segment.id}
          className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
        >

          <div className="flex justify-between items-center mb-4">
            <h2 className="font-black text-lg">{segment.city}</h2>

            <button
              onClick={() => onDeleteSegment(segment.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18}/>
            </button>
          </div>

          <div className="space-y-3">

            {segment.items.map((item, index) => (

              <div
                key={item.id}
                className="flex items-center justify-between bg-slate-50 p-3 rounded-xl"
              >

                <div>
                  <div className="font-semibold">{item.title}</div>

                  <div className="text-xs text-slate-500">
                    {item.date} {item.time ? `- ${item.time}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() => moveItem(segment, index, -1)}
                    className="p-2 bg-slate-200 rounded-lg"
                  >
                    <ArrowUp size={14}/>
                  </button>

                  <button
                    onClick={() => moveItem(segment, index, 1)}
                    className="p-2 bg-slate-200 rounded-lg"
                  >
                    <ArrowDown size={14}/>
                  </button>

                  <button
                    onClick={() => onDeleteItem(segment.id, item.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg"
                  >
                    <Trash2 size={14}/>
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      ))}

    </div>
  );
};