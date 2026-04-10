# ByteHive CRM Frontend - Design & Architecture

This document outlines the design system, visual language, and coding patterns used in the ByteHive CRM frontend.

## 🛠 Tech Stack
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)

## 🎨 Design Philosophy: "Industrial Dark"

A premium, minimalist dark aesthetic designed to feel high-end, precise, and professional. The design prioritizes clarity through generous spacing, subtle depth through glassmorphism, and restrained use of color for status indication.

---

## 📐 Layout Architecture

### Page Structure
```
┌─────────────────────────────────────────────────────┐
│  HEADER (px-10 py-8)                               │
│  ┌──────────────────────┐  ┌─────────────────────┐  │
│  │ Title (text-4xl)     │  │ Actions (gap-4)     │  │
│  │ Subtitle (text-sm)   │  │ Search | Buttons    │  │
│  └──────────────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  MAIN CONTENT (p-10 space-y-[n])                    │
│  - Cards: grid with gap-6                           │
│  - Tables: bg-white/[0.02] rounded-2xl              │
│  - Flexible heights for content area               │
└─────────────────────────────────────────────────────┘
```

### Standard Spacing Scale
| Element | Spacing |
|---------|---------|
| Page padding | `px-10 py-8` |
| Section gap | `space-y-10` or `gap-8` |
| Card grid gap | `gap-6` |
| Card internal padding | `p-6` |
| Button groups | `gap-4` |
| Icon buttons | `p-1.5` to `p-3` |

---

## 🎭 Color System

### Base Colors (CSS Variables)
```css
--background: #000000       /* Pure black base */
--foreground: #FAFAFA      /* High-contrast white text */
--card: #080808            /* Slightly lifted surfaces */
--muted: #262626           /* Subtle backgrounds */
--border: #262626           /* Ultra-thin borders */
--input: #262626           /* Form field backgrounds */
```

### Transparency Scale (for overlays & glassmorphism)
| Token | Value | Usage |
|-------|-------|-------|
| `white/5` | 5% opacity | Card backgrounds, subtle borders |
| `white/10` | 10% opacity | Hover states, input backgrounds |
| `white/20` | 20% opacity | Secondary text, muted icons |
| `white/40` | 40% opacity | Body text, descriptions |

