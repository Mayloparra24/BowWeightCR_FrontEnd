import type {
  Bovino,
  BitacoraEvento,
  Finca,
  RegistroPeso,
  Raza,
  Rol,
  Usuario,
} from '@/shared/types/domain';
import type {
  BitacoraDTO,
  BovinoDTO,
  FincaDTO,
  PesajeDTO,
  RazaDTO,
  UsuarioDTO,
} from '@/shared/api/types';

const PHOTO_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><rect width="180" height="180" rx="22" fill="#d8e8f7"/><g fill="#5b8fc0"><path d="M44 70c-7-10-22-11-22-2 0 8 9 13 16 13zM136 70c7-10 22-11 22-2 0 8-9 13-16 13z"/><path d="M90 56c-25 0-43 16-43 38 0 20 14 36 43 36s43-16 43-36c0-22-18-38-43-38zm-18 44a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm36 0a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm-18 18c-8 0-14-4-14-8h28c0 4-6 8-14 8z"/></g></svg>',
  );

export const mapRol = (rol: UsuarioDTO['rol']): Rol => {
  if (rol === 'administrador') return 'admin';
  return rol;
};

export const formatFecha = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
};

export const mapUsuario = (dto: UsuarioDTO): Usuario => ({
  id: String(dto.id),
  fullName: dto.nombre_completo,
  email: dto.correo_electronico,
  role: mapRol(dto.rol),
  status: dto.esta_activo ? 'activo' : 'inactivo',
  mustChangePassword: dto.debe_cambiar_contrasena ?? false,
  creadoEn: dto.creado_en ?? undefined,
});

export const mapFinca = (dto: FincaDTO): Finca => {
  const partes = [dto.ubicacion, dto.canton, dto.provincia].filter((p): p is string => Boolean(p));
  return {
    id: String(dto.id),
    name: dto.nombre_finca,
    location: partes.join(', ') || 'Sin ubicación',
    provincia: dto.provincia ?? undefined,
    canton: dto.canton ?? undefined,
    activa: dto.esta_activa,
  };
};

export const mapRaza = (dto: RazaDTO): Raza => ({
  id: String(dto.id),
  nombre: dto.nombre_raza,
  enfoque: dto.enfoque ?? undefined,
  constantePeso: dto.constante_peso,
  descripcion: dto.descripcion ?? undefined,
});

export const mapPesaje = (dto: PesajeDTO): RegistroPeso => ({
  id: String(dto.id),
  bovinoId: String(dto.bovino_id),
  date: formatFecha(dto.registrado_el),
  weightKg: dto.peso_final,
  source: dto.tipo_pesaje === 'ia' ? 'IA' : 'Manual',
  pesoEstimado: dto.peso_estimado,
  confianzaIa: dto.confianza_ia,
  esCorreccion: dto.es_correccion_manual,
  notasCorreccion: dto.notas_correccion,
});

export const mapBovino = (dto: BovinoDTO): Bovino => {
  const pesajes = (dto.pesajes ?? []).map(mapPesaje);
  const ultimo = pesajes[0];

  return {
    id: String(dto.id),
    farmId: String(dto.finca_id),
    name: dto.nombre_animal ?? `Bovino ${dto.numero_arete}`,
    earTag: dto.numero_arete,
    breed: dto.raza?.nombre_raza ?? 'Sin raza',
    breedId: String(dto.raza_id),
    sex: dto.sexo === 'macho' ? 'Macho' : 'Hembra',
    status: dto.estado === 'activo' ? 'Activo' : 'Inactivo',
    photoUrl: PHOTO_PLACEHOLDER,
    lastWeightKg: ultimo?.weightKg ?? 0,
    lastWeightDate: ultimo?.date ?? '',
    birthDate: dto.fecha_nacimiento ?? undefined,
    observations: dto.notas ?? undefined,
    motivoInactividad: dto.motivo_inactividad ?? undefined,
    pesajes,
  };
};

export const mapBitacora = (dto: BitacoraDTO): BitacoraEvento => ({
  id: String(dto.id),
  usuarioId: dto.usuario ? String(dto.usuario.id) : undefined,
  usuarioNombre: dto.usuario?.nombre_completo,
  accion: dto.accion,
  entidadTipo: dto.entidad_tipo,
  entidadId: String(dto.entidad_id),
  descripcion: dto.descripcion,
  direccionIp: dto.direccion_ip ?? undefined,
  creadaEl: formatFecha(dto.creada_el),
});

export { PHOTO_PLACEHOLDER };
