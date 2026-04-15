# 🔧 Compression PDF — Options et implémentation

## 📋 Contexte
Les épreuves sont stockées sur Supabase Storage. Pour optimiser le chargement et réduire les coûts de stockage/bande passante, on peut compresser les PDFs avant upload.

## 🛠️ Options de compression

### 1. **pdf-lib** (Recommandé - JavaScript pur)
```bash
npm install pdf-lib
```

**Avantages** :
- ✅ JavaScript pur, pas de dépendances système
- ✅ Compression sans perte de qualité
- ✅ Manipulation avancée (fusion, rotation, etc.)
- ✅ Léger (bundle ~200KB)

**Exemple d'usage** :
```typescript
import { PDFDocument } from 'pdf-lib';

async function compressPDF(buffer: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(buffer);

  // Compression automatique
  const compressedPdf = await pdfDoc.save({
    useObjectStreams: false,  // Réduit la taille
    addDefaultPage: false,
    objectsPerTick: 50
  });

  return compressedPdf;
}
```

**Taux de compression** : 20-40% selon le PDF

### 2. **Ghostscript** (Via shell)
```bash
# Installation système
sudo apt-get install ghostscript  # Linux
brew install ghostscript          # macOS
```

**Avantages** :
- ✅ Compression très efficace
- ✅ Contrôle fin de la qualité
- ✅ Rapide pour gros fichiers

**Exemple** :
```bash
# Compression haute qualité
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook \
   -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf

# Compression maximale
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen \
   -dNOPAUSE -dQUIET -dBATCH -sOutputFile=output.pdf input.pdf
```

**Taux de compression** : 50-80%

### 3. **qpdf** (Alternative légère)
```bash
npm install node-qpdf
```

**Avantages** :
- ✅ Compression sans perte
- ✅ Très rapide
- ✅ Fiable

**Exemple** :
```typescript
import { compress } from 'node-qpdf';

await compress(inputPath, outputPath, {
  compressStreams: 'y',
  objectStreams: 'disable',
  normalizeContent: 'y'
});
```

### 4. **Online tools** (API)
- **ILovePDF API** : API payante pour compression
- **PDF.co** : API avec compression
- **Cloudinary** : Compression automatique lors de l'upload

## 🎯 Recommandation pour ExamBénin

### Choix : **pdf-lib** + fallback Ghostscript

**Pourquoi ?**
- pdf-lib pour la majorité des cas (JavaScript pur)
- Ghostscript pour les PDFs très volumineux (>10MB)
- Compression automatique lors de l'upload admin

**Implémentation proposée** :
```typescript
// Dans admin-epreuves/app/api/upload/route.ts

async function optimizePDF(buffer: ArrayBuffer): Promise<ArrayBuffer> {
  try {
    // Essai pdf-lib d'abord
    const compressed = await compressWithPdfLib(buffer);
    return compressed;
  } catch (error) {
    // Fallback vers Ghostscript si pdf-lib échoue
    return await compressWithGhostscript(buffer);
  }
}
```

## 📊 Benchmarks (estimation)

| Méthode | Taille originale | Après compression | Ratio | Temps |
|---------|------------------|-------------------|-------|-------|
| pdf-lib | 5MB | 3-4MB | 20-40% | <1s |
| Ghostscript | 5MB | 1-2MB | 60-80% | 2-5s |
| qpdf | 5MB | 3.5MB | 30% | <1s |

## 🚀 Intégration dans l'admin

### Étape 1 — Ajouter la dépendance
```bash
cd admin-epreuves
npm install pdf-lib
```

### Étape 2 — Modifier l'upload
Dans `FormulaireUpload.tsx`, ajouter une option :
```tsx
<label>
  <input type="checkbox" checked={compressPDF} onChange={...} />
  Compresser le PDF avant upload
</label>
```

### Étape 3 — API de compression
Créer `app/api/compress/route.ts` :
```typescript
import { PDFDocument } from 'pdf-lib';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  const buffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buffer);

  const compressed = await pdfDoc.save({
    useObjectStreams: false,
    addDefaultPage: false
  });

  return new NextResponse(compressed, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="compressed.pdf"'
    }
  });
}
```

## ⚠️ Points d'attention

- **Qualité** : Tester que le texte reste lisible
- **Temps** : La compression prend du temps pour les gros fichiers
- **Fallback** : Prévoir un mode sans compression si ça échoue
- **Stockage** : Sauvegarder l'original + version compressée ?

## 🎯 Conclusion

**Faisable et recommandé** pour améliorer les performances. Commencer par pdf-lib pour une implémentation simple, ajouter Ghostscript plus tard si besoin de compression maximale.