# NOUN.exe — Interactive Character Showcase

A personal developer environment for **Noun (นาวน์)**, IT Developer / Logic Enthusiast.
*"Another day, another bug to fix."*

**Created by TST Project.** The interface is in English; all character information is in Thai, exactly as written by the owner.

---

## Sections

| # | Section | What it does |
| --- | --- | --- |
| 01 | **Boot** | Short system boot (≈2.5 s, skippable with the button, Esc, Enter or Space; shown once per browser session). Hero with the original artwork, live clock, session uptime and a typed tagline. |
| 02 | **About** | Developer ID card (face crop of the original art), the original bio, identity labels and animated decorative counters. |
| 03 | **Details & Triggers** | Triggers as acknowledgeable warning alerts; Personal Notes as a log, a stress slider that turns the world into equations, and a "ping during snack time" button. |
| 04 | **Preferences & Role** | Preferences, status and note as cards, original wording. |
| 05 | **Workspace** | Code editor (tabs, Run), working terminal, simulated system monitor, live statistics chart, break panel and project status. All panels share one state. |
| 06 | **About Parent** | The owner's interaction guidelines, original wording, as a readable document. |

### Interactive features

- **Terminal**: `help`, `about`, `profile`, `status`, `skills`, `coffee`, `snack`, `work`, `stats`, `calc <expr>`, `ls`, `cat <file>`, `run <file>`, `history`, `clear`, plus a few hidden replies. ↑/↓ history, Tab completion, Ctrl+L clears. `calc` uses its own safe parser (no `eval`).
- **Statistics**: mean, standard deviation, median, Pearson r and a least-squares fit are computed live from a fictional 14-day sample. *Resample* draws a new one.
- **Break panel**: coffee / snack / back to work. Updates the status strip, mug, monitor load and terminal `status`.
- **System monitor**: animated CPU/RAM/NET and processes. **Simulated values, not real hardware data**, and labelled as such.
- **Music player**: play/pause, volume, mute, track info, live visualiser. Never autoplays.
- **UI sounds**: quiet Web Audio blips for clicks, terminal and notifications. Toggle in the music player; the speaker icon in the top bar mutes everything.
- **Custom cursor**: crosshair with a short trail, only on mouse/trackpad devices. Touch devices and text fields keep the native cursor.

---

## Character artwork

The single original image lives at `public/images/noun.webp` (1500 × 2000, transparent background). It is displayed as supplied: no redraw, recolour or background removal. The hero shows it whole; the ID card crops to the face with CSS only.

To replace it, overwrite `public/images/noun.webp` with the same filename, or change `IMAGE_SRC` / `IMAGE_WIDTH` / `IMAGE_HEIGHT` in `src/data/noun.ts`.

## Character text

Every piece of character information is in **`src/data/noun.ts`**. The Thai strings are the owner's original wording. Do not rephrase, translate or "fix" them.

## Music

No third-party audio is included. By default the player synthesises an original ambient loop in the browser (Web Audio), so there is nothing to license.

To use your own **licensed or original** file:

1. Put it in `public/audio/`, e.g. `public/audio/night-shift.mp3`.
2. In `src/audio/config.ts` set:
   ```ts
   export const MUSIC_TRACK: MusicTrack = {
     kind: 'file',
     src: `${import.meta.env.BASE_URL}audio/night-shift.mp3`,
     title: 'Night Shift',
     artist: 'Artist name / licence',
   };
   ```

---

## Development

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type check + production build → dist/
npm run preview    # serve dist/ locally
```

### Project structure

```
public/images/noun.webp     original artwork
src/data/noun.ts            all character information (original text)
src/audio/                  Web Audio engine, music config, sound context
src/components/             nav, cursor, boot, music player, toasts, window chrome, clock
src/sections/               one component + stylesheet per section
src/sections/workspace/     editor, terminal, monitor, analytics, break panel, projects, shared state
src/lib/                    statistics, safe calculator, storage helpers
src/styles/global.css       palette tokens, base styles, shared UI
```

### Palette

| Token | Hex | Use |
| --- | --- | --- |
| Deep Black | `#080D16` | page background |
| Midnight Blue | `#111C2B` | panels |
| Slate Blue | `#26374B` | panels, tracks |
| Steel Blue | `#438BC4` | primary interactive |
| Ice Cyan | `#65C8ED` | highlights, active states |
| Silver Gray | `#B7C7D8` | secondary text |

---

## Deploying to GitHub Pages

`vite.config.ts` uses `base: './'`, so the build works at any path, including `https://<user>.github.io/<repo>/`, with no changes.

1. Create a new, empty GitHub repository for this project (keep it separate from other character sites).
2. Push this folder to its `main` branch.
3. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Each push to `main` runs `.github/workflows/deploy.yml` (install → type check → build → deploy `dist/`).
