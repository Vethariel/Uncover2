# Uncover

Mina nórdica en rejilla (estilo Bomberman): explora con linterna, abre galerías con bombas y pico, forja mejoras en el taller y sigue la historia del viajero.

**Jugar (GitHub Pages):** https://vethariel.github.io/Uncover2/

> Si el enlace aún no abre, activa Pages en el repo (pasos abajo) y espera el primer deploy de Actions.

---

## Requisitos

- Node.js 20+ (recomendado 22)
- npm

## Desarrollo local

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`).

```bash
npm test          # tests unitarios
npm run build     # build de producción en dist/
npm run preview   # sirve dist/ en local
```

Para probar el build **como en Pages** (base `/Uncover2/`):

```bash
VITE_BASE_PATH=/Uncover2/ npm run build
VITE_BASE_PATH=/Uncover2/ npm run preview
```

Luego abre la URL que indique preview (suele ser `http://localhost:4173/Uncover2/`).

---

## Controles

| Tecla | Acción |
|-------|--------|
| **WASD** / flechas | Mover |
| **Espacio** | Colocar bomba / confirmar (diálogos, menús) |
| **Q** | Pico (minar) |
| **E** | Interactuar (cofre, taller, etc.) |
| **Esc** | Pausa |

---

## Stack

- [Phaser 3](https://phaser.io/) — render y escenas
- [Vite](https://vitejs.dev/) — bundler y dev server
- [Vitest](https://vitest.dev/) — tests

Arquitectura a grandes rasgos: lógica de juego en `src/game/`, presentación en `src/phaser/`, reglas y diseño en `docs/`.

---

## Documentación

| Doc | Contenido |
|-----|-----------|
| [`docs/DESIGN.md`](docs/DESIGN.md) | Reglas de gameplay (tiles, bombas, vision…) |
| [`docs/VISION_LIGHT.md`](docs/VISION_LIGHT.md) | Luz, niebla y visión |
| [`docs/NARRATIVE.md`](docs/NARRATIVE.md) | Arco narrativo |
| [`docs/MOVEMENT_I.md`](docs/MOVEMENT_I.md) | Movimiento I — Las Minas |
| [`docs/PROCEDURAL_LEVELS.md`](docs/PROCEDURAL_LEVELS.md) | Generación procedural |
| [`docs/CRAFTING.md`](docs/CRAFTING.md) | Materiales y forja |
| [`docs/VISUAL_STYLE.md`](docs/VISUAL_STYLE.md) | Dirección visual |

---

## Despliegue en GitHub Pages

El workflow [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) construye y publica `dist/` en cada push a `main`.

### Una sola vez en GitHub

1. Repo → **Settings** → **Pages**
2. **Source:** GitHub Actions
3. (Opcional) confirma que el nombre del repo coincide con `VITE_BASE_PATH` en el workflow  
   - Repo `Uncover2` → `VITE_BASE_PATH: /Uncover2/`
4. Haz push a `main` o ejecuta **Actions** → *Deploy GitHub Pages* → *Run workflow*
5. Cuando el job `deploy` termine en verde, la app queda en  
   `https://<usuario>.github.io/Uncover2/`

### Si renombras el repo

Actualiza `VITE_BASE_PATH` en el workflow (y el enlace del README) para que coincida con `https://<usuario>.github.io/<nombre-repo>/`.

### Build manual sin Actions

```bash
VITE_BASE_PATH=/Uncover2/ npm run build
# sube el contenido de dist/ con la opción “Deploy from a branch” (carpeta /docs o gh-pages),
# o usa Actions como arriba (recomendado).
```

---

## Licencia

MIT — ver [`LICENSE`](LICENSE).
