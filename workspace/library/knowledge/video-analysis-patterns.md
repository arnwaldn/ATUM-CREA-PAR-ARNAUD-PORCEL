# Video Analysis Patterns - ULTRA-CREATE v28.4

## Overview
Ce fichier documente les patterns d'analyse video pour le systeme ULTRA-CREATE.
Utilise par l'agent `video-analyzer` et la commande `/analyze-video`.

## Architecture Pipeline

```
VIDEO FILE
    |
    v
+-------------------+
| 1. VALIDATION     |
| - Format check    |
| - File exists     |
+-------------------+
    |
    +------------------+------------------+
    |                  |                  |
    v                  v                  v
+----------+    +------------+    +-----------+
| METADATA |    | AUDIO      |    | FRAMES    |
| FFprobe  |    | FFmpeg     |    | FFmpeg    |
+----------+    +------------+    +-----------+
    |                  |                  |
    |                  v                  |
    |          +------------+             |
    |          | WHISPER    |             |
    |          | Transcribe |             |
    |          +------------+             |
    |                  |                  |
    +------------------+------------------+
                       |
                       v
              +----------------+
              | CLAUDE VISION  |
              | Analyze frames |
              +----------------+
                       |
                       v
              +----------------+
              | SYNTHESIS      |
              | Generate report|
              +----------------+
                       |
                       v
              +----------------+
              | HINDSIGHT      |
              | Save to memory |
              +----------------+
```

## FFmpeg Commands

### Extract Metadata
```bash
ffprobe -v quiet -print_format json -show_format -show_streams video.mp4
```

### Extract Audio (for Whisper)
```bash
# Format optimal pour Whisper: WAV, 16kHz, mono
ffmpeg -i video.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav -y
```

### Extract Frames
```bash
# 1 frame par seconde
ffmpeg -i video.mp4 -vf "fps=1" frames/frame_%04d.jpg -y

# 1 frame toutes les 2 secondes (recommande)
ffmpeg -i video.mp4 -vf "fps=0.5" frames/frame_%04d.jpg -y

# Avec limite de frames
ffmpeg -i video.mp4 -vf "fps=0.5" -frames:v 30 frames/frame_%04d.jpg -y

# Avec redimensionnement (recommande pour API)
ffmpeg -i video.mp4 -vf "fps=0.5,scale=1024:-1" -q:v 2 -frames:v 30 frames/frame_%04d.jpg -y
```

### Extract Specific Frame
```bash
# Frame a 30 secondes
ffmpeg -i video.mp4 -ss 00:00:30 -frames:v 1 frame_30s.jpg -y
```

## Whisper Integration

### Models Disponibles
| Model | Params | VRAM | Speed | Qualite |
|-------|--------|------|-------|---------|
| tiny | 39M | ~1GB | ~32x | Basic |
| base | 74M | ~1GB | ~16x | Good |
| small | 244M | ~2GB | ~6x | Better |
| medium | 769M | ~5GB | ~2x | High |
| large | 1550M | ~10GB | 1x | Best |

### Usage Python
```python
import whisper

# Charger le modele
model = whisper.load_model("base")

# Transcrire
result = model.transcribe("audio.wav")

# Resultat
print(result["text"])           # Texte complet
print(result["language"])       # Langue detectee
print(result["segments"])       # Segments avec timestamps
```

### Options Avancees
```python
result = model.transcribe(
    "audio.wav",
    language="fr",              # Forcer la langue
    task="translate",           # Traduire en anglais
    fp16=False,                 # Desactiver FP16 (CPU)
    verbose=True                # Afficher progression
)
```

## Claude Vision API Integration

### Limites
- **Max images par requete**: 100 (API), 20 (claude.ai)
- **Taille max par image**: 5MB (API), 10MB (claude.ai)
- **Resolution max**: 8000x8000 px
- **Resolution optimale**: 1092x1092 px (1:1)

