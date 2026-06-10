import type { Bovino, Finca, RegistroPeso, Usuario } from '@/shared/types/domain';

export const usuariosDemo: Usuario[] = [
  {
    id: 'user-admin',
    fullName: 'Mayo Parra',
    email: 'admin@bovweight.cr',
    role: 'admin',
    status: 'activo',
    assignedFarmIds: ['farm-esperanza', 'farm-palmas', 'farm-coyol'],
  },
  {
    id: 'user-ganadero',
    fullName: 'Ivan Chavarria',
    email: 'ivan@bovweight.cr',
    role: 'ganadero',
    status: 'activo',
    assignedFarmIds: ['farm-esperanza'],
  },
  {
    id: 'user-vet',
    fullName: 'Dr. Roberto Solano',
    email: 'solano@vet.cr',
    role: 'veterinario',
    status: 'activo',
    assignedFarmIds: ['farm-esperanza', 'farm-palmas'],
  },
];

export const fincas: Finca[] = [
  {
    id: 'farm-esperanza',
    name: 'La Esperanza',
    location: 'Liberia',
    cattleCount: 180,
  },
  {
    id: 'farm-palmas',
    name: 'Las Palmas',
    location: 'Bagaces',
    cattleCount: 94,
  },
  {
    id: 'farm-coyol',
    name: 'El Coyol',
    location: 'Liberia',
    cattleCount: 52,
  },
];

export const bovinos: Bovino[] = [
  {
    id: 'bovino-chirriche',
    farmId: 'farm-esperanza',
    name: 'El chirriche',
    earTag: '188012340056789',
    breed: 'Brahman',
    sex: 'Macho',
    status: 'Activo',
    photoUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=180&q=80',
    lastWeightKg: 450,
    lastWeightDate: '27/12/2024',
  },
  {
    id: 'bovino-sombra',
    farmId: 'farm-esperanza',
    name: 'Sombra',
    earTag: '188012340056790',
    breed: 'Holstein',
    sex: 'Hembra',
    status: 'Activo',
    photoUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=180&q=80',
    lastWeightKg: 521,
    lastWeightDate: '10/09/2024',
  },
  {
    id: 'bovino-ziggy',
    farmId: 'farm-palmas',
    name: 'Ziggy',
    earTag: '188012340056791',
    breed: 'Pardo Suizo',
    sex: 'Macho',
    status: 'Activo',
    photoUrl: 'https://images.unsplash.com/photo-1535435734705-4f0f32e27c83?auto=format&fit=crop&w=180&q=80',
    lastWeightKg: 428,
    lastWeightDate: '19/10/2024',
  },
];

export const registrosPeso: RegistroPeso[] = [
  {
    id: 'weight-1',
    bovinoId: 'bovino-chirriche',
    date: '27/12/2024',
    weightKg: 450,
    source: 'IA',
  },
  {
    id: 'weight-2',
    bovinoId: 'bovino-chirriche',
    date: '10/09/2024',
    weightKg: 420,
    source: 'Manual',
  },
  {
    id: 'weight-3',
    bovinoId: 'bovino-chirriche',
    date: '03/06/2024',
    weightKg: 385,
    source: 'IA',
  },
];
