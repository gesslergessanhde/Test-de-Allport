import type { Pregunta } from '../interfaces';

interface QuestionCardProps {
  pregunta: Pregunta;
  onChangeP1?: (id: number, opcion: 'a' | 'b', valor: number) => void;
  onChangeP2?: (id: number, opcionIdx: number, valor: number) => void;
  valoresP1?: { a: number; b: number };
  valoresP2?: Record<number, number>;
}

export default function QuestionCard({ pregunta, onChangeP1, onChangeP2, valoresP1, valoresP2 }: QuestionCardProps) {
  const currentP1 = valoresP1 || { a: 0, b: 0 };
  const currentP2 = valoresP2 || {};

  // Si no se provee la función de cambio, el componente entiende que está en modo AUDITORÍA (Solo lectura)
  const isReadOnlyP1 = !onChangeP1;
  const isReadOnlyP2 = !onChangeP2;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 space-y-4 hover:border-slate-300 transition-colors text-left">
      <div className="flex items-start gap-3">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
          {pregunta.id_item}
        </span>
        <p className="font-semibold text-slate-800 text-sm leading-relaxed">{pregunta.texto_item}</p>
      </div>

      {pregunta.seccion === 'Parte 1' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-600">Opción (a)</span>
            <select 
              className="bg-white border rounded-lg px-2 py-1 text-xs font-bold text-indigo-600 disabled:opacity-80 disabled:bg-slate-100"
              value={currentP1.a}
              disabled={isReadOnlyP1}
              onChange={e => onChangeP1 && onChangeP1(pregunta.id_item, 'a', parseInt(e.target.value))}
            >
              {[0, 1, 2, 3].map(v => <option key={v} value={v}>{v} pts</option>)}
            </select>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-xs font-medium text-slate-600">Opción (b)</span>
            <select 
              className="bg-white border rounded-lg px-2 py-1 text-xs font-bold text-indigo-600 disabled:opacity-80 disabled:bg-slate-100"
              value={currentP1.b}
              disabled={isReadOnlyP1}
              onChange={e => onChangeP1 && onChangeP1(pregunta.id_item, 'b', parseInt(e.target.value))}
            >
              {[0, 1, 2, 3].map(v => <option key={v} value={v}>{v} pts</option>)}
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {pregunta.opciones?.map((opcion, idx) => (
            <div key={idx} className="flex justify-between items-center bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700">
              <span>{opcion}</span>
              <select 
                className="border font-bold text-indigo-600 rounded px-1 py-0.5 bg-white disabled:opacity-80 disabled:bg-slate-100"
                value={currentP2[idx] !== undefined ? currentP2[idx] : ''}
                disabled={isReadOnlyP2}
                onChange={e => onChangeP2 && onChangeP2(pregunta.id_item, idx, parseInt(e.target.value))}
              >
                <option value="">N/A</option>
                {[4, 3, 2, 1].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}