### Format Base64
```python
import base64

def image_to_base64(image_path):
    with open(image_path, "rb") as f:
        return base64.standard_b64encode(f.read()).decode("utf-8")

# Structure pour API
{
    "type": "image",
    "source": {
        "type": "base64",
        "media_type": "image/jpeg",
        "data": image_to_base64("frame.jpg")
    }
}
```

### Prompt Optimal pour Video Frames
```
Tu analyses des frames extraites d'une video (1 frame toutes les 2 secondes).

Pour chaque frame significative, identifie:
1. Les elements visuels (personnes, objets, texte a l'ecran)
2. Le contexte/environnement
3. Les actions en cours

Ensuite, synthetise:
- Une description chronologique de la video
- Les themes/sujets principaux
- Les moments cles

Frames:
[Image 1] [Image 2] [Image 3] ...
```

### Best Practices
- Placer les images AVANT le texte du prompt
- Numeroter les images: "Image 1:", "Image 2:", etc.
- Limiter a 30-50 frames pour equilibrer cout/qualite
- Utiliser JPEG pour compression optimale

## Cout Estimation

### Tokens par Image (Claude Vision)
```
tokens = (width * height) / 750
```

| Resolution | Tokens | Cout/image (Sonnet) |
|------------|--------|---------------------|
| 200x200 | ~54 | $0.00016 |
| 1000x1000 | ~1334 | $0.004 |
| 1092x1092 | ~1590 | $0.0048 |

### Cout par Video (30 frames, 1000x1000)
- Tokens: ~40,000
- Cout: ~$0.12

## Hindsight Integration

### Sauvegarder Analyse
```javascript
hindsight_retain({
  bank: 'documents',
  content: `## Video Analysis: ${filename}

### Metadata
- Duration: ${duration}
- Resolution: ${resolution}
- Size: ${size_mb} MB

### Transcription (${language})
${transcript}

### Visual Analysis
${scenes_description}

### Key Topics
${topics.join(', ')}

### Summary
${summary}

---
Analyzed: ${new Date().toISOString()}
`
})
```

### Rechercher Analyses Passees
```javascript
hindsight_recall({
  bank: 'documents',
  query: 'video analysis conference',
  top_k: 5
})
```

## Error Handling

### Fichier Introuvable
```python
if not Path(video_path).exists():
    raise FileNotFoundError(f"Video introuvable: {video_path}")
```

### Format Non Supporte
```python
SUPPORTED = {'.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv', '.wmv'}
if Path(video_path).suffix.lower() not in SUPPORTED:
    raise ValueError(f"Format non supporte: {suffix}")
```

### FFmpeg Timeout
```python
try:
    subprocess.run(cmd, capture_output=True, timeout=300)  # 5 min max
except subprocess.TimeoutExpired:
    print("FFmpeg timeout - video trop longue?")
```

### Whisper Out of Memory
```python
# Utiliser un modele plus petit
model = whisper.load_model("tiny")  # Au lieu de "large"

# Ou desactiver FP16 sur CPU
result = model.transcribe(audio_path, fp16=False)
```

## Script Principal

**Emplacement**: `C:\Claude-Code-Creation\scripts\video_analyzer.py`

```python
from video_analyzer import VideoAnalyzer

# Analyse complete
analyzer = VideoAnalyzer("video.mp4")
result = analyzer.analyze(
    fps=0.5,
    max_frames=30,
    whisper_model="base"
)

# Generer rapport
report = analyzer.generate_report(result)
print(report)
```

## Integration ULTRA-CREATE

### Auto-Detection
L'agent `video-analyzer` s'active automatiquement quand:
- L'utilisateur partage un chemin vers un fichier video
- L'utilisateur demande d'analyser/transcrire une video
- La commande `/analyze-video` est utilisee

### Triggers Keywords
- "analyse cette video"
- "transcris cette video"
- "que dit cette video"
- "resume cette video"
- "video analysis"
- Extensions detectees: .mp4, .webm, .mkv, .avi, .mov

### Registry Entry
```json
{
  "video-analyzer": {
    "category": "research",
    "triggers": ["video", "analyse video", "transcription video"],
    "mcps": ["e2b", "filesystem", "hindsight"],
    "auto_activate": true
  }
}
```
