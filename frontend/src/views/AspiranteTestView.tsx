import React, { useState, useEffect } from 'react';
import type { User, Pregunta } from '../interfaces';
import QuestionCard from '../components/QuestionCard';


interface AspiranteTestViewProps {
  user: User;
  onLogout: () => void;
}

export default function AspiranteTestView({ user, onLogout }: AspiranteTestViewProps) {
  // Ajustamos el estado inicial para desplegar primero las direcciones escritas
  const [pasoActual, setPasoActual] = useState<'instrucciones' | 'p1' | 'p2'>('instrucciones');
  const [preguntasP1, setPreguntasP1] = useState<Pregunta[]>([]);
  const [preguntasP2, setPreguntasP2] = useState<Pregunta[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800);

  const [respuestasP1, setRespuestasP1] = useState<Record<number, { a: number; b: number }>>({});
  const [respuestasP2, setRespuestasP2] = useState<Record<number, Record<number, number>>>({});

  useEffect(() => {
    fetch('http://localhost:8080/api/preguntas/p1')
      .then(r => r.json())
      .then((d: Pregunta[]) => setPreguntasP1(d.map((item) => ({ ...item, seccion: 'Parte 1' }))));
    
    fetch('http://localhost:8080/api/preguntas/p2')
      .then(r => r.json())
      .then((d: Pregunta[]) => setPreguntasP2(d.map((item) => ({ ...item, seccion: 'Parte 2' }))));

    // El contador de tiempo solo se activará cuando el estudiante salga de las instrucciones
   let timer: ReturnType<typeof setInterval> | undefined;
    
    if (pasoActual !== 'instrucciones') {
      timer = setInterval(() => setTimeLeft(t => (t > 0 ? t - 1 : 0)), 1000);
    }
    
    // Si el timer se inicializó, lo limpiamos correctamente al desmontar o cambiar de fase
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [pasoActual]); // Escucha el cambio de fase para activar el reloj

  const handleP1Change = (pregId: number, opcion: 'a' | 'b', valor: number) => {
    const otroValor = 3 - valor;
    setRespuestasP1(prev => ({
      ...prev,
      [pregId]: opcion === 'a' ? { a: valor, b: otroValor } : { a: otroValor, b: valor }
    }));
  };

  const handleP2Change = (pregId: number, opcionIdx: number, valor: number) => {
    setRespuestasP2(prev => ({
      ...prev,
      [pregId]: { ...prev[pregId], [opcionIdx]: valor }
    }));
  };

  const finalizarTest = async () => {
    await fetch('http://localhost:8080/api/respuestas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_aspirante: user.id_aspirante, respuestasP1, respuestasP2 })
    });
    alert('¡Test de Allport transmitido con éxito al servidor!');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="sticky top-0 bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm z-50">
        <div>
          <h1 className="text-sm font-bold text-slate-900">Evaluación de Valores de Allport</h1>
          <p className="text-xs text-slate-500">Aspirante: {user.nombre_aspirante}</p>
        </div>
        {/* El temporizador permanece oculto durante la lectura inicial */}
        {pasoActual !== 'instrucciones' && (
          <div className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            🕒 {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {/* Control de flujo de pantallas modulares condicionales */}
        {pasoActual === 'instrucciones' ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/60 space-y-6">
            <div className="text-center border-b pb-4">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">Test de Valores de Allport</h2>
              <h3 className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Direcciones</h3>
            </div>
            
            <div className="text-sm text-slate-600 space-y-4 leading-relaxed">
              <p>
                Se presentan en este estudio de valores un buen número de afirmaciones o preguntas a las que se les puede dar una de dos contestaciones. 
                Indique sus preferencias personales colocando los números apropiados en los cuadros que se encuentran a la derecha de cada pregunta.
              </p>
              <p>
                Algunas de las alternativas pueden parecerle igualmente atractivas o desagradables, sin embargo, escoja siempre una de ellas aunque sólo le parezca relativamente más aceptable que la otra. 
                Por cada una de las preguntas tiene usted tres puntos que puede distribuir en cualesquiera de las siguientes combinaciones:
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-xs font-medium text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600">▪</span>
                  <span>Si está de acuerdo con la alternativa (a) y en desacuerdo con la (b) ponga <strong>3</strong> en el primer cuadro y <strong>cero</strong> en el segundo como lo indica la gráfica.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600">▪</span>
                  <span>Si está de acuerdo con la (b) y en desacuerdo con la (a), ponga <strong>3</strong> en el segundo cuadro y <strong>cero</strong> en el primero.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600">▪</span>
                  <span>Si tiene ligera preferencia por la (a) sobre la (b), ponga <strong>2</strong> en el primero y <strong>1</strong> en el segundo.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600">▪</span>
                  <span>Si tiene ligera preferencia por la (b) sobre la (a), ponga <strong>2</strong> en el segundo y <strong>1</strong> en el primero.</span>
                </div>
              </div>

              <p className="text-slate-700 font-medium">
                No haga ninguna combinación de números que no sea una de estas cuatro. No hay límite de tiempo, pero no pierda mucho en ninguna pregunta o afirmación. No deje de contestar ninguna de las preguntas a menos que encuentre imposibilitado para decidirse.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setPasoActual('p1')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]"
              >
                Comenzar Cuestionario
              </button>
            </div>
          </div>
        ) : pasoActual === 'p1' ? (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-xs text-indigo-800 font-medium">
              Parte 1 : Distribuye exactamente 3 puntos entre las opciones de cada ítem.
            </div>
            
            {preguntasP1.map(q => (
              <QuestionCard 
                key={q.id_item} 
                pregunta={q} 
                onChangeP1={handleP1Change} 
                valoresP1={respuestasP1[q.id_item]} 
              />
            ))}

            <div className="flex justify-end">
              <button 
                onClick={() => setPasoActual('p2')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Continuar a la Parte 2
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800 font-medium">
              Parte 2: Ordena las 4 opciones asignando los valores del 4 al 1 según tu orden de interés.
            </div>

            {preguntasP2.map(q => (
              <QuestionCard 
                key={q.id_item} 
                pregunta={q} 
                onChangeP2={handleP2Change} 
                valoresP2={respuestasP2[q.id_item]} 
              />
            ))}

            <div className="flex justify-between pt-2">
              <button 
                onClick={() => setPasoActual('p1')}
                className="px-4 py-2 border text-slate-600 font-semibold text-xs rounded-xl hover:bg-white"
              >
            Regresar a Parte 1
              </button>
              <button 
                onClick={finalizarTest}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                Concluir y Enviar Examen
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}