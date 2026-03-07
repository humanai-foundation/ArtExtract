import os 
import torch
import warnings
warnings.filterwarnings("ignore")

from utils.visualization import extract_hidden_art
from utils.data_graph import load_inference_datasets
from model.extract_model import GATSiameseNetwork

def main():
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Initialize model
    # infer feature dimension dynamically
    sample_loader = load_inference_datasets('./dataset/val', batch_size=1)
    sample_data = next(iter(sample_loader))
    feature_dim = sample_data.x.shape[1]

    model = GATSiameseNetwork(
    in_channels=feature_dim,
    hidden_channels=128,
    out_channels=32
    ).to(device)
    
    # Load pre-trained model weights
    model.load_state_dict(torch.load('./checkpoints/GAT/best_model.pth', map_location=device))
    
    # Load validation dataset
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--data_path", default="./dataset/val")
    args = parser.parse_args()

    val_loader = load_inference_datasets(args.data_path, batch_size=1)
    
    # Extract and visualize hidden art features
    extract_hidden_art(model, val_loader, device, save_dir='./img', mode='diff', alpha=0.5)

if __name__ == "__main__":
    main()