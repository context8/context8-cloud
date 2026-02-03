# Dashboard UI evidence (reference dashboard)

This repo **does not copy third-party assets**. This note records **measured values** (computed styles + CSS tokens) used to reproduce layout and visual rhythm.

Evidence capture:
- Browser automation: `agent-browser` via CDP `9222`
- Viewport: `1440x900`
- Reference URL (logged-in): `https://<reference-site>/dashboard/project/<project-id>`
- Screenshots (local only, not committed):
  - `/tmp/sb-project-ctx8-evidence-light.png`
  - `/tmp/sb-project-ctx8-evidence-dark.png`

## Sidebar tokens (from `:root`, HSL triplets)

Light:
- `--sidebar-background`: `0deg 0% 98.8%`
- `--sidebar-accent`: `0deg 0% 92.9%`
- `--sidebar-border`: `0deg 0% 87.5%`
- `--sidebar-foreground`: `0deg 0% 9%`
- `--sidebar-accent-foreground`: `0deg 0% 9%`

Dark (via `prefers-color-scheme: dark`):
- `--sidebar-background`: `0deg 0% 9%`
- `--sidebar-accent`: `0deg 0% 19.2%`
- `--sidebar-border`: `0deg 0% 18%`
- `--sidebar-foreground`: `0deg 0% 98%`
- `--sidebar-accent-foreground`: `0deg 0% 98%`

## Key computed styles (pixels)

### Sidebar background (`div.bg-sidebar`)
- Light: `background-color: rgb(252, 252, 252)`
- Dark: `background-color: rgb(23, 23, 23)`

### Sidebar active menu item (`a[data-sidebar="menu-button"][data-active="true"]`)
- `height: 32px`
- `padding: 8px 8px 8px 6px`
- `border-radius: 6px`
- `font-size: 14px`
- `font-weight: 500`
- Light:
  - `background-color: rgb(237, 237, 237)`
  - `color: rgb(23, 23, 23)`
- Dark:
  - `background-color: rgb(49, 49, 49)`
  - `color: rgb(250, 250, 250)`

### Topbar Search pill (`button` text starts with `Search...`)
- `height: 30px`
- `padding: 8px 4px 8px 8px`
- `border-radius: 9999px`
- `font-size: 14px`
- `font-weight: 400`
- Light:
  - `border: 1px solid rgb(223, 223, 223)`
  - `color: rgb(112, 112, 112)`
- Dark:
  - `border: 1px solid rgb(46, 46, 46)`
  - `color: rgb(137, 137, 137)`

### Topbar primary pill (“Connect” in the reference)
- `height: 26px`
- `padding: 4px 10px`
- `border-radius: 9999px`
- `font-size: 12px`
- `font-weight: 400`
- Light:
  - `background-color: rgb(253, 253, 253)`
  - `border: 1px solid rgb(212, 212, 212)`
  - `color: rgb(23, 23, 23)`
- Dark:
  - `background-color: rgb(36, 36, 36)`
  - `border: 1px solid rgb(54, 54, 54)`
  - `color: rgb(250, 250, 250)`
