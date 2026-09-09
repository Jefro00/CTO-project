import React, { useState } from 'react';
import { DamageMarker } from '@automotive-os/types';
import { AlertCircle, Plus, Trash2, X } from 'lucide-react';
import { Button } from './Button';
import { Select } from './Select';

interface DamageMarkingCanvasProps {
  markers: DamageMarker[];
  onChange: (markers: DamageMarker[]) => void;
  readonly?: boolean;
}

export const DamageMarkingCanvas: React.FC<DamageMarkingCanvasProps> = ({
  markers,
  onChange,
  readonly = false,
}) => {
  const [selectedMarkerIdx, setSelectedMarkerIdx] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [newSeverity, setNewSeverity] = useState<'minor' | 'moderate' | 'severe'>('minor');
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPendingCoords({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    setNewComment('');
    setNewSeverity('minor');
  };

  const addMarker = () => {
    if (!pendingCoords) return;
    const marker: DamageMarker = {
      x: pendingCoords.x,
      y: pendingCoords.y,
      severity: newSeverity,
      comment: newComment || 'Повреждение ЛКП / кузова',
    };
    onChange([...markers, marker]);
    setPendingCoords(null);
    setNewComment('');
  };

  const removeMarker = (index: number) => {
    const updated = markers.filter((_, i) => i !== index);
    onChange(updated);
    if (selectedMarkerIdx === index) setSelectedMarkerIdx(null);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Интерактивная карта повреждений кузова</h4>
          <p className="text-xs text-slate-500">
            {readonly
              ? 'Нажмите на маркер для просмотра описания дефекта'
              : 'Кликните в любую точку автомобиля для добавления отметки о сколе, вмятине или царапине'}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
          Отметок: {markers.length}
        </span>
      </div>

      {/* SVG Automotive Blueprint Diagram */}
      <div
        onClick={handleCanvasClick}
        className={`relative w-full aspect-[2/1] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 select-none shadow-inner ${
          readonly ? 'cursor-default' : 'cursor-crosshair'
        }`}
      >
        {/* Car Top View Blueprint vector drawing */}
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full opacity-70 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="800" height="400" fill="#0f172a" />
          {/* Grid lines */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
          <rect width="800" height="400" fill="url(#grid)" />

          {/* Car Body Silhouette */}
          {/* Front section */}
          <path
            d="M 120 150 C 120 110, 160 90, 240 85 L 560 85 C 640 90, 680 110, 680 150 L 695 190 C 700 200, 700 200, 695 210 L 680 250 C 680 290, 640 310, 560 315 L 240 315 C 160 310, 120 290, 120 250 L 105 210 C 100 200, 100 200, 105 190 Z"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="3"
          />

          {/* Windshield & Rear Window */}
          <path
            d="M 280 100 L 330 115 L 330 285 L 280 300 Z"
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <path
            d="M 520 115 L 470 100 L 470 300 L 520 285 Z"
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Roof & Side Glass */}
          <rect x="330" y="115" width="140" height="170" rx="10" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
          <line x1="400" y1="115" x2="400" y2="285" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />

          {/* Headlights & Tail lights */}
          <rect x="110" y="110" width="25" height="15" rx="4" fill="#38bdf8" opacity="0.6" />
          <rect x="110" y="275" width="25" height="15" rx="4" fill="#38bdf8" opacity="0.6" />
          <rect x="665" y="105" width="20" height="15" rx="4" fill="#f43f5e" opacity="0.8" />
          <rect x="665" y="280" width="20" height="15" rx="4" fill="#f43f5e" opacity="0.8" />

          {/* Side mirrors */}
          <path d="M 290 80 L 310 80 L 315 90 L 285 90 Z" fill="#94a3b8" />
          <path d="M 290 320 L 310 320 L 315 310 L 285 310 Z" fill="#94a3b8" />

          {/* Labels */}
          <text x="130" y="205" fill="#94a3b8" fontSize="13" fontWeight="bold" fontFamily="monospace">ПЕРЕД (FRONT)</text>
          <text x="600" y="205" fill="#94a3b8" fontSize="13" fontWeight="bold" fontFamily="monospace">ЗАД (REAR)</text>
          <text x="365" y="70" fill="#64748b" fontSize="12" fontFamily="sans-serif">Левая сторона</text>
          <text x="365" y="340" fill="#64748b" fontSize="12" fontFamily="sans-serif">Правая сторона</text>
        </svg>

        {/* Existing Markers */}
        {markers.map((marker, idx) => {
          const colors = {
            minor: 'bg-amber-500 border-amber-300 ring-amber-400',
            moderate: 'bg-orange-500 border-orange-300 ring-orange-400',
            severe: 'bg-rose-600 border-rose-300 ring-rose-500',
          };
          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMarkerIdx(selectedMarkerIdx === idx ? null : idx);
              }}
              style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 text-white font-bold text-xs flex items-center justify-center shadow-lg transition-transform hover:scale-125 focus:ring-4 ${
                colors[marker.severity] || colors.minor
              }`}
              title={`${marker.comment} (${marker.severity})`}
            >
              {idx + 1}
            </button>
          );
        })}

        {/* Pending Marker Pulse */}
        {pendingCoords && (
          <div
            style={{ left: `${pendingCoords.x}%`, top: `${pendingCoords.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-rose-500/40 border-2 border-rose-400 animate-ping pointer-events-none"
          />
        )}
      </div>

      {/* New Marker Dialog */}
      {pendingCoords && !readonly && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-500" /> Добавление дефекта (X: {pendingCoords.x}%, Y: {pendingCoords.y}%)
            </h5>
            <button
              type="button"
              onClick={() => setPendingCoords(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Опишите дефект (например: Глубокая царапина 10 см, скол)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as any)}
                className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="minor">Незначительное (Мелкий скол/потертость)</option>
                <option value="moderate">Среднее (Царапина / вмятина)</option>
                <option value="severe">Критическое (Разрыв / деформация)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setPendingCoords(null)}>
              Отмена
            </Button>
            <Button size="sm" variant="primary" onClick={addMarker}>
              Сохранить метку
            </Button>
          </div>
        </div>
      )}

      {/* Markers List */}
      {markers.length > 0 && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
            Список зафиксированных повреждений
          </div>
          <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
            {markers.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  selectedMarkerIdx === idx ? 'bg-indigo-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{m.comment}</p>
                    <p className="text-xs text-slate-500">
                      Координаты: {m.x}% / {m.y}% • Степень:{' '}
                      <span className="font-semibold capitalize text-slate-700">{m.severity}</span>
                    </p>
                  </div>
                </div>
                {!readonly && (
                  <button
                    type="button"
                    onClick={() => removeMarker(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
