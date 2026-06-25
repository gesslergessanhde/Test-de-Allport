import React, { useState } from 'react';
import { User, PlusCircle, Search, Trash2 } from 'lucide-react';
import type { User as UserType } from '../interfaces';

interface UserManagementProps {
  usuarios: UserType[];
  onAgregar: (nombre: string, cif: string, clave: string, rol: string) => Promise<void>;
  onEliminar: (id: number) => Promise<void>;
}

export default function UserManagementCard({ usuarios, onAgregar, onEliminar }: UserManagementProps) {
  const [nombre, setNombre] = useState('');
  const [cif, setCif] = useState('');
  const [clave, setClave] = useState('');
  const [rol, setRol] = useState('usuario');
  const [busqueda, setBusqueda] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !cif || !clave) return;
    await onAgregar(nombre, cif, clave, rol);
    setNombre(''); setCif(''); setClave('');
  };

  // Filtro analítico reactivo en tiempo real
  const usuariosFiltrados = usuarios.filter(u =>
    u.nombre_aspirante.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.cif.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <section className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm h-fit">
      <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
        <User className="w-4 h-4 text-indigo-600" /> Control de Accesos
      </h2>

      {/* Formulario de Alta */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/40">
        <h3 className="text-[11px] font-bold uppercase text-slate-500">Registrar Nuevo Rol</h3>
        <input type="text" placeholder="Nombre completo" className="w-full p-2 bg-white text-xs border rounded-xl outline-none" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <input type="text" placeholder="Código CIF / Identificador" className="w-full p-2 bg-white text-xs border rounded-xl outline-none" value={cif} onChange={e => setCif(e.target.value)} required />
        <input type="password" placeholder="Clave secreta" className="w-full p-2 bg-white text-xs border rounded-xl outline-none" value={clave} onChange={e => setClave(e.target.value)} required />
        <select className="w-full p-2 bg-white text-xs border rounded-xl outline-none font-medium" value={rol} onChange={e => setRol(e.target.value)}>
          <option value="usuario">Aspirante / Estudiante</option>
          <option value="evaluador">Psicólogo Evaluador</option>
          <option value="admin">Administrador</option>
        </select>
        <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
          <PlusCircle className="w-3.5 h-3.5" /> Dar de Alta
        </button>
      </form>

      {/* Caja del Buscador Dinámico */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar usuario por nombre o CIF..."
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-500 transition-all"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {/* Contenedor del Listado */}
      <div className="space-y-2 max-h-75 overflow-y-auto pr-1">
        <h3 className="text-[11px] font-bold uppercase text-slate-500 mb-1">Usuarios Registrados</h3>
        {usuariosFiltrados.length > 0 ? (
          usuariosFiltrados.map(u => (
            <div key={u.id_aspirante} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/50 text-xs">
              <div>
                <p className="font-bold text-slate-800">{u.nombre_aspirante}</p>
                <p className="text-[10px] text-slate-500 font-mono">CIF: {u.cif} | <span className="capitalize font-semibold text-teal-600">{u.rol}</span></p>
              </div>
              <button type="button" onClick={() => onEliminar(u.id_aspirante)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Dar de baja usuario">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-[11px] text-slate-400 py-4 italic">No se encontraron coincidencias</p>
        )}
      </div>
    </section>
  );
}