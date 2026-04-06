# ByteHive CRM Frontend - Design & Architecture

This document outlines the technical architecture, design system, and coding patterns used in the ByteHive CRM frontend. It serves as a guide for developers and AI tools to understand the project's structure and aesthetic.

## 🛠 Tech Stack
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Customized for Industrial Dark)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)

## 🏗 Architecture: Domain-Driven Modular Structure
The project uses a **Domain-Driven Modular Structure**. Instead of grouping by technical type (e.g., all pages in one folder, all components in another), files are grouped by their functional domain (module) under `src/modules/`.

### Folder Structure Overview
```text
src/
├── components/          # Shared global UI components (Layout, Sidebar, etc.)
│   └── ui/              # shadcn/ui primitive components
├── context/             # Global state (AuthContext, etc.)
├── lib/                 # Utility functions (cn, axios config)
├── modules/             # Domain-specific modules
│   ├── auth/            # Login, Registration, Password recovery
│   │   ├── components/
│   │   └── pages/
│   ├── dashboard/       # Main overview and system metrics
│   ├── crm/             # Customer Relationship Management
│   ├── inventory/       # Stock and product management
│   └── ... (hr, sales, accounts, admin, etc.)
├── App.jsx              # Main router and provider setup
└── index.css            # Global styles and design tokens
```

## 🎨 Design System: "Industrial Dark"
The application follows a premium, minimalist **Industrial Dark** aesthetic. It is designed to feel high-end, precise, and professional.

### Color Palette (CSS Variables in index.css)
- **Background**: `#000000` (Pure Black)
- **Foreground**: `#FAFAFA` (High-contrast White)
- **Borders**: `white/5` (`rgba(255, 255, 255, 0.05)`) for an ultra-thin, subtle feel.
- **Accents**: `blue-500` (`#3b82f6`) used sparingly for focus, live status indicators, and primary actions.
- **Cards**: `white/[0.02]` background with `white/5` borders.

### Styling Patterns
- **Glows**: Subtle radial gradients (`white/5`) are used for depth without adding clutter.
- **Typography**: Uses the `Inter` variable font for high legibility and an industrial look.
- **Scrollbars**: Minimalist custom scrollbars (`4px` width, semi-transparent thumb) to avoid breaking the "single-screen" feel.
- **Transitions**: All interactive elements (buttons, links) use a `duration-200` transition for a smooth, high-quality experience.

## ⚙️ Key Patterns & Guidelines

### 1. Component Imports
Use the `@/` path alias for all imports to maintain clean and robust paths:
```javascript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
```

### 2. Styling with `cn()`
Always use the `cn()` utility for conditional class merging:
```javascript
import { cn } from '@/lib/utils';
<div className={cn("base-style", isActive && "active-style")}>
```

### 3. API & Authentication
- **Axios Config**: Configured in [AuthContext.jsx](file:///c:/Users/MY%20PC/bytehive/crm/src/context/AuthContext.jsx) with `withCredentials: true` and CSRF header handling.
- **Protected Routes**: Wrap all internal module routes in the `<ProtectedRoute>` component in [App.jsx](file:///c:/Users/MY%20PC/bytehive/crm/src/App.jsx).

### 4. Modular Development
When adding a new feature:
1. Create a new folder under `src/modules/[feature]`.
2. Add a `pages/` and `components/` subfolder.
3. Define the main view in `pages/` and extract reusable logic into `components/`.
4. Register the new route in `App.jsx`.
