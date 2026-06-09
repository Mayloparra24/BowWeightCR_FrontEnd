export type UserRole = 'ganadero' | 'veterinario' | 'admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: 'activo' | 'inactivo';
  assignedFarmIds: string[];
}

export interface Farm {
  id: string;
  name: string;
  location: string;
  cattleCount: number;
}

export interface Animal {
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

export interface WeightRecord {
  id: string;
  animalId: string;
  date: string;
  weightKg: number;
  source: 'IA' | 'Manual' | 'Bascula';
}
