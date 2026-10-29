import { Permission } from 'data-access';

/**
 * Qué permite cada permiso, en lenguaje del equipo (para la pantalla de
 * roles). TODO(contenido): validar los textos con el equipo.
 */
export const PERMISSION_LABELS: Readonly<Record<Permission, string>> = {
  'admin.access': 'Entrar al panel',
  'offers.read': 'Ver ofertas',
  'offers.write': 'Crear y editar ofertas',
  'offers.publish': 'Publicar ofertas',
  'attendance.read': 'Ver asistencia',
  'attendance.write': 'Registrar asistencia',
  'applications.read': 'Ver postulaciones',
  'applications.evaluate': 'Evaluar postulaciones',
  'applications.interview': 'Agendar entrevistas',
  'applications.decide': 'Registrar decisiones',
  'followup.read': 'Ver seguimiento',
  'followup.manage': 'Gestionar seguimiento',
  'payments.read': 'Ver pagos',
  'payments.manage': 'Gestionar pagos y reembolsos',
  'users.manage': 'Gestionar administradores',
  'audit.read': 'Ver auditoría',
  'contact.read': 'Ver mensajes de contacto',
  'contact.manage': 'Gestionar mensajes de contacto',
  'meetings.create': 'Crear reuniones de Zoom o Meet',
  'site.write': 'Editar las cifras de la landing',
  'scholarship_types.write': 'Administrar los tipos de beca',
};
