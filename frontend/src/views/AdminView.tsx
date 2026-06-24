import { useState, useEffect } from 'react';
import { User, ShieldAlert, Trash2, Edit3, PlusCircle, CheckSquare } from 'lucide-react';
import type { User as UserType } from '../interfaces';

interface AdminViewProps {
  user: UserType;
  onLogout: () => void;
}

export default function AdminView({ user, onLogout }: AdminViewProps) {
  // Estados para Gestión de Usuarios
  const [usuarios, setUsuarios] = useState<UserType[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCif, setNuevoCif] = useState('');
  const [nuevaClave, setNuevaClave] = useState('');
  const [nuevoRol, setNuevoRol] = useState('usuario');

  // Estados para Gestión de Preguntas (Modo Espejo)
  const [testSeleccionado, setTestSeleccionado] = useState<'p1' | 'p2'>('p1');
  const [preguntasP1, setPreguntasP1] = useState<any[]>([]);
  const [preguntasP2, setPreguntasP2] = useState<any[]>([]);
  const [nuevaPreguntaTexto, setNuevaPreguntaTexto] = useState('');
  
  // Opciones temporales si se agrega una pregunta a la Parte 2
  const [opcionA, setOpcionA] = useState('');
  const [opcionB, setOpcionB] = useState('');
  const [opcionC, setOpcionC] = useState('');
  const [opcionD, setOpcionD] = useState('');

  // Carga inicial de datos desde el backend
  const cargarDatos = async () => {
    try {
      const resP1 = await fetch('http://localhost:3001/api/preguntas/p1');
      const dataP1 = await resP1.json();
      setPreguntasP1(dataP1);

      const resP2 = await fetch('http://localhost:3001/api/preguntas/p2');
      const dataP2 = await resP2.json();
      setPreguntasP2(dataP2);

      // Simulamos la carga de usuarios desde los resultados o una petición
      const resRes = await fetch('http://localhost:3001/api/resultados');
      const dataRes = await resRes.json();
      // Mapeo básico para visualización en el dashboard
      setUsuarios([
        { id_aspirante: 1, nombre_aspirante: 'Admin General', cif: 'admin', password_hash: 'admin', rol: 'admin' },
        { id_aspirante: 2, nombre_aspirante: 'Psicólogo Evaluador', cif: 'evaluador', password_hash: '123', rol: 'evaluador' },
        ...dataRes.map((r: any) => ({
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

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- Operaciones CRUD Usuarios ---
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
      cargarDatos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminarUsuario = async (id: number) => {
    if (id === 1) { alert("No puedes eliminar al administrador raíz."); return; }
    try {
      await fetch(`http://localhost:3001/api/admin/usuarios/${id}`, { method: 'DELETE' });
      cargarDatos();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Operaciones CRUD Preguntas ---
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
      cargarDatos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditarPreguntaTexto = async (id: number, textoActual: string) => {
    const nuevoTexto = prompt("Modifique el encabezado de la pregunta:", textoActual);
    if (!nuevoTexto) return;

    try {
      await fetch(`http://localhost:3001/api/admin/preguntas/${testSeleccionado}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto_item: nuevoTexto })
      });
      cargarDatos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEliminarPregunta = async (id: number) => {
    if (!confirm("¿Está seguro de remover esta pregunta del baremo de Allport?")) return;
    try {
      await fetch(`http://localhost:3001/api/admin/preguntas/${testSeleccionado}/${id}`, { method: 'DELETE' });
      cargarDatos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans antialiased">
      {/* Barra de Navegación Superior */}
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-teal-400" />
          <div>
            <h1 className="text-md font-black tracking-wide">Panel de Control: Administrador</h1>
            <p className="text-[10px] text-slate-400">Gestión Global de Usuarios y Baremos Psicométricos</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 font-bold text-xs rounded-xl transition-all shadow"
        >
          Cerrar Sesión
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA 1: CONTROL DE USUARIOS */}
        <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm h-fit">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> Control de Accesos
          </h2>

          {/* Formulario de Registro */}
          <form onSubmit={handleAgregarUsuario} className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
            <h3 className="text-[11px] font-bold uppercase text-slate-500">Registrar Nuevo Rol</h3>
            <input 
              type="text" 
              placeholder="Nombre completo" 
              className="w-full p-2 bg-white text-xs border rounded-xl outline-none"
              value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required
            />
            <input 
              type="text" 
              placeholder="Código CIF / Identificador" 
              className="w-full p-2 bg-white text-xs border rounded-xl outline-none"
              value={nuevoCif} onChange={e => setNuevoCif(e.target.value)} required
            />
            <input 
              type="password" 
              placeholder="Clave secreta" 
              className="w-full p-2 bg-white text-xs border rounded-xl outline-none"
              value={nuevaClave} onChange={e => setNuevaClave(e.target.value)} required
            />
            <select 
              className="w-full p-2 bg-white text-xs border rounded-xl outline-none font-medium"
              value={nuevoRol} onChange={e => setNuevoRol(e.target.value)}
            >
              <option value="usuario">Aspirante / Estudiante</option>
              <option value="evaluador">Psicólogo Evaluador</option>
              <option value="admin">Administrador</option>
            </select>
            <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Dar de Alta
            </button>
          </form>

          {/* Listado de Usuarios Activos */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <h3 className="text-[11px] font-bold uppercase text-slate-500 mb-1">Usuarios Registrados</h3>
            {usuarios.map(u => (
              <div key={u.id_aspirante} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/50 text-xs">
                <div>
                  <p className="font-bold text-slate-800">{u.nombre_aspirante}</p>
                  <p className="text-[10px] text-slate-500 font-mono">CIF: {u.cif} | <span className="capitalize font-semibold text-teal-600">{u.rol}</span></p>
                </div>
                <button 
                  onClick={() => handleEliminarUsuario(u.id_aspirante)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Dar de baja usuario"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* COLUMNAS 2 Y 3: GESTIÓN DE TEST EN MODO ESPEJO */}
        <section className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-teal-600" /> Auditoría Virtual de Baremos
              </h2>
              <p className="text-[11px] text-slate-500">Visualiza y edita los ítems directamente sobre la plantilla espejo del alumno</p>
            </div>
            
            {/* Selector de Test */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
              <button 
                onClick={() => setTestSeleccionado('p1')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${testSeleccionado === 'p1' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
              >
                Parte 1 (30 Preguntas)
              </button>
              <button 
                onClick={() => setTestSeleccionado('p2')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${testSeleccionado === 'p2' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
              >
                Parte 2 (15 Preguntas)
              </button>
            </div>
          </div>

          {/* Formulario Dinámico para Inyectar Preguntas */}
          <form onSubmit={handleAgregarPregunta} className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
            <h3 className="text-[11px] font-bold uppercase text-teal-700 flex items-center gap-1">➕ Añadir Ítem a la {testSeleccionado === 'p1' ? 'Parte 1' : 'Parte 2'}</h3>
            <textarea 
              rows={2}
              placeholder="Escriba el enunciado o dilema moral de la pregunta..."
              className="w-full p-2.5 bg-white text-xs border rounded-xl outline-none resize-none"
              value={nuevaPreguntaTexto} onChange={e => setNuevaPreguntaTexto(e.target.value)} required
            />
            
            {testSeleccionado === 'p2' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" placeholder="Opción a" className="p-2 text-xs border bg-white rounded-xl outline-none" value={opcionA} onChange={e => setOpcionA(e.target.value)} required />
                <input type="text" placeholder="Opción b" className="p-2 text-xs border bg-white rounded-xl outline-none" value={opcionB} onChange={e => setOpcionB(e.target.value)} required />
                <input type="text" placeholder="Opción c" className="p-2 text-xs border bg-white rounded-xl outline-none" value={opcionC} onChange={e => setOpcionC(e.target.value)} required />
                <input type="text" placeholder="Opción d" className="p-2 text-xs border bg-white rounded-xl outline-none" value={opcionD} onChange={e => setOpcionD(e.target.value)} required />
              </div>
            )}
            
            <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow">
              Insertar Pregunta en Producción
            </button>
          </form>

          {/* VISTA ESPEJO DEL TEST */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            
            {testSeleccionado === 'p1' ? (
              // RENDER ESPEJO PARTE 1
              preguntasP1.map((p, index) => (
                <div key={p.id_item} className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm relative group">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-[11px] font-black font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Ítem {index + 1}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditarPreguntaTexto(p.id_item, p.texto_item)}
                        className="p-1 text-teal-600 hover:bg-teal-50 rounded-lg transition-all" title="Editar enunciado"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleEliminarPregunta(p.id_item)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Eliminar ítem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mb-3 leading-relaxed">{p.texto_item}</p>
                  
                  {/* Inputs deshabilitados para emular la vista del estudiante */}
                  <div className="flex gap-4 text-[11px] font-bold text-slate-500">
                    <label className="flex items-center gap-1.5"><input type="radio" disabled /> (a) Sí / De Acuerdo</label>
                    <label className="flex items-center gap-1.5"><input type="radio" disabled /> (b) No / En Desacuerdo</label>
                  </div>
                </div>
              ))
            ) : (
              // RENDER ESPEJO PARTE 2
              preguntasP2.map((p, index) => (
                <div key={p.id_item} className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-sm relative group">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-[11px] font-black font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">Ítem {index + 1}</span>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditarPreguntaTexto(p.id_item, p.texto_item)}
                        className="p-1 text-teal-600 hover:bg-teal-50 rounded-lg transition-all" title="Editar enunciado"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleEliminarPregunta(p.id_item)}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Eliminar ítem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mb-3 leading-relaxed">{p.texto_item}</p>
                  
                  {/* Selector de ordenamiento deshabilitado al estilo Parte 2 */}
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
    </div>
  );
}