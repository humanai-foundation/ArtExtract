<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1a1a2e,30:16213e,60:e94560,90:f5a623,100:ffd700&height=240&section=header&text=ArtExtract&fontSize=90&fontColor=fff&animation=twinkling&fontAlignY=40&desc=Painting%20In%20A%20Painting%20—%20Hidden%20Images%20with%20AI&descAlignY=60&descSize=18" width="100%"/>

<br/>

[![GSoC 2026](https://img.shields.io/badge/GSoC-2026%20HumanAI-F6AE2D?style=for-the-badge&logo=google&logoColor=white)](https://summerofcode.withgoogle.com/)
[![HumanAI](https://img.shields.io/badge/Org-HumanAI-E94560?style=for-the-badge)](https://human-ai.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.x-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![WikiArt](https://img.shields.io/badge/Data-WikiArt%203K-F59E0B?style=for-the-badge)]()
[![NGA](https://img.shields.io/badge/Data-NGA%20Open%20API-10B981?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge)](LICENSE)

<br/>

> **🎨 When a master hides another painting beneath their canvas — can AI find it?**
>
> ArtExtract trains a **multi-task CNN-RNN** to classify art by style, artist, and genre on WikiArt, then builds a **Siamese Network** that retrieves visually similar paintings from the National Gallery of Art — together enabling the detection of hidden underpaintings by identifying anomalous style signatures that don't belong.

<br/>

[🚀 Quick Start](#-quick-start) · [🏗 Architecture](#-architecture) · [📊 Results](#-results) · [🔍 The Mystery](#-the-mystery--painting-in-a-painting) · [🎯 GSoC Vision](#-gsoc-2026-vision)

</div>

---

## 🖼️ The Mystery — Painting In A Painting

Art historians have long known that masters like **Rembrandt, Vermeer, and El Greco** sometimes painted over earlier works — their own or others'. X-ray scans reveal hidden faces, different compositions, even stolen paintings lurking beneath centuries of varnish.

**ArtExtract teaches AI to detect these anomalies computationally:**

```
Step 1 ─ Train CNN-RNN to recognise each artist's unique visual signature
                (brushstroke, composition, palette, spatial grammar)
                
Step 2 ─ Build Siamese similarity embeddings for the full NGA collection

Step 3 ─ Scan a painting: does any region's style NOT match the declared artist?
                    ↓
           Outlier detected → possible underpainting / hidden work 🎭
```

---

## 👨‍🎨 Mentors

| Mentor | Affiliation | Expertise |
|---|---|---|
| **Emanuele Usai** | University of Alabama | Computer Vision, Art Analysis |
| **Sergei Gleyzer** | University of Alabama | ML4Sci, Physics-Informed ML |

---

## ✨ Two Tasks, One Vision

| | Task 1 | Task 2 |
|---|---|---|
| **Goal** | Classify WikiArt paintings by Style + Artist + Genre | Retrieve similar paintings from NGA collection |
| **Model** | CNN-RNN Multi-task Classifier | Siamese Network + Triplet Loss |
| **Backbone** | ResNet-50 (ImageNet pretrained) | EfficientNet-B2 |
| **Key Extra** | Outlier detection via embedding distance | Hard negative triplet mining |
| **Dataset** | WikiArt 3,000 paintings (HuggingFace) | NGA Open Dataset + IIIF API |
| **Metrics** | Style/Genre Accuracy | Precision@K · mAP |

---

## 🏗 Architecture

### Task 1 — CNN-RNN Multi-Task Art Classifier

```
Input: Painting (B, 3, 224, 224)
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│  ResNet-50 Backbone (ImageNet pretrained)                    │
│  Remove avgpool + fc layers — keep spatial feature map       │
│  Output: (B, 2048, 7, 7)  ← rich spatial features           │
└─────────────────────┬────────────────────────────────────────┘
                      │  Treat 7×7 grid = 49 spatial tokens
                      ▼
┌──────────────────────────────────────────────────────────────┐
│  Reshape: (B, 49, 2048)                                      │
│  BiLSTM (hidden=512, layers=2)                               │
│  ← captures GLOBAL composition: where objects are relative  │
│  Output: (B, 49, 1024)                                       │
└─────────────────────┬────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────┐
│  Attention Pooling                                           │
│  Score each of the 49 positions → weighted sum              │
│  Output: (B, 1024)  ← painting embedding                    │
└───────┬──────────────┬──────────────┬───────────────────────┘
        │              │              │
        ▼              ▼              ▼
  Style Head      Artist Head    Genre Head
  Linear→softmax  Linear→softmax Linear→softmax
```

**Why CNN + RNN for paintings?**
```
CNN alone  → sees local texture, brushstroke, colour
RNN alone  → no visual features
CNN + RNN  → CNN captures "what is here" at each of 49 grid cells
             RNN captures "how things relate across the composition"
             = how art historians actually read a painting
```

**Multi-Task Loss (weighted):**
```python
loss = 1.0 × CrossEntropy(style_pred, style_true)    # primary task
     + 0.8 × CrossEntropy(artist_pred, artist_true)  # secondary
     + 0.6 × CrossEntropy(genre_pred, genre_true)    # tertiary

Label smoothing = 0.1  (prevents overconfidence on ambiguous art styles)
```

**Training Strategy:**
```
Phase 1 — Freeze CNN backbone (10 epochs):
  → Only train BiLSTM + attention + classification heads
  → LR = 1e-3  (fast convergence on unfrozen layers)

Phase 2 — Unfreeze full model (15 epochs):
  → Fine-tune ResNet-50 layers too
  → LR reduced for backbone (avoid forgetting ImageNet features)
  → Cosine annealing LR schedule
```

---

### Task 1 — Outlier Detection (The Core Discovery Engine)

```
After training, every painting has an embedding vector (B, 1024)

Step 1: Compute class centroid for each style
        centroid_s = mean(embeddings of all style-s paintings)

Step 2: For each painting, measure distance from its own centroid
        d(painting_i) = ||embedding_i - centroid_{style_i}||₂

Step 3: Threshold at 95th percentile of all distances
        distance > threshold → OUTLIER  🚨

Interpretation:
  Normal painting    → embedding sits close to its style cluster
  Outlier painting   → embedding is far from its declared style
                     → its visual language "doesn't belong"
                     → possible underpainting / misattribution
```

---

### Task 2 — Siamese Network + Triplet Loss

```
Training with Triplet Mining:

  Anchor   ── same artist ──► Positive  (pulled together)
  Anchor   ── diff artist ──► Negative  (pushed apart)

  Triplet Loss:
  L = max(0, d(anchor, positive) - d(anchor, negative) + margin)

  Hard Negative Mining:
  Pick the negative CLOSEST to the anchor
  → forces the model to learn fine-grained artist distinctions
```

**Siamese Backbone:**
```
Input: Painting (B, 3, 224, 224)
         │
         ▼
  EfficientNet-B2 (pretrained) → Global Average Pool → FC(256) → L2-norm
         │
         ▼
  256-dimensional embedding unit sphere
  (cosine similarity = angular distance between painting styles)
```

**Retrieval at inference:**
```
Query painting → Siamese embed → cosine similarity to all NGA paintings
               → Top-K nearest neighbours = similar paintings  🎨
```

---

## 📊 Results

### Task 1 — WikiArt Classification

```
══════════════════════════════════════════════════════
  TASK 1 TEST RESULTS — CNN-RNN Art Classifier
══════════════════════════════════════════════════════
  Style  Accuracy :  [run notebook →]  %
  Genre  Accuracy :  [run notebook →]  %
──────────────────────────────────────────────────────
  Outliers found  :  [run notebook →]  paintings
                     (top 5% by embedding distance)
══════════════════════════════════════════════════════
```

### Task 2 — NGA Painting Similarity

```
══════════════════════════════════════════════════════
  TASK 2 TEST RESULTS — Siamese Retrieval
══════════════════════════════════════════════════════
  Precision@1  :  [run notebook →]
  Precision@3  :  [run notebook →]
  Precision@5  :  [run notebook →]
  Precision@10 :  [run notebook →]
  mAP          :  [run notebook →]
══════════════════════════════════════════════════════
```

### Visual Retrieval — What It Looks Like

```
┌──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   QUERY 🔴   │  Result 1    │  Result 2    │  Result 3    │  Result 4    │  Result 5    │
│  Rembrandt   │  ✓ Sim:0.94  │  ✓ Sim:0.91  │  ✗ Sim:0.78  │  ✓ Sim:0.76  │  ✓ Sim:0.74  │
│  (portrait)  │  Rembrandt   │  Rembrandt   │  Hals        │  Rembrandt   │  Rembrandt   │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
  ✓ = same artist  ✗ = different artist   Similarity = 1 - cosine_distance
```

*See `outputs/08_similarity_retrieval.png` generated on run.*

---

## 🚀 Quick Start

### ▶️ Run on Google Colab (Recommended)

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/abhiram123467/artextract-deeplense/blob/main/ArtExtract_PaintingInAPainting.ipynb)

1. Click **Open in Colab**
2. `Runtime` → `Change runtime type` → **T4 GPU** → Save
3. `Runtime` → `Run all`
4. ☕ ~25–35 min — all visualisations auto-saved to `outputs/`

### 💻 Run Locally

```bash
# Clone
git clone https://github.com/abhiram123467/artextract-deeplense
cd artextract-deeplense

# Install
pip install torch torchvision timm matplotlib scikit-learn seaborn \
            tqdm Pillow requests pandas datasets

# Launch notebook
jupyter notebook ArtExtract_PaintingInAPainting.ipynb
```

---

## 📁 Project Structure

```
artextract-deeplense/
│
├── 📓 ArtExtract_PaintingInAPainting.ipynb   # Complete pipeline
│
├── outputs/
│   ├── 01_wikiart_samples.png          # Sample paintings from WikiArt
│   ├── 02_class_distribution.png       # Style/Artist/Genre class counts
│   ├── 03_training_curves.png          # Loss + accuracy over epochs
│   ├── 04_confusion_matrix.png         # Style + Genre confusion matrices
│   ├── 05_tsne_embeddings.png          # t-SNE of painting embeddings
│   ├── 06_outlier_paintings.png        # Top outlier paintings detected
│   ├── 07_nga_samples.png              # NGA dataset sample paintings
│   ├── 08_similarity_retrieval.png     # Query → Top-5 similar paintings
│   ├── 09_summary_dashboard.png        # Full results dashboard
│   ├── best_cnn_rnn.pth                # Task 1 trained weights
│   └── best_siamese.pth                # Task 2 trained weights
│
├── README.md
└── requirements.txt
```

---

## 🔧 Technical Stack

```
🤖 Deep Learning   : PyTorch 2.x, torchvision
🏗  Task 1 Backbone : ResNet-50 (ImageNet pretrained) + BiLSTM + Attention
🏗  Task 2 Backbone : EfficientNet-B2 (timm) + Triplet Loss
📊 Metrics         : Accuracy, mAP, Precision@K, NearestNeighbors (sklearn)
📉 Loss T1         : CrossEntropyLoss (label_smoothing=0.1) · multi-task weighted
📉 Loss T2         : Triplet Margin Loss (hard negative mining)
🎨 Dataset 1       : WikiArt via HuggingFace `huggan/wikiart` (3,000 samples)
🖼️  Dataset 2       : National Gallery of Art Open Dataset + IIIF Image API
⚙️  Optimizer       : AdamW (weight_decay=1e-4) + CosineAnnealingLR
📐 Image Size      : 224×224 px (ImageNet standard)
🌈 Augmentation    : RandomFlip · RandomRotation · ColorJitter
☁️  Compute         : Google Colab T4 GPU
```

---

## 🎯 GSoC 2026 Vision

> **Target Organisation: HumanAI**
> **Project: ArtExtract — Painting In A Painting**
> **Mentors: Emanuele Usai (Alabama) · Sergei Gleyzer (Alabama)**

Proposed 12-week GSoC sprint:

| Phase | Weeks | Deliverable |
|---|---|---|
| **Foundation** | 1–2 | Reproduce + extend with EfficientNet-B3 backbone |
| **Patch-level Analysis** | 3–5 | Detect *regions* of anomaly (not just whole paintings) |
| **Deeper Similarity** | 6–7 | CLIP embeddings for zero-shot style retrieval |
| **Real Underpaintings** | 8–9 | Validate on known X-ray scan datasets (Ghent Altarpiece) |
| **Web App** | 10–11 | Interactive Streamlit app — upload a painting, find its hidden layers |
| **GSoC Final** | 12 | Paper draft + public dataset of detected painting-in-painting candidates |

**Why this matters for art history:**
- 🎭 **Louvre alone has 38,000 paintings** — manual X-ray analysis is impossible at scale
- 🔬 **AI can flag candidates** for physical X-ray investigation, saving time and cost
- 🏛 **NGA Open Dataset + WikiArt = 200,000+ paintings** available for automated analysis
- 🌍 Hidden underpaintings have rewritten attribution of works by Caravaggio, Raphael, Van Eyck

---

## 📚 References

- [ResNet — He et al. 2015](https://arxiv.org/abs/1512.03385) — Deep Residual Learning
- [EfficientNet — Tan & Le 2019](https://arxiv.org/abs/1905.11946) — backbone for Task 2
- [BiLSTM — Schuster & Paliwal 1997](https://ieeexplore.ieee.org/document/650093) — bidirectional sequence
- [Triplet Loss — Schroff et al. 2015](https://arxiv.org/abs/1503.03832) — FaceNet / Siamese
- [WikiArt HuggingFace](https://huggingface.co/datasets/huggan/wikiart) — training data
- [NGA Open Data](https://github.com/NationalGalleryOfArt/opendata) — National Gallery of Art
- [Painting-in-Painting research](https://www.courtauld.ac.uk/) — Courtauld Institute art science

---

<div align="center">

## 👨‍🎨 About the Author

**Abhi Ramg** — AI/ML Researcher & GSoC 2026 Applicant

📍 Hyderabad, India &nbsp;|&nbsp; 🎨 Art AI &nbsp;|&nbsp; 🔭 Astrophysics ML &nbsp;|&nbsp; 🧠 Physics-Informed DL

[![GitHub](https://img.shields.io/badge/GitHub-abhiram123467-181717?style=for-the-badge&logo=github)](https://github.com/abhiram123467)
[![ArtExtract](https://img.shields.io/badge/Repo-ArtExtract-F59E0B?style=for-the-badge&logo=github)](https://github.com/abhiram123467/artextract-deeplense)
[![DeepLense8](https://img.shields.io/badge/Also%20See-DeepLense8%20DDPM-8B5CF6?style=for-the-badge&logo=github)](https://github.com/abhiram123467/DeepLense8)
[![SIRA](https://img.shields.io/badge/Also%20See-SIRA%20Neural%20ODE-E94560?style=for-the-badge&logo=github)](https://github.com/abhiram123467/sira-deeplense)

<br/>

*"Every painting hides a secret. Every master leaves a ghost. We teach machines to listen for them."*

<br/>

**⭐ Star this repo if AI-powered art forensics excites you!**

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:ffd700,40:f5a623,70:e94560,100:1a1a2e&height=130&section=footer" width="100%"/>

</div>
