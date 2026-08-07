# LocalGovy Dispensary Templates

Expo dispensary templates derived from the LocalGovy core feature set. Each app keeps the same mandatory flows with a distinct visual thesis for App Store differentiation.

## Live web demos (GitHub Pages)

**Hub:** https://localgovy.github.io/dispotemplates/

| Template | Demo |
|----------|------|
| Amber Reserve | https://localgovy.github.io/dispotemplates/amber-reserve/ |
| Obsidian Lab | https://localgovy.github.io/dispotemplates/obsidian-glow/ |
| Rose Noir | https://localgovy.github.io/dispotemplates/rose-noir/ |
| Ghost Atelier | https://localgovy.github.io/dispotemplates/ethereal-ghost/ |
| Emerald Crypt | https://localgovy.github.io/dispotemplates/emerald-crypt/ |
| Nebula Clinic | https://localgovy.github.io/dispotemplates/nebula-clinic/ |
| Luminous Botanical | https://localgovy.github.io/dispotemplates/luminous-botanical/ |
| Citrus Grove | https://localgovy.github.io/dispotemplates/citrus-grove/ |
| Azure Bloom | https://localgovy.github.io/dispotemplates/azure-bloom/ |

Rebuild web exports: `bash scripts/export-web.sh` then commit `docs/`.

## Dark / nocturnal set

| Folder | Brand | Thesis | Signature UI |
|--------|-------|--------|--------------|
| `amber-reserve/` | Amber Reserve | Mahogany lounge / amber glow | Rapid Re-order + Nearest Sanctuary |
| `obsidian-glow/` | Obsidian Lab | High-tech cyan / sharp corners | Terpene profile analysis cards |
| `rose-noir/` | Rose Noir | Nocturnal crimson / rose-gold | Curated Tastes + Dosage Journal |
| `ethereal-ghost/` | Ghost Atelier | Vapor-luxury monochrome | Gallery shop + Sommelier AI |
| `emerald-crypt/` | Emerald Crypt | Genetic archive / neon green | ACQUIRE BATCH + vault framing |

## Bright / colorful set

| Folder | Brand | Thesis | Signature UI |
|--------|-------|--------|--------------|
| `nebula-clinic/` | Nebula Clinic | Clinical wellness / lavender-white | Formulation cards + Nebula Core AI + Wellness Journal |
| `luminous-botanical/` | Luminous Botanical | Cream sage mint glass | Effect bars + Dosage Journal + Midnight AI Sommelier |
| `citrus-grove/` | Citrus Grove | Sunny coral / citrus / lime | Mood Spectrum chips + Grove Picks |
| `azure-bloom/` | Azure Bloom | Sky periwinkle / coral | Daily Ritual checklist + pastel 2×2 categories |

## Shared mandatory features

Age gate (19+) · Google/Supabase auth · Home / Shop / Cart / Orders / Account · store picker · product detail · favourites · AI budtender · loyalty · promos · pickup checkout

## Run a template

```bash
cd nebula-clinic   # or any other folder
npm install
npx expo start
```

Set `EXPO_PUBLIC_*` env vars (Supabase, Google OAuth, Groq) per app before production builds. Copy `supabase/schema.sql` into a fresh project per client.

## Branding

Each folder includes `brand.json` with name, promos, loyalty naming, and storage keys. Bundle IDs use `com.localgovy.*` placeholders — replace before App Store submit.
