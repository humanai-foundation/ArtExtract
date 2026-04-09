import os
import math
import faiss
import numpy as np

from typing import Optional
from dataclasses import dataclass
from typing import Tuple, Optional, Literal, List

Metric = Literal["ip", "l2"]  # ip=inner-product, l2=euclidean distance

@dataclass
class IndexBundle:
    index: faiss.Index
    metric: Metric          # "ip" or "l2"
    kind: str               # "flat" | "ivfpq" | "hnsw"
    dim: int
    meta: dict


# ============ Basic Tool ============
def load_embeddings(emb_path: str, ids_path: Optional[str] = None) -> Tuple[np.ndarray, Optional[np.ndarray]]:
    """Load embeddings.npy / ids.csv"""
    X = np.load(emb_path).astype("float32")
    ids = None
    if ids_path and os.path.exists(ids_path):
        ids = np.loadtxt(ids_path, dtype=str, delimiter=",")
    return X, ids


def save_index(bundle: IndexBundle, path: str):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    faiss.write_index(bundle.index, path)


def load_index(path: str, metric: Metric, kind: str, dim: int, meta: Optional[dict] = None) -> IndexBundle:
    index = faiss.read_index(path)
    return IndexBundle(index=index, metric=metric, kind=kind, dim=dim, meta=meta or {})


# ============ Change 1: normalize() + unnormalized warning ============
def normalize(X: np.ndarray) -> np.ndarray:
    """
    L2-normalize row vectors to unit length.

    Required before adding vectors to an ip (inner-product) index if you want
    cosine similarity semantics. Without this, metric='ip' computes raw dot
    product — NOT cosine — and silently returns wrong similarity rankings.

    Args:
        X: shape (N, D) or (D,) — promoted to 2D internally.

    Returns:
        L2-normalized float32 array, same shape as input.

    Example:
        X = normalize(X)
        bundle = build_index_flat(X, metric="ip")  # now correctly cosine
    """
    X = np.atleast_2d(X).astype("float32")
    norms = np.linalg.norm(X, axis=1, keepdims=True)
    return X / (norms + 1e-8)


def _warn_if_unnormalized(X: np.ndarray, metric: Metric, context: str) -> None:
    """Warn if metric='ip' but vectors are not unit-length. Samples up to 64 rows."""
    if metric != "ip":
        return
    sample = X[:min(64, len(X))]
    norms = np.linalg.norm(sample, axis=1)
    if not np.allclose(norms, 1.0, atol=1e-3):
        print(
            f"[searching_tool WARNING] {context}: metric='ip' but vectors are not "
            f"L2-normalized (mean norm={norms.mean():.4f}). "
            f"Call normalize(X) first for correct cosine similarity."
        )


# ============ Building Index ============
def build_index_flat(X: np.ndarray, metric: Metric = "ip") -> IndexBundle:
    """
    Small scale (<=100K): Flat index.
    IndexFlatL2: Euclidean distance.
    IndexFlatIP: Inner Product (for cosine similarity, vectors should be normalized first).
    """
    _warn_if_unnormalized(X, metric, "build_index_flat")
    N, D = X.shape
    if metric == "ip":
        index = faiss.IndexFlatIP(D)
    else:
        index = faiss.IndexFlatL2(D)
    index.add(X)
    return IndexBundle(index=index, metric=metric, kind="flat", dim=D, meta={"ntotal": index.ntotal})


def build_index_ivfpq(X: np.ndarray, metric: Metric = "ip", nlist: Optional[int] = None, m: int = 16, nbits: int = 8,
    train_samples: int = 200_000, nprobe: int = 16) -> IndexBundle:
    """
    Moderate scale (100K~10M): IVFPQ
    nlist: number of Voronoi cells (clusters); default: 4*sqrt(N), at least 64
    m: number of sub-vectors (must divide D)
    nprobe: cells visited at search time — can be overridden per-query in search()
    """
    _warn_if_unnormalized(X, metric, "build_index_ivfpq")
    N, D = X.shape
    if nlist is None:
        nlist = max(64, int(4 * math.sqrt(N)))
    if D % m != 0:
        raise ValueError(f"D({D}) must be divisible by m({m})")

    quantizer = faiss.IndexFlatIP(D) if metric == "ip" else faiss.IndexFlatL2(D)
    faiss_metric = faiss.METRIC_INNER_PRODUCT if metric == "ip" else faiss.METRIC_L2

    index = faiss.IndexIVFPQ(quantizer, D, nlist, m, nbits, faiss_metric)

    n_tr = min(N, train_samples)
    index.train(X[:n_tr])
    index.add(X)
    index.nprobe = nprobe

    meta = {"nlist": nlist, "m": m, "nbits": nbits, "nprobe": nprobe, "ntotal": index.ntotal}
    return IndexBundle(index=index, metric=metric, kind="ivfpq", dim=D, meta=meta)


def build_index_hnsw(X: np.ndarray, metric: Metric = "ip", M: int = 32, efC: int = 200, efS: int = 64) -> IndexBundle:
    """
    Large scale (>10M): HNSW
    M: number of neighbors per node (higher=M denser graph=better accuracy/slower)
    efC: construction parameter (higher=better accuracy/slower indexing)
    efS: search parameter (higher=better accuracy/slower searching) — can be overridden per-query in search()
    """
    _warn_if_unnormalized(X, metric, "build_index_hnsw")
    N, D = X.shape
    faiss_metric = faiss.METRIC_INNER_PRODUCT if metric == "ip" else faiss.METRIC_L2
    index = faiss.IndexHNSWFlat(D, M, faiss_metric)
    index.hnsw.efConstruction = efC
    index.add(X)
    index.hnsw.efSearch = efS
    meta = {"M": M, "efConstruction": efC, "efSearch": efS, "ntotal": index.ntotal}
    return IndexBundle(index=index, metric=metric, kind="hnsw", dim=D, meta=meta)


