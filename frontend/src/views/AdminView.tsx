import React, { useState, useEffect } from 'react';
import { User, ShieldAlert, Trash2, Edit3, PlusCircle, CheckSquare, AlertTriangle, X } from 'lucide-react';
import type { User as UserType, Pregunta } from '../interfaces';

// Definición explícita de las propiedades de la vista (Soluciona error 2304)
interface AdminViewProps {
  user: UserType;
  onLogout: () => void;
}

// ================= COMPONENTE MODAL INTERNO AUXILIAR (BLINDADO CONTRA ESLINT) =================
interface LocalModalProps {
  isOpen: boolean;
  type: 'edit' | 'delete';
  title: string;
  initialText?: string;
  onClose: () => void;
  onConfirm: (text?: string) => void;
}

function AdminModalLocal({ isOpen, type, title, initialText = '', onClose, onConfirm }: LocalModalProps) {
  // 🔄 SOLUCIÓN AL CASCADING RENDER: Eliminamos totalmente el useEffect.
  // El componente ahora maneja el estado de manera natural inicializándose con la prop.
  const [inputText, setInputText] = useState(initialText);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-slate-200 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-150">
        <button type="button" onClick={onClose} className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl ${type === 'edit' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'}`}>
            {type === 'edit' ? <Edit3 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">{title}</h3>
        </div>
        <div className="space-y-4">
          {type === 'edit' ? (
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider text-slate-500">Enunciado del Ítem</label>
              <textarea
                rows={3}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-teal-500 font-medium resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          ) : (
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Esta acción eliminará de forma permanente el ítem del baremo del Test de Allport. ¿Deseas continuar?
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onConfirm(type === 'edit' ? inputText : undefined)}
              className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow ${type === 'edit' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              {type === 'edit' ? 'Guardar Cambios' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= COMPONENTE VISTA PRINCIPAL DE ADMINISTRADOR =================
export default function AdminView({ user, onLogout }: AdminViewProps) {
  const [usuarios, setUsuarios] = useState<UserType[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCif, setNuevoCif] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  const [nuevoRol, setNuevoRol] = useState('usuario');

  const [testSeleccionado, setTestSeleccionado] = useState<'p1' | 'p2'>('p1');
  const [preguntasP1, setPreguntasP1] = useState<Pregunta[]>([]);
  const [preguntasP2, setPreguntasP2] = useState<Pregunta[]>([]);
  const [nuevaPreguntaTexto, setNuevaPreguntaTexto] = useState('');
  
  const [opcionA, setOpcionA] = useState('');
  const [opcionB, setOpcionB] = useState('');
  const [opcionC, setOpcionC] = useState('');
  const [opcionD, setOpcionD] = useState('');

  const [preguntaActiva, setPreguntaActiva] = useState<Pregunta | null>(null);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);

  useEffect(() => {
    const inicializarDatos = async () => {
      try {
        const resP1 = await fetch('http://localhost:3001/api/preguntas/p1');
        const dataP1 = await resP1.json();
        setPreguntasP1(dataP1);

        const resP2 = await fetch('http://localhost:3001/api/preguntas/p2');
        const dataP2 = await resP2.json();
        setPreguntasP2(dataP2);

        const resRes = await fetch('http://localhost:3001/api/resultados');
        const dataRes = await resRes.json();
        
        setUsuarios([
          { id_aspirante: 1, nombre_aspirante: 'Admin General', cif: 'admin', password_hash: 'admin', rol: 'admin' },
          { id_aspirante: 2, nombre_aspirante: 'Psicólogo Evaluador', cif: 'evaluador', password_hash: '123', rol: 'evaluador' },
          ...dataRes.map((r: { id_resultado: number; nombre: string; cif: string }) => ({
            id_aspirante: r.id_resultado,
            nombre_aspirante: r.nombre,
            cif: r.cif,
            password_hash: '*****',
            rol: 'usuario'
          }))
        ]);
      } catch (err) {
        console.error("Error cargando el panel de administración:", err);
      }
    };

    inicializarDatos();
  }, []);

  const refrescarTabla = async () => {
    try {
      const resP1 = await fetch('http://localhost:3001/api/preguntas/p1');
      const dataP1 = await resP1.json();
      setPreguntasP1(dataP1);

      const resP2 = await fetch('http://localhost:3001/api/preguntas/p2');
      const dataP2 = await resP2.json();
      setPreguntasP2(dataP2);

      const resRes = await fetch('http://localhost:3001/api/resultados');
      const dataRes = await resRes.json();
      
      setUsuarios([
        { id_aspirante: 1, nombre_aspirante: 'Admin General', cif: 'admin', password_hash: 'admin', rol: 'admin' },
        { id_aspirante: 2, nombre_aspirante: 'Psicólogo Evaluador', cif: 'evaluador', password_hash: '123', rol: 'evaluador' },
        ...dataRes.map((r: { id_resultado: number; nombre: string; cif: string }) => ({
          id_aspirante: r.id_resultado,
          nombre_aspirante: r.nombre,
          cif: r.cif,
          password_hash: '*****',
          rol: 'usuario'
        }))
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAgregarUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoCif || !nuevaClave) return;

    try {
      await fetch('http://localhost:3001/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_aspirante: nuevoNombre,
          cif: nuevoCif,
          password_hash: nuevaClave,
          rol: nuevoRol
        })
      });
      setNuevoNombre(''); setNuevoCif(''); setNuevaClave('');
      refrescarTabla();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminarUsuario = async (id: number) => {
    if (id === 1) { alert("No puedes eliminar al administrador raíz."); return; }
    try {
      await fetch(`http://localhost:3001/api/admin/usuarios/${id}`, { method: 'DELETE' });
      refrescarTabla();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAgregarPregunta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaPreguntaTexto) return;

    const opciones = testSeleccionado === 'p2' ? [opcionA, opcionB, opcionC, opcionD] : [];

    try {
      await fetch(`http://localhost:3001/api/admin/preguntas/${testSeleccionado}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto_item: nuevaPreguntaTexto, opciones })
      });
      setNuevaPreguntaTexto(''); setOpcionA(''); setOpcionB(''); setOpcionC(''); setOpcionD('');
      refrescarTabla();
    } catch (err) {
      console.error(err);
    }
  };

  const abrirEditor = (pregunta: Pregunta) => {
    setPreguntaActiva(pregunta);
    setModalEditOpen(true);
  };

  const ejecutarEdicion = async (nuevoTexto?: string) => {
    if (!preguntaActiva || !nuevoTexto) return;
    try {
      await fetch(`http://localhost:3001/api/admin/preguntas/${testSeleccionado}/${preguntaActiva.id_item}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto_item: nuevoTexto })
      });
      setModalEditOpen(false);
      setPreguntaActiva(null);
      refrescarTabla();
    } catch (err) {
      console.error(err);
    }
  };

  const abrirEliminador = (pregunta: Pregunta) => {
    setPreguntaActiva(pregunta);
    setModalDeleteOpen(true);
  };

  const ejecutarEliminacion = async () => {
    if (!preguntaActiva) return;
    try {
      await fetch(`http://localhost:3001/api/admin/preguntas/${testSeleccionado}/${preguntaActiva.id_item}`, { 
        method: 'DELETE' 
      });
      setModalDeleteOpen(false);
      setPreguntaActiva(null);
      refrescarTabla();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-teal-400" />
          <div>
            <h1 className="text-md font-black tracking-wide">Panel: {user.nombre_aspirante}</h1>
            <p className="text-[10px] text-slate-400">Gestión Global de Usuarios y Baremos Psicométricos</p>
          </div>
        </div>
        <button onClick={onLogout} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 font-bold text-xs rounded-xl transition-all shadow">
          Cerrar Sesión
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMNA 1: CONTROL DE USUARIOS */}
        <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm h-fit">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> Control de Accesos
          </h2>

          <form onSubmit={handleAgregarUsuario} className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
            <h3 className="text-[11px] font-bold uppercase text-slate-500">Registrar Nuevo Rol</h3>
            <input type="text" placeholder="Nombre completo" className="w-full p-2 bg-white text-xs border rounded-xl outline-none" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required />
            <input type="text" placeholder="Código CIF / Identificador" className="w-full p-2 bg-white text-xs border rounded-xl outline-none" value={nuevoCif} onChange={e => setNuevoCif(e.target.value)} required />
            <input type="password" placeholder="Clave secreta" className="w-full p-2 bg-white text-xs border rounded-xl outline-none" value={nuevaClave} onChange={e => setNuevaClave(e.target.value)} required />
            <select className="w-full p-2 bg-white text-xs border rounded-xl outline-none font-medium" value={nuevoRol} onChange={e => setNuevoRol(e.target.value)}>
              <option value="usuario">Aspirante / Estudiante</option>
              <option value="evaluador">Psicólogo Evaluador</option>
              <option value="admin">Administrador</option>
            </select>
            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Dar de Alta
            </button>
          </form>

          <div className="space-y-2 max-h-75 overflow-y-auto pr-1">
            <h3 className="text-[11px] font-bold uppercase text-slate-500 mb-1">Usuarios Registrados</h3>
            {usuarios.map(u => (
              <div key={u.id_aspirante} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/50 text-xs">
                <div>
                  <p className="font-bold text-slate-800">{u.nombre_aspirante}</p>
                  <p className="text-[10px] text-slate-500 font-mono">CIF: {u.cif} | <span className="capitalize font-semibold text-teal-600">{u.rol}</span></p>
                </div>
                <button type="button" onClick={() => handleEliminarUsuario(u.id_aspirante)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Dar de baja usuario">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* COLUMNAS 2 Y 3: TEST MODO ESPEJO */}
        <section className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-teal-600" /> Auditoría Virtual de Baremos
              </h2>
              <p className="text-[11px] text-slate-500">Visualiza y edita los ítems directamente sobre la plantilla espejo del alumno</p>
            </div>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              <button type="button" onClick={() => setTestSeleccionado('p1')} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${testSeleccionado === 'p1' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}>Parte 1 (30 Preguntas)</button>
              <button type="button" onClick={() => setTestSeleccionado('p2')} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${testSeleccionado === 'p2' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}>Parte 2 (15 Preguntas)</button>
            </div>
          </div>

          <form onSubmit={handleAgregarPregunta} className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
            <h3 className="text-[11px] font-bold uppercase text-teal-700 flex items-center gap-1">➕ Añadir Ítem a la {testSeleccionado === 'p1' ? 'Parte 1' : 'Parte 2'}</h3>
            <textarea rows={2} placeholder="Escriba el enunciado o dilema moral de la pregunta..." className="w-full p-2.5 bg-white text-xs border rounded-xl outline-none resize-none" value={nuevaPreguntaTexto} onChange={e => setNuevaPreguntaTexto(e.target.value)} required />
            {testSeleccionado === 'p2' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" placeholder="Opción a" className="p-2 text-xs border bg-white rounded-xl outline-none" value={opcionA} onChange={e => setOpcionA(e.target.value)} required />
                <input type="text" placeholder="Opción b" className="p-2 text-xs border bg-white rounded-xl outline-none" value={opcionB} onChange={e => setOpcionB(e.target.value)} required />
                <input type="text" placeholder="Opción c" className="p-2 text-xs border bg-white rounded-xl outline-none" value={opcionC} onChange={e => setOpcionC(e.target.value)} required />
                <input type="text" placeholder="Opción d" className="p-2 text-xs border bg-white rounded-xl outline-none" value={opcionD} onChange={e => setOpcionD(e.target.value)} required />
              </div>
            )}
            <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow">Insertar Pregunta en Producción</button>
          </form>

          <div className="space-y-4 max-h-125 overflow-y-auto pr-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {testSeleccionado === 'p1' ? (
              preguntasP1.map((p, idx) => (
                <div key={p.id_item} className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm relative group">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-[11px] font-black font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Ítem {idx + 1}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => abrirEditor(p)} className="p-1 text-teal-600 hover:bg-teal-50 rounded-lg transition-all" title="Editar enunciado">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => abrirEliminador(p)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Eliminar ítem">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mb-3 leading-relaxed">{p.texto_item}</p>
                  <div className="flex gap-4 text-[11px] font-bold text-slate-500">
                    <label className="flex items-center gap-1.5"><input type="radio" disabled /> (a) Sí / De Acuerdo</label>
                    <label className="flex items-center gap-1.5"><input type="radio" disabled /> (b) No / En Desacuerdo</label>
                  </div>
                </div>
              ))
            ) : (
              preguntasP2.map((p, idx) => (
                <div key={p.id_item} className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm relative group">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-[11px] font-black font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Ítem {idx + 1}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => abrirEditor(p)} className="p-1 text-teal-600 hover:bg-teal-50 rounded-lg transition-all" title="Editar enunciado">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => abrirEliminador(p)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Eliminar ítem">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mb-3 leading-relaxed">{p.texto_item}</p>
                  <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {p.opciones?.map((opc: string, oIdx: number) => (
                      <div key={oIdx} className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                        <span>{opc}</span>
                        <select disabled className="bg-white border text-[10px] rounded px-1 py-0.5 font-bold">
                          <option>Rank</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* 🔄 SOLUCIÓN RECOMENDADA POR REACT: Inyectamos la prop 'key' basada en el id_item.
          Esto desmonta y vuelve a montar el componente cada vez que cambia de pregunta,
          inicializando el estado 'inputText' nativamente sin romper las reglas de ESLint. */}
      <AdminModalLocal 
        key={preguntaActiva ? `edit-${preguntaActiva.id_item}` : 'edit-none'}
        isOpen={modalEditOpen} 
        type="edit" 
        title="Modificar Pregunta" 
        initialText={preguntaActiva?.texto_item} 
        onClose={() => { setModalEditOpen(false); setPreguntaActiva(null); }} 
        onConfirm={ejecutarEdicion} 
      />
      
      <AdminModalLocal 
        key={preguntaActiva ? `delete-${preguntaActiva.id_item}` : 'delete-none'}
        isOpen={modalDeleteOpen} 
        type="delete" 
        title="¿Remover Pregunta?" 
        onClose={() => { setModalDeleteOpen(false); setPreguntaActiva(null); }} 
        onConfirm={ejecutarEliminacion} 
      />
    </div>
  );
}