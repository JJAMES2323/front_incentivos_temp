# Sistema de Gestión de Producción - Frontend

Frontend moderno para la gestión de producción, empleados, órdenes y liquidaciones. Construido con **Next.js 16**, **React 19**, **MUI v9** y **Tailwind CSS v4**.

## 🚀 Tecnologías

| Categoría | Tecnologías |
|-----------|-------------|
| **Framework** | Next.js 16.2.0 (App Router) |
| **UI** | MUI v9, Radix UI, Lucide Icons |
| **Estilos** | Tailwind CSS v4, CSS Animations, Glassmorphism |
| **Tablas** | MUI X Data Grid |
| **Calendario** | Custom calendario tipo Teams |
| **Gráficos** | Recharts |
| **Formularios** | React Hook Form + Zod |
| **HTTP** | Axios |
| **Paquete** | pnpm |

## ✨ Características

- **🎨 UI Moderna** - Gradientes, glassmorphism, animaciones fluidas, tema claro/oscuro
- **📊 Dashboard** - Vista general con estadísticas y accesos rápidos
- **📅 Calendario tipo Teams** - Gestión visual de turnos por módulo (M1/M2) con cuadrícula mensual
- **🔍 Tablas avanzadas** - Filtros combinables por columna, búsqueda global, diseño responsive
- **🔐 Autenticación** - Login con roles (ADMIN, RH, PRODUCCION) y rutas protegidas
- **📱 Responsive** - Sidebar colapsable en móvil
- **🌙 Modo Oscuro** - Toggle con persistencia en localStorage

## 📁 Estructura

```
front/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Layout raíz con providers
│   ├── page.tsx            # Dashboard principal
│   ├── login/              # Página de autenticación
│   ├── empleados/          # CRUD empleados
│   ├── ordenes/            # CRUD órdenes de producción
│   ├── registros/          # Registros de producción
│   ├── logs/               # Registros laborados (calendario)
│   ├── liquidaciones/      # Liquidaciones por módulo
│   ├── referencias/        # Referencias de producto
│   └── usuarios/           # Gestión de usuarios
├── components/             # Componentes reutilizables
│   ├── EnhancedDataTable   # Tabla con filtros por columna
│   ├── WorkLogCalendar     # Calendario tipo Teams
│   ├── Dashboard           # Panel de estadísticas
│   ├── Header.tsx          # Barra superior con glassmorphism
│   ├── Sidebar.tsx         # Navegación lateral
│   └── ui/                 # Componentes shadcn/ui
├── contexts/               # Contextos de React (Auth, Theme)
├── lib/                    # Utilidades, API, tipos, tema MUI
└── styles/                 # CSS global
```

## 🛠️ Instalación

```bash
# Instalar dependencias
pnpm install

# Variables de entorno (crear archivo .env.local)
cp .env.example .env.local

# Iniciar servidor de desarrollo
pnpm dev

# Construir para producción
pnpm build

# Iniciar en producción
pnpm start
```

## 🔧 Configuración

### Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL del backend API | `http://localhost:3000/api` |

## 📄 Scripts disponibles

```bash
pnpm dev      # Inicia servidor de desarrollo (puerto 3001)
pnpm build    # Compila para producción
pnpm start    # Inicia servidor de producción
pnpm lint     # Ejecuta ESLint
```

## 🔑 Roles de usuario

| Rol | Acceso |
|-----|--------|
| **ADMIN** | Acceso total a todos los módulos |
| **RH** | Empleados |
| **PRODUCCION** | Referencias, Órdenes, Registros, Logs, Liquidaciones |

## 🎨 Diseño

### Paleta de colores
- **Primario:** Índigo (`#6366f1` → `#8b5cf6`)
- **Secundario:** Rosa (`#ec4899`)
- **Éxito:** Verde esmeralda (`#10b981`)
- **Advertencia:** Ámbar (`#f59e0b`)

### Tipografía
- **Principal:** Inter (Google Fonts)
- **Pesos:** 300-900

## 📋 APIs del Backend

El frontend consume los siguientes endpoints del backend:

| Recurso | Endpoints |
|---------|-----------|
| `Auth` | `POST /auth/login` |
| `Usuarios` | `GET/POST/PUT/DELETE /users` |
| `Empleados` | `GET/POST/PUT/DELETE /employees` |
| `Referencias` | `GET/POST/PUT/DELETE /references` |
| `Órdenes` | `GET/POST/PUT/DELETE /orders` |
| `Registros` | `GET/POST/PUT/DELETE /records` |
| `WorkLogs` | `GET/POST/PUT/DELETE /worklogs` |
| `Liquidaciones` | `GET/POST /liquidations` |

## 🖥️ Requisitos del sistema

- Node.js 18+
- pnpm 9+
- Backend API corriendo

## 📝 Licencia

Privado - Uso interno
