import { useState, useEffect } from 'react';
import type { User, Pregunta } from '../interfaces';
import QuestionCard from '../components/QuestionCard';
import { ClipboardCheck, MailCheck, AlertTriangle } from 'lucide-react';

interface ResultadoAspirante {
  id_resultado: number;
  nombre: string;
  cif: string;
  email: string;
  total_teorico: number;
  total_economico: number;
  total_estetico: number;
  total_social: number;
  total_politico: number;
  total_religioso: number;
  estado_evaluacion: string;
  notas_entrevista: string;
  respuestas_guardadas: { 
    id_aspirante: number;
    respuestasP1: Record<number, {a: number, b: number}>; 
    respuestasP2: Record<number, Record<number, number>> 
  } | null;
}

interface EvaluadorViewProps {
  user: User;
  onLogout: () => void;
}

export default function EvaluadorView({ user, onLogout }: EvaluadorViewProps) {
  const [resultados, setResultados] = useState<ResultadoAspirante[]>([]);
  const [selected, setSelected] = useState<ResultadoAspirante | null>(null);
  const [notas, setNotas] = useState('');
  const [correoDestino, setCorreoDestino] = useState('');
  
  const [preguntasP1, setPreguntasP1] = useState<Pregunta[]>([]);
  const [preguntasP2, setPreguntasP2] = useState<Pregunta[]>([]);
  const [verFormularioAuditoria, setVerFormularioAuditoria] = useState(false);

  // Estado extendido con 'variante' y 'titulo' para controlar el pop-up dinámico con botón OK
  const [modalAviso, setModalAviso] = useState<{ 
    titulo: string;
    mensaje: string; 
    variante: 'guardar' | 'correo' | 'error'; 
    onAceptar?: () => void; 
  } | null>(null);

  const cargarDatos = () => {
    fetch('http://localhost:8080/api/resultados')
      .then(res => res.json())
      .then((data: ResultadoAspirante[]) => setResultados(data));
  };

  useEffect(() => {
    cargarDatos();
    fetch('http://localhost:8080/api/preguntas/p1')
      .then(r => r.json())
      .then((d: Pregunta[]) => setPreguntasP1(d.map(i => ({...i, seccion: 'Parte 1'}))));
    fetch('http://localhost:8080/api/preguntas/p2')
      .then(r => r.json())
      .then((d: Pregunta[]) => setPreguntasP2(d.map(i => ({...i, seccion: 'Parte 2'}))));
  }, []);

  const guardarEntrevista = async (idAspirante: number) => {
    try {
      await fetch(`http://localhost:8080/api/entrevista/${idAspirante}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas })
      });
      
      // MODIFICACIÓN: Variante 'guardar' para activar el icono ClipboardCheck
      setModalAviso({ 
        titulo: 'Anotaciones Almacenadas',
        mensaje: 'Las anotaciones clínicas de la entrevista han sido guardadas y fijadas con éxito en el expediente del aspirante.', 
        variante: 'guardar' 
      });
      
      setResultados(prev => prev.map(item => 
        item.respuestas_guardadas?.id_aspirante === idAspirante 
          ? { ...item, estado_evaluacion: 'Revisado', notas_entrevista: notas }
          : item
      ));

      if (selected) {
        setSelected({
          ...selected,
          estado_evaluacion: 'Revisado',
          notas_entrevista: notas
        });
      }
    } catch (error) {
      console.error("Error al guardar entrevista:", error);
      setModalAviso({ 
        titulo: 'Fallo de Conectividad',
        mensaje: 'Error de conectividad: No se pudieron almacenar las impresiones clínicas en el servidor.', 
        variante: 'error' 
      });
    }
  };

  const enviarCorreo = async (idAspirante: number, idResultado: number) => {
    if (!correoDestino.trim()) {
      setModalAviso({ 
        titulo: 'Validación Requerida',
        mensaje: 'Por favor, especifique una dirección de correo electrónico de destino válida.', 
        variante: 'error' 
      });
      return;
    }

    try {
      await fetch(`http://localhost:8080/api/entrevista/${idAspirante}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notas })
      });

      const res = await fetch(`http://localhost:8080/api/enviar-correo/${idResultado}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailPersonalizado: correoDestino })
      });
      
      const data = await res.json();
      if (data.success) {
        // variantes de avisos
        setModalAviso({ 
          titulo: 'Despacho de Reporte Exitoso',
          mensaje: `¡Transmisión Exitosa! El dictamen psicométrico Allport ha sido despachado hacia la dirección: ${correoDestino}`, 
          variante: 'correo',
          onAceptar: () => setSelected(null)
        });
        
        setResultados(prev => prev.map(item => 
          item.id_resultado === idResultado 
            ? { ...item, estado_evaluacion: 'Resultados Enviados', notas_entrevista: notas }
            : item
        ));
      }
    } catch (error) {
      console.error("Error en la cadena transaccional:", error);
      setModalAviso({ 
        titulo: 'Fallo Interno SMTP',
        mensaje: 'Error en la cola de mensajería: El servidor SMTP de Gmail rechazó la conexión o el reporte presenta inconsistencias.', 
        variante: 'error' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans p-6 relative">
      
      {/*Cuadro emergente modal polimórfico adaptado con iconos vectoriales de Lucide */}
      {modalAviso && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            
            {/* Renderizado condicional del componente de icono vectorial */}
            <div className="flex justify-center select-none">
              {(() => {
                switch (modalAviso.variante) {
                  case 'guardar':
                    return <ClipboardCheck className="h-12 w-12 text-indigo-600 animate-bounce" />;
                  case 'correo':
                    return <MailCheck className="h-12 w-12 text-emerald-600 animate-pulse" />;
                  case 'error':
                  default:
                    return <AlertTriangle className="h-12 w-12 text-rose-600" />;
                }
              })()}
            </div>

            {/* Inyección dinámica de colores en el encabezado del título */}
            <h4 className={`text-sm font-bold ${
              modalAviso.variante === 'guardar' ? 'text-indigo-800' : 
              modalAviso.variante === 'correo' ? 'text-emerald-800' : 'text-rose-800'
            }`}>
              {modalAviso.titulo}
            </h4>

            <p className="text-xs text-slate-600 leading-relaxed font-medium px-2">
              {modalAviso.mensaje}
            </p>

            {/* Botón adaptativo con los colores correspondientes de la acción */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (modalAviso.onAceptar) modalAviso.onAceptar();
                  setModalAviso(null);
                }}
                className={`w-full py-2 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] ${
                  modalAviso.variante === 'guardar' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 
                  modalAviso.variante === 'correo' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 
                  'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                }`}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white p-4 rounded-2xl shadow-sm border mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-md font-bold text-slate-800">Dashboard Administrative de Psicometría</h2>
          <p className="text-xs text-slate-500">Evaluador: {user.nombre_aspirante}</p>
        </div>
        <button onClick={onLogout} className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm">
          Cerrar Sesión
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TABLA PRINCIPAL DE SEGUIMIENTO */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Seguimiento de Resultados Axiológicos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b">
                  <th className="p-3">Aspirante</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-center">Teo</th>
                  <th className="p-3 text-center">Eco</th>
                  <th className="p-3 text-center">Est</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-600">
                {resultados.map(r => (
                  <tr key={r.id_resultado} className="hover:bg-slate-50/80">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{r.nombre}</span>
                      <span className="text-[10px] text-slate-400">{r.cif} • {r.email}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.estado_evaluacion === 'Resultados Enviados' ? 'bg-green-100 text-green-700' :
                        r.estado_evaluacion === 'Revisado' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.estado_evaluacion}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-indigo-600">{r.total_teorico}</td>
                    <td className="p-3 text-center">{r.total_economico}</td>
                    <td className="p-3 text-center">{r.total_estetico}</td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => { 
                          setSelected(r); 
                          setNotas(r.notas_entrevista || ''); 
                          setCorreoDestino(''); 
                          setVerFormularioAuditoria(false); 
                        }} 
                        className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[10px]"
                        >
                        Revisar
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETALLE Y EXPEDIENTE LATERAL */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          {selected ? (
            <div className="space-y-6">
              <div className="border-b pb-2">
                <h3 className="text-sm font-bold text-slate-900">Expediente de {selected.nombre}</h3>
                <p className="text-[11px] text-slate-400">Auditoría Clínica de Valores</p>
              </div>

              {/* GRÁFICA ANALÓGICA */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700">Métricas del Perfil (Baremos 10-60 pts)</h4>
                {[
                  { l: 'Teorético', v: selected.total_teorico, c: 'bg-indigo-600' },
                  { l: 'Económico', v: selected.total_economico, c: 'bg-emerald-600' },
                  { l: 'Estético', v: selected.total_estetico, c: 'bg-pink-600' },
                  { l: 'Social', v: selected.total_social, c: 'bg-sky-600' },
                  { l: 'Político', v: selected.total_politico, c: 'bg-amber-600' },
                  { l: 'Religioso', v: selected.total_religioso, c: 'bg-purple-600' }
                ].map(bar => (
                  <div key={bar.l} className="space-y-1 text-[11px]">
                    <div className="flex justify-between font-medium">
                      <span>{bar.l}</span>
                      <span className="font-bold">{bar.v} pts</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${bar.c} h-full transition-all`} style={{ width: `${Math.min((bar.v / 60) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t">
                <button 
                  onClick={() => setVerFormularioAuditoria(true)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs border transition-colors flex items-center justify-center gap-1.5"
                >
                  Ver respuestas de Formulario
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Registrar Resultados de Entrevista</label>
                <textarea value={notas} onChange={e => setNotas(e.target.value)} className="w-full p-2 text-xs border rounded-xl" rows={2} placeholder="Escribe las impresiones clínicas..." />
                
                <button 
                  onClick={() => {
                    const idAspirante = selected.respuestas_guardadas?.id_aspirante;
                    if (idAspirante) {
                      guardarEntrevista(idAspirante);
                    } else {
                      setModalAviso({ titulo: 'Error Operacional', mensaje: 'Error operacional: No se pudo extraer el identificador único del aspirante seleccionado.', variante: 'error' });
                    }
                  }} 
                  className="w-full py-1.5 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <label className="block text-xs font-bold text-slate-700">Enviar Reporte a Correo Electrónico</label>
                <input 
                    type="email" 
                    value={correoDestino} 
                    onChange={e => setCorreoDestino(e.target.value)} 
                    className="w-full p-2 text-xs border rounded-xl bg-slate-50 text-slate-800 font-semibold focus:bg-white"
                    placeholder="Escriba el correo del destinatario..." 
                    />
                
                <button 
                  onClick={() => {
                    const idAspirante = selected.respuestas_guardadas?.id_aspirante;
                    if (idAspirante) {
                      enviarCorreo(idAspirante, selected.id_resultado);
                    } else {
                      setModalAviso({ titulo: 'Error Operacional', mensaje: 'Error operacional: Identificador del expediente axiología Allport no disponible.', variante: 'error' });
                    }
                  }} 
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
                >
                  📨 Despachar Resultados por Gmail
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <p className="text-xs font-medium mt-2">Click en boton "revisar" para ver las respuestas de un estudiante</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE AUDITORÍA: VISOR ESPEJO */}
      {verFormularioAuditoria && selected && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-2xl">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hojas de Respuestas: {selected.nombre}</h3>
                <p className="text-[11px] text-slate-500">Visualización en Modo Espejo (Controles Inhabilitados)</p>
              </div>
              <button 
                onClick={() => setVerFormularioAuditoria(false)}
                className="h-7 w-7 rounded-lg hover:bg-slate-200 border flex items-center justify-center font-bold text-slate-500 text-xs transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Parte 1: Distribución de 3 Puntos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preguntasP1.map(q => (
                    <QuestionCard 
                      key={q.id_item}
                      pregunta={q}
                      valoresP1={selected.respuestas_guardadas?.respuestasP1?.[q.id_item]}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Parte 2: Ordenamiento de Jerarquías (4-1)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {preguntasP2.map(q => (
                    <QuestionCard 
                      key={q.id_item}
                      pregunta={q}
                      valoresP2={selected.respuestas_guardadas?.respuestasP2?.[q.id_item]}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 border-t bg-slate-50 flex justify-end rounded-b-2xl">
              <button 
                onClick={() => setVerFormularioAuditoria(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}