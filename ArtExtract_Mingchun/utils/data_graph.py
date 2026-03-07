import os
import torch
import numpy as np

from utils.build_graph import image_to_graph, image_to_graph_rgb, image_to_graph_infer
from PIL import Image
from torchvision import transforms
from torch.utils.data import Dataset, DataLoader
from torch_geometric.loader import DataLoader as PyGDataLoader
from torch_geometric.data import Batch
from tqdm import tqdm

class GraphSiameseDataset(Dataset):
    """Dataset for loading RGB images and their corresponding masks as graphs.
    Args:
        images_dir (str): Directory containing RGB images.
        masks_dir (str): Directory containing corresponding masks.
        transform_img (callable, optional): Transform to apply to the images.
        transform_mask (callable, optional): Transform to apply to the masks.
        target_feature_dim (int, optional): Target feature dimension for node features.
    Returns:
        tuple: A tuple containing graph data for the image and its masks.
    """
    def __init__(self, images_dir, masks_dir, transform_img=None, transform_mask=None, 
                 target_feature_dim=None):
        self.images_dir = images_dir
        self.masks_dir = masks_dir
        self.transform_img = transform_img
        self.transform_mask = transform_mask
        
        # Find all RGB images and their corresponding masks
        self.images = [f for f in sorted(os.listdir(images_dir)) if f.lower().endswith(('.bmp', '.png', '.jpg', '.jpeg'))]
        self.masks = {
            img_name: sorted([f for f in os.listdir(masks_dir) if f.startswith(img_name.split('_RGB')[0])])
            for img_name in self.images
        }

        # Auto-detect target feature dimension from the first image
        sample_image = Image.open(os.path.join(images_dir, self.images[0])).convert('RGB')
        if self.transform_img:
            sample_image = self.transform_img(sample_image)
            if isinstance(sample_image, torch.Tensor):
                sample_image = sample_image.permute(1, 2, 0).cpu().numpy()
            else:
                sample_image = np.array(sample_image)
        else:
            sample_image = np.array(sample_image)
        sample_graph, _, _ = image_to_graph(sample_image, n_segments=5000, compactness=1,
                                           normalize_features=True, target_feature_dim=target_feature_dim)
        self.target_feature_dim = sample_graph.x.shape[1]
    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        # --------RGB image--------
        img_name = self.images[idx]
        img_path = os.path.join(self.images_dir, img_name)
        image = Image.open(path)

        # convert grayscale images to RGB
        if image.mode != "RGB":
            image = image.convert("RGB")
        if self.transform_img:
            image = self.transform_img(image) # (C, H, W)
        if isinstance(image, torch.Tensor):
            image_np = image.permute(1, 2, 0).cpu().numpy()  # Convert to (H, W, C) for processing
        else:
            image_np = np.array(image)
        graph_data, _, _ = image_to_graph(image_np, n_segments=5000, compactness=1, normalize_features=True, 
                                           target_feature_dim=self.target_feature_dim)

        # --------Masks--------
        mask_names = self.masks[img_name]
        mask_datas = []
        for mask_name in mask_names:
            mask_path = os.path.join(self.masks_dir, mask_name)
            mask = Image.open(mask_path)
            if mask.mode == 'I;16':
                mask = mask.point(lambda i: i * (1 / 255)).convert('L')
            elif mask.mode not in ['L', 'I']:
                mask = mask.convert('L')

            if self.transform_mask:
                mask = self.transform_mask(mask) # (1, H, W)
            if isinstance(mask, torch.Tensor):
                mask_np = mask.permute(1, 2, 0).cpu().numpy() # Convert to (H, W, 1) for processing
            else:
                mask_np = np.array(mask)
            # Ensure mask is in (H, W, 1) format
            if mask_np.ndim == 2:
                mask_np = mask_np[:, :, np.newaxis]
            
            mask_data, _, _ = image_to_graph(mask_np, n_segments=5000, compactness=0.01, normalize_features=True,
                                              target_feature_dim=self.target_feature_dim)
            mask_datas.append(mask_data)

        
        return graph_data, mask_datas

def collate_fn(batch):
    """Custom collate function to handle batches of graph data.
    Args:
        batch (list): List of tuples, where each tuple contains a graph image and its corresponding mask graphs.
    Returns:
        tuple: A tuple containing a batch of graph images and a list of mask graphs.
    """
    graph_images = [item[0] for item in batch]          # list of PyG Data
    mask_graphs_lists = [item[1] for item in batch]     # list of list of PyG Data

    batch_graph_images = Batch.from_data_list(graph_images)

    batch_mask_graphs = []
    for i in range(8):  # Assuming there are always 8 mask graphs per image
        graphs_i = [mask_graphs_lists[j][i] for j in range(len(mask_graphs_lists))]
        batch_mask_graphs.append(Batch.from_data_list(graphs_i))

    return batch_graph_images, batch_mask_graphs

