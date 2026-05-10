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
  {/* Right: Action Toolbar (Search Refinement / CTEs) */}
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

### Interactive Stat Cards
- **Base Style**: `p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl`
- **Animation**: Subtle scale up (`hover:scale-[1.02]`) and color shift for icon containers.

### High-Capacity Buttons
- **Primary Action**: Blue background, text-[10px], rounded-lg, tracking-widest, font-medium.
- **Secondary Tool**: `bg-zinc-900/30` with subtle zinc borders, strictly `!w-auto`.

### The Industrial Registry (Detail Modals)
Used for deep data exploration (Contacts, Deal Details).
- **Layout**: Two-column split-screen (`max-w-3xl`) with a connected vertical divider.
- **Divider**: A subtle `w-px bg-white/5` line that spans exactly from header border to footer border.
- **Scroll Architecture**: Independent scrolling for the registry section while maintaining a fixed header and footer.
- **Corner Radius**: Standardized to `rounded-lg` for the main container and avatar; `rounded-md` for internal data badges.
- **Action Toolbar**: Top-right placement for record management (Edit/Delete).
  - **Edit**: `TbEdit` (size 21, blue accent)
  - **Delete**: `Trash2` (size 19, red accent)

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

### Sliding Navigation Tabs
Primary mode switcher for dashboard views.
- **Structure**: A fixed-width container with a prominent `border-white/20`.
- **Highlighter**: A sliding `bg-blue-500/20` div that glides between active states.
- **Geometry**: Internal edges of the highlighter are **sharp** (e.g., `rounded-r-none` when left-aligned) to simulate a connected mechanical assembly.
- **Hierarchy**: Inactive tabs use `text-white/50`, while active tabs use the primary `text-blue-400`.

---

## 📋 Operational Design Checklist

Every new feature must satisfy:
- [ ] Does it use the **Pitched Void** (#000000) as the base?
- [ ] Are primary containers using the **`bg-zinc-900/30`** / **`border-zinc-800`** material combo?
- [ ] Is the header using **`backdrop-blur-xl`** and anchored with a zinc-800 border?
- [ ] Are badges and labels following the **Industrial Typography** (Upper case + Wide tracking + Medium weight)?
- [ ] Does the page feel like a specific **Technical Instrument** (high scannability, no fluff)?

---

## 🏗 Architecture: Domain-Driven Modular Structure

```text
src/
├── components/             # Global primitives (Buttons, Inputs, Shell)
├── context/                # Global state (Auth, Notification)
├── modules/
│   ├── crm/                # Pipeline/Deals domain
│   ├── contacts/           # Repository/Ingestion domain
│   ├── invoice/            # Financial/PDF domain
│   └── ...                 # Future modules
```