# ============ Searching ============
def search(
    bundle: IndexBundle,
    Q: np.ndarray,
    topk: int = 5,
    exclude_self: bool = True,
    exclude_indices: Optional[np.ndarray] = None,
    nprobe: Optional[int] = None,
    efsearch: Optional[int] = None,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Search the index with query vectors Q and return topk results.

    Args:
        bundle:          IndexBundle to search against.
        Q:               Query vectors, shape (D,) or (n_q, D).
                         1D vectors are safely promoted to (1, D) internally.
        topk:            Number of nearest neighbors to return per query.
        exclude_self:    Exclude the query's own row index from results.
        exclude_indices: Per-query indices to exclude, shape (n_q,) or scalar.
        nprobe:          IVFPQ only — overrides nprobe for this call only.
                         Higher = better recall, slower. Restored after search.
        efsearch:        HNSW only — overrides efSearch for this call only.
                         Higher = better recall, slower. Restored after search.
    """
    # Change 4: 1D shape guard — promote to (1, D) so all downstream logic is safe
    was_1d = Q.ndim == 1
    if was_1d:
        Q = Q[None, :]
    if Q.dtype != np.float32:
        Q = Q.astype("float32")
    n_q = Q.shape[0]

    # Changes 2 & 3: runtime nprobe / efSearch overrides
    # Save originals and restore after search so the bundle config is unchanged.
    _orig_nprobe = None
    _orig_efsearch = None

    if nprobe is not None:
        if bundle.kind != "ivfpq":
            raise ValueError(f"nprobe override is only valid for ivfpq bundles, got '{bundle.kind}'")
        _orig_nprobe = bundle.index.nprobe
        bundle.index.nprobe = nprobe

    if efsearch is not None:
        if bundle.kind != "hnsw":
            raise ValueError(f"efsearch override is only valid for hnsw bundles, got '{bundle.kind}'")
        _orig_efsearch = bundle.index.hnsw.efSearch
        bundle.index.hnsw.efSearch = efsearch

    try:
        need = topk + 1 if (exclude_self or exclude_indices is not None) else topk
        D_raw, I_raw = bundle.index.search(Q, need)
    finally:
        # always restore — even if search() raises
        if _orig_nprobe is not None:
            bundle.index.nprobe = _orig_nprobe
        if _orig_efsearch is not None:
            bundle.index.hnsw.efSearch = _orig_efsearch

    if exclude_indices is not None:
        exclude_indices = np.atleast_1d(exclude_indices)
        if exclude_indices.size == 1 and n_q > 1:
            exclude_indices = np.full((n_q,), int(exclude_indices[0]))

        D_out = np.empty((n_q, topk), dtype=D_raw.dtype)
        I_out = np.empty((n_q, topk), dtype=I_raw.dtype)
        for r in range(n_q):
            ex = int(exclude_indices[r])
            mask = I_raw[r] != ex
            D_out[r] = D_raw[r][mask][:topk]
            I_out[r] = I_raw[r][mask][:topk]
        return (D_out[0], I_out[0]) if was_1d else (D_out, I_out)

    if exclude_self:
        D_out = np.empty((n_q, topk), dtype=D_raw.dtype)
        I_out = np.empty((n_q, topk), dtype=I_raw.dtype)
        for r in range(n_q):
            mask = I_raw[r] != r
            D_out[r] = D_raw[r][mask][:topk]
            I_out[r] = I_raw[r][mask][:topk]
        return (D_out[0], I_out[0]) if was_1d else (D_out, I_out)

    D_out, I_out = D_raw[:, :topk], I_raw[:, :topk]
    return (D_out[0], I_out[0]) if was_1d else (D_out, I_out)


# ============ Re-ranking ============
def rerank(Q: np.ndarray, X_cands: np.ndarray) -> np.ndarray:
    """Re-rank candidates by cosine similarity"""
    if Q.ndim == 1:
        Q = Q[None, :]
    if X_cands.ndim == 2:
        X_cands = X_cands[None, :, :]

    # normalize
    Qn = Q / (np.linalg.norm(Q, axis=1, keepdims=True) + 1e-8)
    Xn = X_cands / (np.linalg.norm(X_cands, axis=2, keepdims=True) + 1e-8)

    scores = (Xn * Qn[:, None, :]).sum(axis=2)
    order = np.argsort(-scores, axis=1)
    return order[0] if order.shape[0] == 1 else order


# ============ Evaluating ============
def recall_k(flat_bundle: IndexBundle, ann_bundle: IndexBundle, X: np.ndarray, k: int = 10,
    nsamp: int = 200, seed: int = 42) -> float:
    """Compute recall@k between a flat index and an ANN index"""
    rng = np.random.default_rng(seed)
    idx = rng.choice(len(X), size=min(nsamp, len(X)), replace=False)
    Df, If = flat_bundle.index.search(X[idx], k)
    Da, Ia = ann_bundle.index.search(X[idx], k)

    hit = sum(len(set(If[i]).intersection(set(Ia[i]))) for i in range(len(idx)))
    return hit / (len(idx) * k)


def sweep_nprobe(ivfpq_bundle: IndexBundle, flat_bundle: IndexBundle, X: np.ndarray, values: List[int]) -> List[Tuple[int, float]]:
    """Sweep nprobe and return [(nprobe, recall@10)]"""
    results = []
    for nprobe in values:
        ivfpq_bundle.index.nprobe = nprobe
        rec = recall_k(flat_bundle, ivfpq_bundle, X, k=10, nsamp=min(200, len(X)))
        results.append((nprobe, rec))
    return results
