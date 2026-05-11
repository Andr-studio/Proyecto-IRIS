🌌 Proyecto IRIS: Clarity Flow
Clarity Flow es una solución SaaS B2B de gestión operativa diseñada para empresas de servicios técnicos y mantenimiento. El sistema permite centralizar la comunicación entre la administración, los equipos de terreno y los clientes finales a través de un entorno seguro y jerarquizado.

🏗️ Arquitectura del Sistema
El proyecto se basa en una estructura Multi-tenant pura, donde cada empresa (Workspace) opera en una "isla" de datos aislada, garantizando que la información financiera y operativa nunca se filtre entre organizaciones.

👑 Jerarquía de Usuarios y Roles
Owner (Dueño): El creador del Workspace. Posee control total sobre la facturación, gestión de Admins y acceso exclusivo a los registros de auditoría.

Admin (Supervisor): Gestor operativo con visibilidad global de todas las Órdenes de Trabajo (OT) del Workspace. Administra el equipo técnico y la relación con los clientes.

Team (Técnico): Usuarios de ejecución que solo visualizan tareas aceptadas y asignadas. Pueden subir evidencias multimedia y participar en chats específicos por tarea.

Client (Cliente): Solo visualiza sus propias OTs y posee la autoridad de aprobar o rechazar tareas propuestas antes de su ejecución.

🚀 Módulos Principales
📋 Gestión de OTs y Tareas "Checklist"
Flujo de Aprobación: Las OTs se crean con tareas propuestas que el cliente debe validar.

Visibilidad Selectiva: El equipo técnico solo recibe notificaciones de tareas que ya han sido aceptadas por el cliente.

💬 Chat Contextual (WhatsApp Style)
Hilo de conversación único por cada tarea para evitar la dispersión de información.

Sincronización en tiempo real mediante sub-colecciones de Firestore.

📄 Documentación y Validación
Gestión de archivos con toggle de validación: el Admin decide qué documentos requieren firma o aprobación del cliente (ej. cotizaciones) y cuáles son solo informativos (ej. boletas).

🔔 Notificaciones Cruzadas
Sistema de alertas automáticas para aprobaciones de clientes, carga de evidencias técnicas y nuevos mensajes.

🛠️ Stack Tecnológico
Frontend: Next.js (App Router) con TypeScript.

Estética: Framer Motion (animaciones premium) y Lucide React (iconografía).

Backend: Firebase Auth y Firestore (Base de datos NoSQL).

Seguridad: Firebase Admin SDK para gestión corporativa de usuarios y Firestore Rules para aislamiento Multi-tenant.

Almacenamiento: Firebase Storage para evidencias multimedia y logotipos.

⚙️ Configuración del Entorno
Para habilitar el motor de gestión de usuarios (Admin SDK), es necesario configurar las siguientes variables en el archivo .env.local:

Bash
NEXT_PUBLIC_FIREBASE_API_KEY="tu_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu_auth_domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="iris-project-id"

# Firebase Admin SDK (Requerido para API de Invitaciones)
FIREBASE_ADMIN_PROJECT_ID="iris-project-id"
FIREBASE_ADMIN_CLIENT_EMAIL="tu_service_account_email"
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
🛡️ Seguridad y Auditoría
El sistema implementa un Audit Log exclusivo para el Owner, registrando cada acción crítica: creación de usuarios, edición de marcas y cambios de estado en las OTs, asegurando trazabilidad total en cada Workspace.

Desarrollado e implementado para la eficiencia operativa en Antofagasta, Chile.