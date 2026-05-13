# ByteHive CRM Frontend - Design & Architecture

This document outlines the core design system, visual philosophy, and component patterns that define the ByteHive "Industrial Instrument" aesthetic.

## 🎨 Design Philosophy: "Industrial Instrument"

ByteHive is designed to feel like a high-end, precision technical instrument rather than a generic web application. The aesthetic balances a minimalist dark mode with atmospheric depth and mechanical definition.

### 🌌 Atmospheric Depth
- **The Pitched Void**: The primary background is always a true **Black (#000000)**, but it is never a flat void.
- **Structural Grid**: A fixed `radial-gradient` point grid (32px intervals) provides a subtle sense of scale and technical precision.
- **Ambient Glow**: Soft, moving radial "blobs" in the background (using `blur-[120px]`) provide tactile depth and prevent visual fatigue.

### 💡 Lighting Architecture: "Top-Down Illumination"
- **Instrument Header**: Headers use a semi-transparent `bg-black/50` with high-intensity `backdrop-blur-xl`.
- **Radial Lighting**: All primary page headers are illuminated from the top-center using a radial gradient that fades into the repository area.
- **Micro-Glows**: Interactive elements (stats, buttons, rows) feature subtle blue or neutral glows on hover to simulate a digital "powered-on" state.

### ⚙️ Materiality & Borders
- **Mechanical Gray**: Primary data containers (Kanban stages, Repositories, Modals) use a solid **`bg-zinc-900/30`** background.
- **Sharp Definition**: Borders are never "soft" or blurry. Use **`border-zinc-800`** for primary container definition and `border-white/5` for ultra-subtle internal dividers.
- **Refined Glass**: Glassmorphism is used sparingly for overlays, typically with `bg-white/[0.02]` and `border-white/10`.

---

## 🛠 Tech Stack
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: Custom-built with Radix/shadcn primitives
- **Icons**: [Lucide React](https://lucide.dev/) (Thin/Normal weights only)
- **Utility**: Use `cn()` from `@/lib/utils` for conditional class merging

---

## 📐 Layout Architecture

### Standard Spacing Scale
| Element | Spacing |
|---------|---------|
| Page padding | `px-10 py-8` |
| Section gap | `space-y-10` or `gap-8` |
| Card grid gap | `gap-6` |
| Card internal padding | `p-6` |
| Button groups | `gap-4` |
| Modal width (Wide) | `max-w-3xl` |
| Modal width (Slim) | `max-w-md` |

### The Unified Header (Standard Pattern)
```jsx
<header className="px-10 py-8 flex justify-between items-end border-b border-zinc-800 relative z-20 bg-black/50 backdrop-blur-xl shrink-0">
  {/* Left: Component Identity */}
  <div className="space-y-1">
    <h1 className="text-2xl font-semibold text-white">Page Title</h1>
    <p className="text-sm text-white/40">Page description</p>
  </div>
  {/* Right: Action Toolbar (Search Refinement / CTEs) */}
  <div className="flex items-center gap-3">
    {/* Action buttons go here */}
  </div>
</header>
```

---

## 🎭 Color System

### Technical Base
```css
--background: #000000       /* Deep Field */
--instrument: #18181b       /* zinc-900 - Technical container base */
--material: #27272a         /* zinc-800 - Borders and dividers */
--accent: #3b82f6           /* blue-500 - Operational primary color */
```

### High-Density Transparency Scale
| Token | usage |
|-------|-------|
| `zinc-900/30` | Standard Mechanical Background |
| `white/10` | Interactive Hover States |
| `white/40` | Tertiary Labels / Muted Meta-data |
| `white/60` | Body Text / Primary Labels |

### Global Status Indicators
| Status | Accent |
|--------|-------|
| **Live/Primary** | `blue-500` |
| **Success** | `green-500` |
| **Warning** | `amber-500` |
| **Critical** | `red-500` |

---

## 🧩 Component Blueprints

### The Technical Repository (Table/Grid)
Repositories must be house in a visible, minimum-height container to anchor the page.
- **Base Style**: `bg-zinc-900/30 border border-zinc-800 rounded-xl shadow-xl min-h-[500px]`
- **Row Style**: `hover:bg-white/[0.02] transition-all duration-300 border-b border-zinc-800`
- **Fixed Header/Footer**: Table headers and footers should be fixed, with only the content area scrollable

### Interactive Stat Cards
- **Base Style**: `p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl`
- **Animation**: Subtle scale up (`hover:scale-[1.02]`) and color shift for icon containers.

### High-Capacity Buttons
- **Primary Action**: Blue background, text-[10px], rounded-lg, tracking-widest, font-medium.
- **Secondary Tool**: `bg-zinc-900/30` with subtle zinc borders, strictly `!w-auto`.
- **Icon-Only Tool Buttons**: `h-8 w-8 rounded-md bg-zinc-900/50 border border-zinc-800 text-white/40 hover:text-white hover:bg-zinc-800 transition-all flex items-center justify-center`

### The Industrial Registry (Detail Modals)
Used for deep data exploration (Contacts, Deal Details).
- **Layout**: Two-column split-screen (`max-w-3xl`) with a connected vertical divider.
- **Divider**: A subtle `w-px bg-white/5` line that spans exactly from header border to footer border.
- **Scroll Architecture**: Independent scrolling for the registry section while maintaining a fixed header and footer.
- **Corner Radius**: Standardized to `rounded-lg` for the main container and avatar; `rounded-md` for internal data badges.
- **Action Toolbar**: Top-right placement for record management (Edit/Delete).
  - **Edit**: `TbEdit` (size 21, blue accent)
  - **Delete**: `Trash2` (size 19, red accent)
- **Portal**: Always use React's `createPortal` for modals, rendering to `document.body`

### Standard Global Loader (`RingLoader`)
Used for all async states and pipeline transitions.
- **Design**: A 12-bar technical spinner (`54px` x `54px`).
- **Interaction**: Uses a non-linear fade animation (`fade458`) to simulate a rotating "powered-on" mechanical sensor.
- **Materiality**: Subtle `rgb(128, 128, 128)` bars with micro-shadows for tactile definition against the void.

### Module Configuration Cards (The Actions Grid)
Used for high-level operational modules.
- **Visuals**: `bg-zinc-900/30` with color-coded ambient glows (`blur-3xl`, `opacity-20`) in the top-right corner on hover.
- **Micro-Animations**: 
  - Card: Subtle `scale-[1.02]` on hover.
  - Icons: `scale-110` with zero rotation (maintain level horizon).
- **Typography**: Industrial Medium (Upper case + Tracking). Footer utilizes a "Configure" CTE with a directional arrow.

### Sliding Navigation Tabs (Pill-Based)
Primary mode switcher for dashboard views. Must be used for all tab navigation.
- **Structure**: A fixed-width container with `relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md`.
- **Highlighter**: A sliding `absolute inset-y-0 bg-blue-500/20` div with `transition-all duration-300` that glides between active states.
- **Width Calculation**: 
  - 2 tabs: `w-1/2` for each
  - 3 tabs: `w-1/3` for each
- **Geometry**: Internal edges of the highlighter are **sharp** (e.g., `rounded-l rounded-r-none` when left-aligned, `rounded-r rounded-l-none` when right-aligned) to simulate a connected mechanical assembly.
- **Hierarchy**: 
  - Inactive tabs: `text-white/50 hover:text-white/80`
  - Active tabs: `text-blue-400`
- **Typography**: All tabs must use `text-[10px] font-medium uppercase tracking-[0.2em]`
- **JSX Example (3 tabs)**:
```jsx
<div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
  <div 
    className={cn(
      "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
      activeTab === 'users' 
        ? "left-0 w-1/3 rounded-l rounded-r-none bg-blue-500/20" 
        : activeTab === 'groups'
        ? "left-1/3 w-1/3 bg-blue-500/20"
        : "left-2/3 w-1/3 rounded-r rounded-l-none bg-blue-500/20"
    )}
  />
  <button
    onClick={() => setActiveTab('users')}
    className={cn(
      "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
      activeTab === 'users' ? "text-blue-400" : "text-white/50 hover:text-white/80"
    )}
  >
    Users
  </button>
  <button
    onClick={() => setActiveTab('groups')}
    className={cn(
      "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
      activeTab === 'groups' ? "text-blue-400" : "text-white/50 hover:text-white/80"
    )}
  >
    Groups
  </button>
  <button
    onClick={() => setActiveTab('audit')}
    className={cn(
      "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
      activeTab === 'audit' ? "text-blue-400" : "text-white/50 hover:text-white/80"
    )}
  >
    Audit Log
  </button>
</div>
```
- **JSX Example (2 tabs)**:
```jsx
<div className="relative flex items-center p-1 bg-white/[0.02] border border-white/20 rounded-md">
  <div 
    className={cn(
      "absolute inset-y-0 shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all duration-300 ease-out z-0",
      activeTab === TABS.CONTACTS 
        ? "left-0 w-1/2 rounded-l rounded-r-none bg-blue-500/20" 
        : "left-1/2 w-1/2 rounded-r rounded-l-none bg-blue-500/20"
    )}
  />
  <button
    onClick={() => setActiveTab(TABS.CONTACTS)}
    className={cn(
      "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
      activeTab === TABS.CONTACTS ? "text-blue-400" : "text-white/50 hover:text-white/80"
    )}
  >
    Contacts
  </button>
  <button
    onClick={() => setActiveTab(TABS.IMPORTS)}
    className={cn(
      "relative z-10 px-6 py-1.5 rounded text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
      activeTab === TABS.IMPORTS ? "text-blue-400" : "text-white/50 hover:text-white/80"
    )}
  >
    Imports
  </button>
</div>
```

### List View Modal (GroupUserModal style)
For showing a list of items in a modal:
- **Structure**: Uses `createPortal` to render to `document.body`
- **Layout**: Header with title and icon, scrollable content area, footer with close button
- **Styling**: Uses `bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]`
- **Content**: Grid-based layout for list items with perfect alignment

---

## 📋 Operational Design Checklist

Every new feature must satisfy:
- [ ] Does it use the **Pitched Void** (#000000) as the base?
- [ ] Are primary containers using the **`bg-zinc-900/30`** / **`border-zinc-800`** material combo?
- [ ] Is the header using **`backdrop-blur-xl`** and anchored with a zinc-800 border?
- [ ] Are badges and labels following the **Industrial Typography** (Upper case + Wide tracking + Medium weight)?
- [ ] Does the page feel like a specific **Technical Instrument** (high scannability, no fluff)?
- [ ] Are tabs using the **Sliding Navigation Tabs** pattern if applicable?
- [ ] Are modals using **createPortal**?
- [ ] Is `cn()` being used for conditional Tailwind class merging?

---

## 🏗 Architecture: Domain-Driven Modular Structure

```text
src/
├── components/             # Global primitives (Buttons, Inputs, Shell)
├── context/                # Global state (Auth, Notification)
├── modules/
│   ├── crm/                # Pipeline/Deals domain
│   ├── contacts/           # Repository/Ingestion domain
│   ├── admin/              # User/Organization management domain
│   ├── invoice/            # Financial/PDF domain
│   └── ...                 # Future modules
```
