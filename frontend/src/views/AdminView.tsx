import React from 'react';
import type { User } from '../interfaces';

interface AdminViewProps {
  user: User;
  onLogout: () => void;
}

export default function AdminView({ user, onLogout }: AdminViewProps) {
  return (
    <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl border shadow-sm max-w-sm w-full text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Panel del Administrador</h2>
        <p className="text-xs text-slate-500">Sesión activa como: {user.nombre_aspirante}</p>
        <button onClick={onLogout} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors">
          Cerrar Sesión Administrativa
        </button>
      </div>
    </div>
  );
}