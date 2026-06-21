export interface User {
  id_aspirante: number;
  cif: string;
  rol: 'usuario' | 'admin' | 'evaluador';
  nombre_aspirante: string;
}

export interface Pregunta {
  id_item: number;
  texto_item: string;
  seccion: 'Parte 1' | 'Parte 2';
  opciones?: string[];
}

export interface Resultado {
  id_resultado: number;
  nombre: string;
  cif: string;
  total_teorico: number;
  total_economico: number;
  total_estetico: number;
  total_social: number;
  total_politico: number;
  total_religioso: number;
  notas_entrevista?: string;
}