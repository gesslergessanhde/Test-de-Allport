import React, { useState } from 'react';
import type { User } from './interfaces';
import AspiranteTestView from './views/AspiranteTestView';
import EvaluadorView from './views/EvaluadorView';
import AdminView from './views/AdminView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [cif, setCif] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cif, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        setError('CIF o clave incorrectos.');
      }
    } catch {
      setError('Error al comunicar con el servidor backend.');
    }
  };

  // Si no hay usuario logueado, renderiza la pantalla de Login con estilos de Tailwind
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans antialiased p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-slate-200/60">
          <div className="flex flex-col items-center mb-6">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md mb-2">
              A
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Test de Allport</h2>
            <p className="text-xs text-slate-500 mt-0.5">Portal de Usuarios</p>
          </div>
          
          {error && (
            <div className="mb-4 p-2.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">CIF / Usuario</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                value={cif} 
                onChange={e => setCif(e.target.value)} 
                placeholder="CIF" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Contraseña</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Enrutamiento condicional basado en el rol de la sesión activa
  if (user.rol === 'admin') {
    return <AdminView user={user} onLogout={() => setUser(null)} />;
  }
  
  if (user.rol === 'evaluador') {
    return <EvaluadorView user={user} onLogout={() => setUser(null)} />;
  }

  return <AspiranteTestView user={user} onLogout={() => setUser(null)} />;
}