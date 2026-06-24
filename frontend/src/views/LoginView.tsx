import { useState } from 'react';
import { User as UserIcon, Lock, Eye, EyeOff } from 'lucide-react';
import type { User } from '../interfaces';
import gifUamLogo from '../assets/gifUamLogo.gif';
// Paleta de Colores de Autoría Institucional
const TEAL = "#0099a7";
const NAVY = "#1e293b";
const SLATE = "#64748b";

interface LoginViewProps {
  onLoginSuccess: (usuario: User) => void; 
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [showPw, setShowPw] = useState(false);
  const [cif, setCif] = useState("2026-0001U"); 
  const [password, setPassword] = useState("12345");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cif, password })
      });

      const data = await response.json();

      if (data.success) {
        onLoginSuccess(data.user); 
      } else {
        setError(data.message || 'Credenciales inválidas.');
      }
    } catch (err) {
      console.error("Error de autenticación:", err);
      setError('No se pudo conectar con el servidor central.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans"
      style={{ background: "linear-gradient(145deg, #e8f8f9 0%, #f5eef8 55%, #e6f4f5 100%)" }}
    >
      {/* Círculos Decorativos de Fondo Unificados en TEAL (#0099a7) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Esfera 1: Superior izquierda principal */}
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-[0.08]" style={{ background: TEAL }} />
        
        {/* Esfera 2: Inferior derecha secundaria */}
        <div className="absolute -bottom-10 -right-10 w-80 h-80 rounded-full opacity-[0.07]" style={{ background: TEAL }} />
        
        {/* Esfera 3: Lateral derecha superior */}
        <div className="absolute top-1/4 right-10 w-40 h-40 rounded-full opacity-[0.04]" style={{ background: TEAL }} />
        
        {/* Esfera 4: Central izquierda profunda */}
        <div className="absolute top-1/3 -left-16 w-64 h-64 rounded-full opacity-[0.05]" style={{ background: TEAL }} />
        
        {/* Esfera 5: Inferior izquierda tenue */}
        <div className="absolute bottom-1/4 left-1/4 w-32 h-32 rounded-full opacity-[0.03]" style={{ background: TEAL }} />
        
        {/* Esfera 6: Superior derecha central */}
        <div className="absolute top-5 right-1/3 w-52 h-52 rounded-full opacity-[0.04]" style={{ background: TEAL }} />
        
        {/* Patrón Grid SVG Técnico */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0099a710" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Encabezado Institucional */}
        <div className="text-center mb-6">
         <div className="inline-flex items-center justify-center p-2 rounded-2xl mb-3 shadow-md bg-white border border-slate-100">
            <img 
                src={gifUamLogo} 
                alt="Logotipo Animado Universidad" 
                className="h-30 w-30 object-contain" 
            />
            </div> 
          <h2 className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: SLATE }}>
            Universidad Americana-UAM
          </h2>
          
        </div>

        {/* Tarjeta de Logeo */}
        <form 
          onSubmit={handleLoginSubmit}
          className="bg-white rounded-3xl p-8 border border-slate-200/60" 
          style={{ boxShadow: "0 25px 60px rgba(0,153,167,0.08), 0 4px 20px rgba(0,0,0,0.04)" }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-extrabold leading-snug" style={{ color: TEAL }}>Portal de Usuarios</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: TEAL }} />
              <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: SLATE }}>
                Estudio de Valores de Allport
              </span>
            </div>
          </div>

          {/* Alerta de Error Dinámica */}
          {error && (
            <div className="mb-4 p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-center text-xs font-semibold text-rose-600 animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Campo CIF */}
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: NAVY }}>
                Código CIF Institucional
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: SLATE }} />
                <input
                  type="text"
                  required
                  value={cif}
                  onChange={(e) => setCif(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-slate-800 font-medium"
                  placeholder="Ej: 2026-0001U"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: NAVY }}>
                Contraseña de Acceso
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: SLATE }} />
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 border border-slate-200 rounded-xl text-xs outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 text-slate-800 font-medium"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 transition-colors"
                  style={{ color: SLATE }}
                >
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Botón Transaccional */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-95 active:scale-[0.99] mt-2 disabled:bg-slate-300"
              style={{ backgroundColor: TEAL, boxShadow: `0 6px 20px ${TEAL}33` }}
            >
              {cargando ? "Autenticando..." : "Ingresar al Sistema"}
            </button>
          </div>
        </form>

        <p className="text-center text-[10px] mt-6" style={{ color: SLATE }}>
          © 2026 UAM · Test de Allport GHNE
        </p>
      </div>
    </div>
  );
}