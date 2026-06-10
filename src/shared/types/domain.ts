export type Rol = 'ganadero' | 'veterinario' | 'admin';

export interface Usuario {
  id: string;
  fullName: string;
  email: string;
  role: Rol;
  status: 'activo' | 'inactivo';
  assignedFarmIds: string[];
}

export interface Finca {
  id: string;
  name: string;
  location: string;
  cattleCount: number;
}

export interface Bovino {
  id: string;
  farmId: string;
  name: string;
  earTag: string;
  breed: string;
  sex: 'Macho' | 'Hembra';
  status: 'Activo' | 'Vendido' | 'Fallecido' | 'Inactivo';
  photoUrl: string;
  lastWeightKg: number;
  lastWeightDate: string;
}

export interface RegistroPeso {
  id: string;
  bovinoId: string;
  date: string;
  weightKg: number;
  source: 'IA' | 'Manual' | 'Bascula';
}
