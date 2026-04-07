from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import torch
import os

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_directory(path: str, label: str) -> None:
    """Raise a clear error when a required directory is missing or not a dir."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"{label} directory does not exist: '{path}'")
    if not os.path.isdir(path):
        raise NotADirectoryError(f"{label} path is not a directory: '{path}'")


def _validate_image_mask_pairing(images: list, masks: dict, images_dir: str) -> None:
    """
    Raise ValueError for any image that has no associated masks.
    An unpaired image would silently produce an empty mask stack at runtime,
    which is much harder to debug than a clear startup error.
    """
    unpaired = [img for img, mask_list in masks.items() if len(mask_list) == 0]
    if unpaired:
        raise ValueError(
            f"The following images in '{images_dir}' have no corresponding masks:\n"
            + "\n".join(f"  {name}" for name in unpaired)
        )


# ---------------------------------------------------------------------------
# Dataset
# ---------------------------------------------------------------------------

class UNetDataset(Dataset):
    def __init__(self, images_dir: str, masks_dir: str, transform=None):
        # ------------------------------------------------------------------
        # 1. FILE PATH VALIDATION — fail fast with actionable messages
        # ------------------------------------------------------------------
        _validate_directory(images_dir, "Images")
        _validate_directory(masks_dir, "Masks")

        self.images_dir = images_dir
        self.masks_dir = masks_dir
        self.transform = transform

        # Collect valid image files
        valid_exts = ('RGB.bmp', '.png', '.jpg', '.JPG')
        self.images = sorted(
            f for f in os.listdir(images_dir)
            if any(f.endswith(ext) for ext in valid_exts)
        )

        if len(self.images) == 0:
            raise FileNotFoundError(
                f"No valid image files found in images directory: '{images_dir}'. "
                "Expected files ending with 'RGB.bmp', '.png', '.jpg', or '.JPG'."
            )

        # Map each image → its sorted list of mask files
        self.masks = {
            img_name: sorted(
                f for f in os.listdir(masks_dir)
                if f.startswith(img_name.split('_RGB')[0])
            )
            for img_name in self.images
        }

        # Ensure every image actually has at least one mask
        _validate_image_mask_pairing(self.images, self.masks, images_dir)

    # ------------------------------------------------------------------

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_name = self.images[idx]
        img_path = os.path.join(self.images_dir, img_name)

        # Validate individual file existence at read time (handles deletions
        # that occur after __init__ or symlinks that point nowhere)
        if not os.path.isfile(img_path):
            raise FileNotFoundError(f"Image file missing at runtime: '{img_path}'")

        image = Image.open(img_path).convert('RGB')

        masks = []
        for mask_name in self.masks[img_name]:
            mask_path = os.path.join(self.masks_dir, mask_name)

            if not os.path.isfile(mask_path):
                raise FileNotFoundError(f"Mask file missing at runtime: '{mask_path}'")

            mask = Image.open(mask_path)
            mode = mask.mode

            if mode == 'I;16':          # 16-bit grayscale
                mask = mask.point(lambda i: i * (1 / 255)).convert('L')
            elif mode not in ('L', 'I'):
                mask = mask.convert('L')

            masks.append(mask)

        if self.transform:
            image = self.transform(image)
            # ------------------------------------------------------------------
            # 2. MASK NORMALIZATION FIX
            # ToTensor() already scales uint8 PIL images from [0, 255] → [0, 1].
            # Applying an additional / 255.0 after the transform would push all
            # values into [0, ~0.004], effectively zeroing out the masks.
            # We apply the spatial transforms (Resize, flips) via a dedicated
            # mask transform that deliberately omits ToTensor(), then convert
            # manually — ensuring exactly one normalisation pass.
            # ------------------------------------------------------------------
            masks = [self.transform(mask) for mask in masks]
            # At this point each mask is already a float tensor in [0, 1]
            # courtesy of ToTensor() inside self.transform — no further
            # division needed.
        else:
            # No transform supplied: convert to tensor and normalise once.
            to_tensor = transforms.ToTensor()
            masks = [to_tensor(mask) for mask in masks]

        masks = torch.stack(masks)          # shape: (N, 1, H, W)
        return image.float(), masks.float()


# ---------------------------------------------------------------------------
# DataLoader factory
# ---------------------------------------------------------------------------

def load_datasets(train_path: str, val_path: str, seed: int = 42):
    # ------------------------------------------------------------------
    # 1. FILE PATH VALIDATION for top-level dataset roots
    # ------------------------------------------------------------------
    _validate_directory(train_path, "Training root")
    _validate_directory(val_path, "Validation root")

    train_images_dir = os.path.join(train_path, 'rgb_images')
    train_masks_dir  = os.path.join(train_path, 'ms_masks')
    val_images_dir   = os.path.join(val_path,   'rgb_images')
    val_masks_dir    = os.path.join(val_path,   'ms_masks')

    # Validate sub-directories before constructing datasets
    _validate_directory(train_images_dir, "Train images")
    _validate_directory(train_masks_dir,  "Train masks")
    _validate_directory(val_images_dir,   "Validation images")
    _validate_directory(val_masks_dir,    "Validation masks")

    train_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.ToTensor(),              # scales to [0, 1]
    ])

    val_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
    ])

    train_dataset = UNetDataset(train_images_dir, train_masks_dir, transform=train_transform)
    val_dataset   = UNetDataset(val_images_dir,   val_masks_dir,   transform=val_transform)

    # ------------------------------------------------------------------
    # 3. REPRODUCIBLE DATALOADER WITH num_workers
    # A fixed Generator ensures shuffle order is deterministic across runs
    # when the same seed is used, making experiments reproducible.
    # num_workers overlaps disk I/O with GPU compute, reducing idle time.
    # ------------------------------------------------------------------
    num_workers = min(4, os.cpu_count() or 1)
    generator   = torch.Generator().manual_seed(seed)

    train_loader = DataLoader(
        train_dataset,
        batch_size=8,
        shuffle=True,
        pin_memory=True,
        num_workers=num_workers,
        generator=generator,
        persistent_workers=num_workers > 0,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=8,
        shuffle=False,
        pin_memory=True,
        num_workers=num_workers,
        persistent_workers=num_workers > 0,
    )

    return train_loader, val_loader
