import torch
import numpy as np
import matplotlib.pyplot as plt

from tqdm import tqdm

def overlay_node(image, segments, node_importance, alpha=0.5, cmap='jet'):
    """Overlay node importance on the image using a heatmap.
    Args:
        image (np.ndarray): Input image of shape (H, W, C) or (H, W).
        segments (np.ndarray): Segmentation map of shape (H, W) with segment labels.
        node_importance (np.ndarray): Node importance values of shape (num_segments,).
        alpha (float): Transparency level for the overlay.
        cmap (str): Colormap to use for the heatmap.
    Returns:
        np.ndarray: Overlayed image with heatmap applied.
    """
    H, W, _ = image.shape
    heatmap = np.zeros((H, W), dtype=np.float32)

    for node_idx, importance in enumerate(node_importance):
        heatmap[segments == node_idx] = importance

    #Improve numerical stability in heatmap normalization
    denom = heatmap.max() - heatmap.min()
    if denom < 1e-8:
        heatmap_norm = np.zeros_like(heatmap)
    else:
        heatmap_norm = (heatmap - heatmap.min()) / denom

    # Transform heatmap to RGB using the specified colormap
    cmap_func = plt.get_cmap(cmap)
    heatmap_rgb = cmap_func(heatmap_norm)[:, :, :3]  # shape: (H, W, 3), RGB

    if image.max() > 1.0:
        image_norm = image.astype(np.float32) / 255.0
    else:
        image_norm = image

    # Create the overlay by blending the image and heatmap
    overlay = (1 - alpha) * image_norm + alpha * heatmap_rgb
    overlay = np.clip(overlay, 0, 1)

    return overlay

def save_overlay(image, heatmap, save_path):
    """
    Save an overlay visualization of the heatmap on the image.
    Useful for inspecting hidden structures detected by the model.
    """

    plt.figure(figsize=(6, 6))
    plt.imshow(image)
    plt.imshow(heatmap, cmap="jet", alpha=0.5)
    plt.axis("off")

    plt.savefig(save_path)
    plt.close()

def extract_hidden_art(model, data_loader, device, save_dir=None, mode='diff', alpha=0.5):
    """Extract hidden art features from the model and visualize them.
    Args:
        model (nn.Module): The trained model for inference.
        data_loader (DataLoader): DataLoader for the dataset.
        device (torch.device): Device to run the model on.
        save_dir (str, optional): Directory to save the results. If None, results are not saved.
        mode (str): Mode of visualization ('diff' for node-level difference, 'gradcam' for Grad-CAM).
        alpha (float): Transparency level for the overlay in visualization.
    """
    model.eval()
    for idx, (batch_rgb, batch_masks, graph_segments, graph_images) in enumerate(tqdm(data_loader, desc="Inference Progress")):
        batch_rgb = batch_rgb.to(device)
        batch_masks = [mask.to(device) for mask in batch_masks]

        emb1, emb2, node1, node2, edge1, edge2 = model(batch_rgb, batch_masks[0])

        image_np = graph_images[0]
        segments_np = graph_segments[0]

        if mode == 'diff':
            # ----- Node-level Difference Overlay -----)
            diff = torch.norm(node1 - node2, dim=1).detach().cpu().numpy()
            overlay_img = overlay_node(image_np, segments_np, diff, alpha=alpha, cmap='jet')
            title = 'Node-level Difference Overlay'

        elif mode == 'gradcam':
            # ----- Grad-CAM -----
            activations = None
            gradients = None

            def forward_hook(module, input, output):
                nonlocal activations
                activations = output.detach()

            def backward_hook(module, grad_input, grad_output):
                nonlocal gradients
                gradients = grad_output[0].detach()

            # Register hooks to capture activations and gradients
            hook_fwd = model.gat.conv3.register_forward_hook(forward_hook)
            hook_bwd = model.gat.conv3.register_backward_hook(backward_hook)

            output, *_ = model.gat(batch_rgb)
            target_score = output.sum()

            model.zero_grad()
            target_score.backward()

            # Grad-CAM calculation
            weights = gradients.mean(dim=1)  # [num_nodes]
            cam = torch.relu((weights * activations).sum(dim=1)).cpu().numpy()

            hook_fwd.remove()
            hook_bwd.remove()

            overlay_img = overlay_node(image_np, segments_np, cam, alpha=alpha, cmap='hot')
            title = 'Grad-CAM Overlay on RGB Image'

        else:
            raise NotImplementedError("Unsupported mode")

        plt.figure(figsize=(8,8))
        plt.imshow(overlay_img)
        plt.axis('off')
        plt.title(title)
        if save_dir:
            plt.savefig(f"{save_dir}/result_{idx}.png")
        plt.show()