import os
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt
import warnings

from tqdm import tqdm
from utils.data_graph import load_datasets
from model.extract_model import GATSiameseNetwork

warnings.filterwarnings('ignore', category=RuntimeWarning)

def contrastive_loss(emb1, emb2, margin=1.0):
    # emb1: RGB embedding (batch, d), emb2: mask embedding (batch, d)
    pos_dist = F.pairwise_distance(emb1, emb2)
    # batch hard negative: shift emb2
    emb2_neg = torch.roll(emb2, shifts=1, dims=0)
    neg_dist = F.pairwise_distance(emb1, emb2_neg)
    loss = torch.mean(pos_dist**2) + torch.mean(F.relu(margin - neg_dist)**2)
    return loss

def train_siamese_network(model, train_loader, optimizer, scheduler, device, epoch, model_dir='checkpoints', best_loss=float('inf')):
    model.train()
    total_loss = 0.0
    os.makedirs(model_dir, exist_ok=True)
    
    for batch_rgb, batch_masks in tqdm(train_loader, desc="Training Progress"):
        # Move data to device
        batch_rgb = batch_rgb.to(device)
        batch_masks = [mask.to(device) for mask in batch_masks]

        optimizer.zero_grad()

        losses = []
        for mask_graph in batch_masks:
            # Forward pass through the model
            rgb_embedding, mask_embedding, *_ = model(batch_rgb, mask_graph) # Use the first mask graph for training
            # Calculate contrastive loss
            loss = contrastive_loss(rgb_embedding, mask_embedding)
            losses.append(loss)
        total_batch_loss = torch.stack(losses).mean() 

        # Backward pass and optimization
        total_batch_loss.backward()
        optimizer.step()

        total_loss += total_batch_loss.item()

    avg_loss = total_loss / len(train_loader)
    print(f"Average Training Loss: {avg_loss:.4f}")

    # Save the model state
    checkpoint = {
        'epoch': epoch,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'loss': avg_loss
    }
    torch.save(checkpoint, os.path.join(model_dir, 'model_checkpoint.pth'))

    # save the best model based on the average loss
    if avg_loss < best_loss:
        best_loss = avg_loss
        torch.save(model.state_dict(), os.path.join(model_dir, 'best_model.pth'))
        print(f"Best model saved with loss: {best_loss:.4f}")
    scheduler.step()  # Step the learning rate scheduler after each epoch
    return avg_loss, best_loss

def evaluate_siamese_network(model, val_loader, device):
    model.eval()
    total_loss = 0.0
    with torch.no_grad():
        for batch_rgb, batch_masks in tqdm(val_loader, desc="Validation Progress"):
            # Move data to device
            batch_rgb = batch_rgb.to(device)
            batch_masks = [mask.to(device) for mask in batch_masks]

            # Forward pass through the model
            rgb_embedding, mask_embedding, *_ = model(batch_rgb, batch_masks[0])  # Use the first mask graph for validation

            # Calculate contrastive loss
            loss = contrastive_loss(rgb_embedding, mask_embedding)

            total_loss += loss.item()
    avg_loss = total_loss / len(val_loader)
    print(f"Average Validation Loss: {avg_loss:.4f}")
    return avg_loss

def main():
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[Info] Using device: {device}")
    
    # Load datasets
    train_loader, val_loader = load_datasets('./dataset/train', './dataset/val', batch_size=8)
    
    # Check the first batch to determine feature dimensions
    batch_rgb, batch_masks = next(iter(train_loader))
    feature_dim = batch_rgb.x.shape[1]
    print(f"[Info] Auto-detected node feature dim: {feature_dim}")

    # Define model parameters
    in_channels = feature_dim  # RGB channels
    hidden_channels = 128
    out_channels = 32  # Output channels for GCN

    # Initialize model, optimizer, and loss function
    model = GATSiameseNetwork(in_channels, hidden_channels, out_channels).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3)
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=3, gamma=0.8)  # Example scheduler
    model_dir = './checkpoints'

    best_loss = float('inf')  # Initialize best loss for model saving
    train_losses = []
    val_losses = []
    patience = 10  # Early stopping patience counter
    patience_counter = 0
    
    # Train the model
    for epoch in range(50):  # Example: train for 10 epochs
        print(f"Epoch {epoch+1}/{50}")
        train_loss, best_loss = train_siamese_network(model, train_loader, optimizer, scheduler, device, epoch+1, model_dir, best_loss)
        val_loss = evaluate_siamese_network(model, val_loader, device)
        train_losses.append(train_loss)
        val_losses.append(val_loss)

        # Early stopping condition
        if val_loss < best_loss:
            best_loss = val_loss
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"Early stopping triggered after {patience} epochs without improvement.")
                early_stopping = True
                break

    plt.plot(train_losses, label='Train Loss')
    plt.plot(val_losses, label='Validation Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    plt.title('Training and Validation Loss')
    plt.show()

if __name__ == "__main__":
    main()