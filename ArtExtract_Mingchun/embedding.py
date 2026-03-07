import os, glob
import numpy as np
import torch
import json
from sklearn.metrics.pairwise import cosine_similarity
import warnings
warnings.filterwarnings('ignore', category=RuntimeWarning)

from PIL import Image
from torch_geometric.loader import DataLoader as GeoDataLoader
from torch.utils.data import Dataset
from tqdm import tqdm

from model.embedding_model import GATSiameseNetworkEncoder
from utils.build_graph import image_to_graph_rgb

ALLOWED_EXTS = (".bmp", ".png", ".jpg", ".jpeg", ".tif", ".tiff")

class RGBGraphDataset(Dataset):
    def __init__(self, images_dir, transform_img=None,
                 n_segments=5000, compactness=1, target_feature_dim=None):
        self.images_dir = images_dir
        self.transform_img = transform_img

        patterns = [f"**/*{ext}" for ext in ALLOWED_EXTS]
        files = []
        for p in patterns:
            files.extend(glob.glob(os.path.join(images_dir, p), recursive=True))
        self.images = sorted(files)

        if len(self.images)==0:
            raise ValueError(f"No images found under {images_dir} (extensions={ALLOWED_EXTS})")

        # --- Dataset integrity check ---
        valid_images = []
        for path in self.images:
            try:
                Image.open(path).verify()
                valid_images.append(path)
            except Exception:
                print(f"Skipping corrupted image: {path}")

        self.images = valid_images
        sample = Image.open(self.images[0]).convert('RGB')
        if self.transform_img:
            sample = self.transform_img(sample)
            sample = sample.permute(1, 2, 0).cpu().numpy() if isinstance(sample, torch.Tensor) else np.array(sample)
        else:
            sample = np.array(sample)

        g0 = image_to_graph_rgb(
            sample,
            n_segments=n_segments,
            compactness=compactness,
            target_feature_dim=target_feature_dim
        )[0]

        if torch.isnan(g0.x).any() or torch.isinf(g0.x).any():
            g0.x = torch.nan_to_num(g0.x, nan=0.0, posinf=0.0, neginf=0.0)

        self.target_feature_dim = int(g0.x.shape[1])
        self.n_segments = n_segments
        self.compactness = compactness

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        path = self.images[idx]
        img = Image.open(path).convert('RGB')
        if self.transform_img:
            img = self.transform_img(img)
        img_np = img.permute(1,2,0).cpu().numpy() if isinstance(img, torch.Tensor) else np.array(img)

        out = image_to_graph_rgb(
            img_np,
            n_segments=self.n_segments,
            compactness=self.compactness,
            target_feature_dim=self.target_feature_dim
        )
        data = out[0]

        if torch.isnan(data.x).any() or torch.isinf(data.x).any():
            data.x = torch.nan_to_num(data.x, nan=0.0, posinf=0.0, neginf=0.0)

        # load index and file name
        data.id = torch.tensor([idx], dtype=torch.long)
        data.filename = os.path.basename(path)
        return data
    
def build_encoder(in_channels):
    hidden_channels = 128
    out_channels = 512
    heads = 4

    encoder = GATSiameseNetworkEncoder(
        in_channels=in_channels,
        hidden_channels=hidden_channels,
        out_channels=out_channels,
        heads=heads,
    )

    return encoder

def build_dataset(images_dir, transform_img=None,
                  n_segments=5000, compactness=1, target_feature_dim=None):
    ds = RGBGraphDataset(
        images_dir=images_dir,
        transform_img=transform_img,
        n_segments=n_segments,
        compactness=compactness,
        target_feature_dim=target_feature_dim
    )
    in_channels = ds.target_feature_dim
    return ds, in_channels

def extract_embeddings(encoder, dataset, batch_size=64, device='cuda'):
    loader = GeoDataLoader(dataset, batch_size=batch_size, shuffle=False, num_workers = min(4, os.cpu_count()), pin_memory=True)
    encoder.eval().to(device)
    all_embs = []
    all_filenames = []

    with torch.inference_mode():
        for data in tqdm(loader, desc="Extracting embeddings", total=len(loader)):
            data = data.to(device)
            z = encoder(data)
            all_embs.append(z.cpu())

            if hasattr(data, 'filename'):
                all_filenames.extend(data.filename)
            else:
                all_filenames.extend([str(i) for i in range(z.size(0))])

    X = torch.cat(all_embs, dim=0).numpy().astype('float32')
    ids = np.array(all_filenames)

    np.save('./embedding/embeddings.npy', X)

    metadata = {
        "num_embeddings": X.shape[0],
        "embedding_dim": X.shape[1]
    }

    with open("./embedding/meta.json","w") as f:
        json.dump(metadata,f)

def find_similar_embeddings(query_embedding, embeddings, top_k=5):
    """
    Find the most similar embeddings using cosine similarity.

    Args:
        query_embedding (np.ndarray): Embedding vector for the query.
        embeddings (np.ndarray): Matrix of stored embeddings.
        top_k (int): Number of similar embeddings to retrieve.

    Returns:
        indices (np.ndarray): Indices of the most similar embeddings.
        scores (np.ndarray): Similarity scores.
    """

    sims = cosine_similarity(query_embedding.reshape(1, -1), embeddings)[0]
    indices = sims.argsort()[::-1][:top_k]

    return indices, sims[indices]

def search_similar_images(query_image_path, embeddings, ids, encoder, device="cuda", top_k=5):
    """
    Compute embedding for a query image and retrieve similar images.
    """

    img = Image.open(query_image_path).convert("RGB")
    img_np = np.array(img)

    graph_data, segments = image_to_graph_rgb(img_np)
    graph_data = graph_data.to(device)

    encoder.eval().to(device)

    with torch.no_grad():
        query_emb = encoder(graph_data).cpu().numpy()

    indices, scores = find_similar_embeddings(query_emb, embeddings, top_k)

    return ids[indices], scores


def main():
    os.makedirs("./embedding", exist_ok=True)
    images_dir = "./dataset/train"

    transform_img = None

    dataset, in_channels = build_dataset(
        images_dir=images_dir,
        transform_img=transform_img,
        n_segments=5000,
        compactness=1,
        target_feature_dim=None
    )
    print(f"in_channels (node feature dim) = {in_channels}")

    encoder = build_encoder(in_channels)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    X, ids = extract_embeddings(
        encoder=encoder,
        dataset=dataset,
        batch_size=8,
        device=device
    )
    print(f"Saved ./embedding/embeddings.npy  shape={X.shape}")
    print(f"Saved ./embedding/ids.csv       N={len(ids)}")

if __name__ == "__main__":
    main()