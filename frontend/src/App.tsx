import { useState } from 'react';
import type { User } from './interfaces';
import AspiranteTestView from './views/AspiranteTestView';
import EvaluadorView from './views/EvaluadorView';
import AdminView from './views/AdminView';
import LoginView from './views/LoginView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  
  if (!user) {
    return <LoginView onLoginSuccess={(userData) => setUser(userData)} />;
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