def load_datasets(train_path, val_path, batch_size):
    """Load training and validation datasets.
    Args:
        train_path (str): Path to the training dataset directory.
        val_path (str): Path to the validation dataset directory.
        batch_size (int): Batch size for the DataLoader.
    Returns:
        tuple: A tuple containing the training and validation DataLoaders.
    """
    train_images_dir = os.path.join(train_path, 'rgb_images')
    train_masks_dir = os.path.join(train_path, 'ms_masks')
    val_images_dir = os.path.join(val_path, 'rgb_images')
    val_masks_dir = os.path.join(val_path, 'ms_masks')

    train_img_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.ToTensor(),
    ])

    train_mask_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
    ])

    val_img_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
    ])

    val_mask_transform = val_img_transform

    train_dataset = GraphSiameseDataset(train_images_dir, train_masks_dir,
                                  transform_img=train_img_transform,
                                  transform_mask=train_mask_transform)
    val_dataset = GraphSiameseDataset(val_images_dir, val_masks_dir,
                                transform_img=val_img_transform,
                                transform_mask=val_mask_transform)

    train_loader = PyGDataLoader(train_dataset, batch_size=batch_size, shuffle=True,
                                pin_memory=True, collate_fn=collate_fn)
    val_loader = PyGDataLoader(val_dataset, batch_size=batch_size, shuffle=False,
                              pin_memory=True, collate_fn=collate_fn)
    
    return train_loader, val_loader

# Inference dataset for loading images and masks
class InferenceDataset(Dataset):
    def __init__(self, images_dir, masks_dir, transform_img=None, transform_mask=None, 
                 target_feature_dim=None):
        self.images_dir = images_dir
        self.masks_dir = masks_dir
        self.transform_img = transform_img
        self.transform_mask = transform_mask
        
        # Find all RGB images and their corresponding masks
        self.images = [f for f in sorted(os.listdir(images_dir)) if f.lower().endswith(('.bmp', '.png', '.jpg', '.jpeg'))]
        self.masks = {
            img_name: sorted([f for f in os.listdir(masks_dir) if f.startswith(img_name.split('_RGB')[0])])
            for img_name in self.images
        }

        # Auto-detect target feature dimension from the first image
        sample_image = Image.open(os.path.join(images_dir, self.images[0])).convert('RGB')
        if self.transform_img:
            sample_image = self.transform_img(sample_image)
            if isinstance(sample_image, torch.Tensor):
                sample_image = sample_image.permute(1, 2, 0).cpu().numpy()
            else:
                sample_image = np.array(sample_image)
        else:
            sample_image = np.array(sample_image)
        sample_graph, _, _ = image_to_graph(sample_image, n_segments=5000, compactness=1,
                                           normalize_features=True, target_feature_dim=target_feature_dim)
        self.target_feature_dim = sample_graph.x.shape[1]

    def __len__(self):
        return len(self.images)
    
    def __getitem__(self, idx):
        img_name = self.images[idx]
        img_path = os.path.join(self.images_dir, img_name)
        try:
            image = Image.open(img_path).convert('RGB')
        except Exception as e:
            raise RuntimeError(f"Failed to load image: {img_path}") from e
        if self.transform_img:
            image = self.transform_img(image)
        if isinstance(image, torch.Tensor):
            image_np = image.permute(1, 2, 0).cpu().numpy()
        else:
            image_np = np.array(image)

        graph_data, segments = image_to_graph_rgb(
            image_np, n_segments=5000, compactness=1,
            target_feature_dim=self.target_feature_dim
        )

        mask_names = self.masks[img_name]
        mask_datas = []
        for mask_name in mask_names:
            mask_path = os.path.join(self.masks_dir, mask_name)
            mask = Image.open(mask_path)
            if mask.mode == 'I;16':
                mask = mask.point(lambda i: i * (1 / 255)).convert('L')
            elif mask.mode not in ['L', 'I']:
                mask = mask.convert('L')
            if self.transform_mask:
                mask = self.transform_mask(mask)
            if isinstance(mask, torch.Tensor):
                mask_np = mask.permute(1, 2, 0).cpu().numpy()
            else:
                mask_np = np.array(mask)
            if mask_np.ndim == 2:
                mask_np = mask_np[:, :, np.newaxis]
            mask_data = image_to_graph_infer(mask_np, segments, target_feature_dim=self.target_feature_dim)
            mask_datas.append(mask_data)

        return graph_data, mask_datas, segments, image_np

def inference_collate_fn(batch):
    batch_rgb = Batch.from_data_list([item[0] for item in batch])
    mask_lists = [item[1] for item in batch]
    batch_mask_batches = []
    for mask_idx in range(len(mask_lists[0])):
        masks_at_idx = [mask_lists[batch_idx][mask_idx] for batch_idx in range(len(mask_lists))]
        batch_mask_batches.append(Batch.from_data_list(masks_at_idx))
    batch_segments = [item[2] for item in batch]
    batch_graph_images = [item[3] for item in batch]
    return batch_rgb, batch_mask_batches, batch_segments, batch_graph_images

def load_inference_datasets(val_path, batch_size):
    val_images_dir = os.path.join(val_path, 'rgb_images')
    val_masks_dir = os.path.join(val_path, 'ms_masks')

    val_img_transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.ToTensor(),
    ])

    val_mask_transform = val_img_transform

    val_dataset = InferenceDataset(val_images_dir, val_masks_dir,
                                transform_img=val_img_transform,
                                transform_mask=val_mask_transform)

    val_loader = DataLoader(val_dataset, batch_size, shuffle=False, collate_fn=inference_collate_fn)
    return val_loader

