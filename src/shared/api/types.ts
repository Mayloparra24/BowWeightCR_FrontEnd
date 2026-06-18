// DTOs snake_case que devuelve el backend (Resources Laravel).

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginatedMeta;
  error?: { code?: string; details?: unknown };
}

export interface PaginatedMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface UsuarioDTO {
  id: number;
  nombre_completo: string;
  correo_electronico: string;
  rol: 'administrador' | 'ganadero' | 'veterinario' | 'asistente';
  esta_activo: boolean;
  debe_cambiar_contrasena?: boolean;
  correo_verificado_en?: string | null;
  creado_en?: string | null;
}

export interface FincaDTO {
  id: number;
  propietario_id: number;
  nombre_finca: string;
  ubicacion?: string | null;
  canton?: string | null;
  provincia?: string | null;
  esta_activa: boolean;
  creado_en?: string | null;
}

export interface RazaDTO {
  id: number;
  nombre_raza: string;
  enfoque?: string | null;
  constante_peso: number;
  descripcion?: string | null;
}

export interface PesajeDTO {
  id: number;
  bovino_id: number;
  fotografia_id?: number | null;
  creado_por?: UsuarioDTO | null;
  peso_registrado?: number | null;
  peso_estimado?: number | null;
  peso_final: number;
  tipo_pesaje: 'manual' | 'ia';
  es_correccion_manual: boolean;
  notas_correccion?: string | null;
  confianza_ia?: number | null;
  registrado_el: string;
}

export interface BovinoDTO {
  id: number;
  finca_id: number;
  raza_id: number;
  numero_arete: string;
  nombre_animal: string | null;
  sexo: 'macho' | 'hembra';
  fecha_nacimiento?: string | null;
  estado: 'activo' | 'inactivo';
  motivo_inactividad?: string | null;
  fecha_inactividad?: string | null;
  notas?: string | null;
  creado_en?: string | null;
  finca?: FincaDTO | null;
  raza?: RazaDTO | null;
  pesajes?: PesajeDTO[];
}

export interface BitacoraDTO {
  id: number;
  usuario?: UsuarioDTO | null;
  accion: string;
  entidad_tipo: string;
  entidad_id: number;
  descripcion: string;
  direccion_ip?: string | null;
  creada_el: string;
}

export interface LoginDataDTO {
  token: string;
  usuario: UsuarioDTO;
}

export interface EstimacionOfflineDTO {
  fotografia_id: number;
  estado: string;
}
