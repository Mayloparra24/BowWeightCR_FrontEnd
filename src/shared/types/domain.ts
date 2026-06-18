export type Rol = 'ganadero' | 'asistente' | 'veterinario' | 'admin';

export type EstadoBovino = 'Activo' | 'Inactivo' | 'Vendido' | 'Fallecido';

export interface Usuario {
  id: string;
  fullName: string;
  email: string;
  role: Rol;
  status: 'activo' | 'inactivo';
  creadoEn?: string;
}

export interface Finca {
  id: string;
  name: string;
  location: string;
  provincia?: string;
  canton?: string;
  activa: boolean;
}

export interface Bovino {
  id: string;
  farmId: string;
  name: string;
  earTag: string;
  breed: string;
  breedId: string;
  sex: 'Macho' | 'Hembra';
  status: EstadoBovino;
  photoUrl: string;
  lastWeightKg: number;
  lastWeightDate: string;
  birthDate?: string;
  observations?: string;
  motivoInactividad?: string;
  pesajes?: RegistroPeso[];
}

export type FuentePesaje = 'IA' | 'Manual';

export interface RegistroPeso {
  id: string;
  bovinoId: string;
  date: string;
  weightKg: number;
  source: FuentePesaje;
  pesoEstimado?: number | null;
  confianzaIa?: number | null;
  esCorreccion?: boolean;
  notasCorreccion?: string | null;
}

export interface Raza {
  id: string;
  nombre: string;
  enfoque?: string;
  constantePeso: number;
  descripcion?: string;
}

export interface BitacoraEvento {
  id: string;
  usuarioId?: string;
  usuarioNombre?: string;
  accion: string;
  entidadTipo: string;
  entidadId: string;
  descripcion: string;
  direccionIp?: string;
  creadaEl: string;
}