### Status Colors
| Status | Color | Usage |
|--------|-------|-------|
| Primary accent | `blue-500` (#3b82f6) | Live indicators, focus states, primary CTAs |
| Success | `green-500` | Won deals, positive trends |
| Warning | `amber-500` | Proposals, attention needed |
| Error | `red-500` | Lost deals, destructive actions |
| Info | `purple-500` | Qualified leads |

### Pipeline Stage Colors (CRM)
```
Lead        → blue-500   (from-blue-500/15)
Qualified   → purple-500 (from-purple-500/15)
Proposal    → amber-500  (from-amber-500/15)
Negotiation → orange-500 (from-orange-500/15)
Won         → green-500  (from-green-500/15)
Lost        → red-500    (from-red-500/15)
```

---

## 📏 Typography Scale

| Element | Size | Weight | Tracking | Color |
|---------|------|--------|----------|-------|
| Page title | `text-4xl` | `font-bold` | `tracking-tight` | `text-white` |
| Section heading | `text-lg` | `font-bold` | `tracking-tight` | `text-white` |
| Card title | `text-sm` | `font-bold` | default | `text-white` |
| Body text | `text-sm` | default | default | `text-white/80` |
| Labels | `text-xs` | `font-medium` | default | `text-white/60` |
| Badges/Tags | `text-[10px]` | `font-black` | `tracking-widest` | varies |
| Small text | `text-[9px]` | `font-medium` | `tracking-widest` | varies |

### Typography Rules
- **Headings**: Use `tracking-tight` for a modern, compressed look
- **Labels/Badges**: Uppercase with `tracking-widest` for industrial feel
- **Font**: Inter variable font for consistent rendering

---

## 🧩 Component Patterns

### Cards

**Standard Card:**
```jsx
<div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
```
- Hover: `hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300`

**Glassmorphism Glow Effect:**
```jsx
<div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full 
                 -translate-y-1/2 translate-x-1/2 blur-2xl" />
```

### Buttons

**Primary Button (for main actions):**
```jsx
<Button 
  variant="primary" 
  className="px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-black"
>
  Action
</Button>
```

**Secondary Button (for supporting actions):**
```jsx
<Button 
  variant="secondary" 
  size="sm" 
  className="h-9 px-4 bg-white/10 hover:bg-white/20 text-white/70 
             text-[10px] uppercase tracking-widest"
>
  Action
</Button>
```

**Button Hierarchy:**
1. **Primary**: Bright, full-width, used for main CTA
2. **Secondary**: Subtle ghost style, for supporting actions
3. **Icon buttons**: Square with icon, for toolbar actions

### Inputs

**Search/Text Input:**
```jsx
<div className="relative group">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 
                      group-focus-within:text-white/40" size={16} />
  <Input 
    className="pl-10 w-64 h-9 bg-white/10 border-white/10 
               focus:border-white/20 transition-all text-xs" 
  />
</div>
```

**Input States:**
- Default: `bg-white/10 border-white/10`
- Focus: `focus:border-white/20`
- Error: Red border with destructive color

### Badges & Tags

**Status Badge:**
```jsx
<span className="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest 
                  bg-blue-500/10 text-blue-400 border border-blue-500/20">
  Lead
</span>
```

**Live Indicator Badge:**
```jsx
<span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full 
                  bg-white/5 border border-white/10 text-[9px] font-black 
                  uppercase tracking-[0.2em] text-white/40">
  <span className="w-1 h-1 rounded-full bg-blue-500 
                   shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
  Live Operations
</span>
```

### Lists & Tables

**List Item Row:**
```jsx
<div className="group flex items-center justify-between p-4 
                hover:bg-white/[0.02] transition-colors cursor-pointer">
```

**Table Container:**
```jsx
<div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden 
                divide-y divide-white/5">
```

### Grid Layouts

**4-Column Stats Grid:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

**2/3 + 1/3 Split:**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">...</div>
  <div>...</div>
</div>
```

---

## 🔧 CSS Variables & Tokens

```css
/* Radius */
--radius: 0.75rem;  /* 12px - Standard rounded corners */

/* Borders */
border-white/5      /* Ultra-subtle separation */
border-white/10      /* Subtle emphasis */
border-white/20      /* Clear emphasis */

/* Backgrounds */
bg-white/[0.02]      /* Card surfaces */
bg-white/[0.05]      /* Elevated elements */
bg-white/[0.10]      /* Input fields, hover states */
```

---

## 📋 Design Checklist

When building new components, ensure:

- [ ] Background uses `bg-white/[0.02]` for cards
- [ ] Borders use `border-white/5` for subtle separation
- [ ] Text hierarchy follows the typography scale
- [ ] Interactive elements have hover states with `transition-all duration-200`
- [ ] Icons use `text-white/40` for muted, `text-white/80` for emphasis
- [ ] Badges use uppercase with `tracking-widest` and `text-[10px]`
- [ ] Buttons follow the primary/secondary hierarchy
- [ ] Grid gaps use `gap-6` standard spacing
- [ ] Page padding uses `px-10 py-8` for header areas

---

## 🏗 Architecture: Domain-Driven Modular Structure

```text
src/
├── components/
│   ├── Layout.jsx          # Main app shell
│   ├── Sidebar.jsx         # Navigation sidebar
│   └── ui/                 # Primitive UI components
├── context/
│   └── AuthContext.jsx     # Authentication state
├── lib/
│   ├── utils.js            # cn() utility
│   └── axios.js            # API configuration
├── modules/
│   ├── auth/               # Login, registration
│   ├── dashboard/          # Main overview
│   ├── crm/                # Pipeline management
│   └── ...                 # Other domains
├── App.jsx                 # Router configuration
└── index.css               # Global styles & design tokens
```
