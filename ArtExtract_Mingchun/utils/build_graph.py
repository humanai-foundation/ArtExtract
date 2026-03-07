import numpy as np
import torch
import matplotlib.pyplot as plt

from scipy import ndimage
from skimage import graph, segmentation, filters
from sklearn.preprocessing import StandardScaler
from torch_geometric.data import Data


def build_rag(image, segments):
    """Build a Region Adjacency Graph (RAG) from the image segments.
    Args:
        image (np.ndarray): Input image of shape (H, W, C) or (H, W).
        segments (np.ndarray): Segmentation map of shape (H, W) with segment labels.
    Returns:
        rag (skimage.graph.RAG): Region Adjacency Graph with edges weighted by pixel intensity differences.
    """
    if image.ndim == 2:
        image_processed = image[:, :, np.newaxis]
    else:
        image_processed = image
        
    rag = graph.RAG(segments, connectivity=2) # Concern diagonal connectivity
    present_segments = np.unique(segments)
    num_nodes = np.max(segments) + 1
    num_channels = image_processed.shape[2]

    # Calculate mean, std, and edge intensity for each segment
    # Initialize arrays to hold the statistics
    mean_intensity = np.zeros((num_nodes, num_channels))
    std_intensity = np.zeros((num_nodes, num_channels))
    mean_edge = np.zeros((num_nodes, num_channels))

    for c in range(num_channels):
        channel_image = image_processed[:, :, c]

        mean_stat = ndimage.mean(channel_image, labels=segments, index=present_segments)
        std_stat = ndimage.standard_deviation(channel_image, labels=segments, index=present_segments)
        edge_image = filters.sobel(channel_image)
        edge_stat = ndimage.mean(edge_image, labels=segments, index=present_segments)

        mean_intensity[present_segments, c] = mean_stat
        std_intensity[present_segments, c] = std_stat
        mean_edge[present_segments, c] = edge_stat

    # Process the NAN values
    mean_intensity = np.nan_to_num(mean_intensity)
    std_intensity = np.nan_to_num(std_intensity)
    mean_edge = np.nan_to_num(mean_edge)
    
    # Define weights for the RAG edges
    weight_mean = 1.0
    weight_std = 1.0
    weight_edge = 1.0

    for n1, n2 in rag.edges:
        # Calculate the absolute differences in mean, std, and edge intensity
        # between the two segments connected by the edge
        diff_mean = np.mean(np.abs(mean_intensity[n1] - mean_intensity[n2]))
        diff_std = np.mean(np.abs(std_intensity[n1] - std_intensity[n2]))
        diff_edge = np.mean(np.abs(mean_edge[n1] - mean_edge[n2]))

        # Combine the differences using the defined weights
        # This gives more flexibility in how much each feature contributes to the edge weight
        weight = (weight_mean * diff_mean +
                weight_std * diff_std +
                weight_edge * diff_edge)

        rag.edges[(n1, n2)]['weight'] = weight
    
    return rag

def extract_node(image, segments, target_feature_dim=None):
    """Extract features for each superpixel in the image.
    Args:
        image (np.ndarray): Input image of shape (H, W, C) or (H, W).
        segments (np.ndarray): Segmentation map of shape (H, W) with segment labels.
        target_feature_dim (int, optional): Desired feature dimension for each node. If None, uses the default feature dimension.
    Returns:
        features (np.ndarray): Node features of shape (num_nodes, feature_dim).
    """
    # Check if the image is grayscale or multi-channel  
    if image.ndim == 2:
        image_processed = image[:, :, np.newaxis] # (H, W, 1)
    else:
        image_processed = image

    num_nodes = np.max(segments) + 1
    feature_dim = image_processed.shape[2] * 4 + 2
    if target_feature_dim is None:
        target_feature_dim = feature_dim
    features = np.zeros((num_nodes, target_feature_dim), dtype=np.float32)
    
    for i in range(num_nodes):
        mask = (segments == i)
        region_pixels = image_processed[mask]

        if region_pixels.size == 0:
            continue # Skip empty segments
        else:
            # Calculate statistics for the region
            mean_val = np.mean(region_pixels, axis=0)
            std_val = np.std(region_pixels, axis=0)
            min_val = np.min(region_pixels, axis=0)
            max_val = np.max(region_pixels, axis=0)

            # compute texture feature using gradient magnitude
            grad = np.gradient(region_pixels.astype(float), axis=0)
            texture_val = np.mean(np.abs(grad), axis=0)

            # Handle NaN and Inf values
            mean_val = np.nan_to_num(mean_val, nan=0.0, posinf=0.0, neginf=0.0)
            std_val = np.nan_to_num(std_val, nan=0.0, posinf=0.0, neginf=0.0)
            min_val = np.nan_to_num(min_val, nan=0.0, posinf=0.0, neginf=0.0)
            max_val = np.nan_to_num(max_val, nan=0.0, posinf=0.0, neginf=0.0)
            
            # Calculate the center of the region
            coords = np.argwhere(mask)
            center_yx = coords.mean(axis=0) # (y, x)
            center_yx = np.nan_to_num(center_yx, nan=0.0, posinf=0.0, neginf=0.0)

            # Construct the feature vector
            feature_vec = np.concatenate([
                mean_val,
                std_val,
                min_val,
                max_val,
                texture_val,
                center_yx
            ])
            # Ensure the feature vector has the correct length
            features[i, :feature_vec.shape[0]] = feature_vec[:feature_dim]

    return features

def image_to_graph(image, n_segments=100, compactness=10, normalize_features=True, target_feature_dim=None):
    """Convert an image to a graph representation using SLIC segmentation.
    Args:
        image (np.ndarray): Input image of shape (H, W, C) or (H, W).
        n_segments (int): Number of segments for SLIC segmentation.
        compactness (float): Compactness parameter for SLIC segmentation.
        normalize_features (bool): Whether to normalize the node features.
        target_feature_dim (int, optional): Desired feature dimension for each node. If None, uses the default feature dimension.
    Returns:
        data (torch_geometric.data.Data): Graph data object containing node features, edge indices, and edge attributes.
        segments (np.ndarray): Segmentation map of shape (H, W) with segment labels
        image_rag (np.ndarray): Processed image for visualization, same shape as input image.
    """
    # SLIC expects the image to be in float format, so we convert it if necessary
    # Ensure the image is in float32 format
    # if image.dtype == np.uint8:
        # Convert image to float32 for processing
    #     image = image.astype(np.float32) / 255.0
    # else:
    #    image = image.astype(np.float32)

    # Check if the image is grayscale or multi-channel
    # If grayscale, convert to (H, W, 1) for consistency
    # All images should be in (H, W, C) format for processing
    if image.ndim == 2:
        image_slic = image
        image_rag = image[:, :, np.newaxis] # Convert grayscale to (H, W, 1)
        channel_axis = None # No channel axis for grayscale
    else:
        image_slic = image
        image_rag = image
        channel_axis = -1 # Last axis is the channel axis for multi-channel images

    # Perform SLIC segmentation
    segments = segmentation.slic(image_slic, n_segments=n_segments, compactness=compactness, channel_axis=channel_axis)

    # Extract features for each superpixel
    # Using the extract_node function to get features for each segment
    features = extract_node(image_rag, segments, target_feature_dim)

    if normalize_features:
        scaler = StandardScaler()
        # Normalize features if there are multiple segments
        # If only one segment, we skip normalization to avoid errors
        if features.shape[0] > 1:
            features = scaler.fit_transform(features)
        else:
            print("Warning: Only one superpixel, skipping feature normalization.")

    # Create edges based on the superpixel adjacency
    # Using the Region Adjacency Graph (RAG) to find edges
    rag = build_rag(image_rag, segments)

    edge_index = []
    edge_attr = [] # Store edge weights

    for n1, n2 in rag.edges:
        # Add edges in both directions for undirected graph
        # PyTorch Geometric expects edges in the format (source, target)
        edge_index.append([n1, n2])
        edge_index.append([n2, n1])
        
        # Get the weight of the edge
        # This is the weight defined in the RAG, which can be based on pixel intensity
        weight = rag.edges[(n1, n2)]['weight']
        edge_attr.append([weight]) # PyTorch Geometric requires edge attributes to be in a list
        edge_attr.append([weight]) # Add the same weight for the reverse edge

    # To tensor conversion
    # Convert features, edge_index, and edge_attr to PyTorch tensors
    x = torch.tensor(features, dtype=torch.float)
    edge_index_np = np.array(edge_index).T if len(edge_index) > 0 else np.empty((2, 0), dtype=int)
    edge_attr_np = np.array(edge_attr) if len(edge_attr) > 0 else np.empty((0, 1), dtype=float)

    if edge_index_np.shape[1] == 0: # If no edges are found, create a self-loop for each node
        node_indices = np.arange(x.shape[0])
        edge_index_np = np.vstack([node_indices, node_indices])
        edge_attr_np = np.zeros((x.shape[0], 1))

    # transform to PyTorch tensors
    edge_index = torch.tensor(edge_index_np, dtype=torch.long)
    edge_attr = torch.tensor(edge_attr_np, dtype=torch.float)

    # Create a PyG Data object
    # This object will hold the node features, edge indices, and edge attributes
    data = Data(x=x, edge_index=edge_index, edge_attr=edge_attr)
    data.num_nodes = x.shape[0]

    return data, segments, image_rag

def image_to_graph_infer(image, segments, normalize_features=True, target_feature_dim=None):
    """Convert an image to a graph representation using pre-defined segments.
    Args:
        image (np.ndarray): Input image of shape (H, W, C) or (H, W).
        segments (np.ndarray): Segmentation map of shape (H, W) with segment labels.
        normalize_features (bool): Whether to normalize the node features.
        target_feature_dim (int, optional): Desired feature dimension for each node. If None, uses the default feature dimension.
    Returns:
        data (torch_geometric.data.Data): Graph data object containing node features, edge indices, and edge attributes.
    """
    # Extract features for each superpixel using the provided segments
    features = extract_node(image, segments, target_feature_dim)
    if normalize_features and features.shape[0] > 1:
        scaler = StandardScaler()
        features = scaler.fit_transform(features)
    
    x = torch.tensor(features, dtype=torch.float)
    rag = build_rag(image, segments)

    edge_index = []
    edge_attr = []

    # Create edges based on the RAG
    # Each edge connects two segments in the RAG
    for n1, n2 in rag.edges:
        edge_index.append([n1, n2])
        edge_index.append([n2, n1])
        weight = rag.edges[(n1, n2)]['weight']
        edge_attr.append([weight])
        edge_attr.append([weight])

    edge_index_np = np.array(edge_index).T if len(edge_index) > 0 else np.empty((2, 0), dtype=int)
    edge_attr_np = np.array(edge_attr) if len(edge_attr) > 0 else np.empty((0, 1), dtype=float)

    # If no edges are found, create a self-loop for each node
    # This ensures that the graph has at least one edge per node
    if edge_index_np.shape[1] == 0:
        node_indices = np.arange(x.shape[0])
        edge_index_np = np.vstack([node_indices, node_indices])
        edge_attr_np = np.zeros((x.shape[0], 1))

    edge_index = torch.tensor(edge_index_np, dtype=torch.long)
    edge_attr = torch.tensor(edge_attr_np, dtype=torch.float)
    data = Data(x=x, edge_index=edge_index, edge_attr=edge_attr)
    data.num_nodes = x.shape[0]

    return data

def image_to_graph_rgb(image, n_segments=5000, compactness=1, normalize_features=True, target_feature_dim=None):
    if image.ndim == 2:
        image_slic = image
        channel_axis = None
    else:
        image_slic = image
        channel_axis = -1
    segments = segmentation.slic(image_slic, n_segments=n_segments, compactness=compactness, channel_axis=channel_axis)

    return image_to_graph_infer(image, segments, normalize_features, target_feature_dim), segments

def visualize_segments(image, segments):
    """
    Visualize the SLIC superpixel segmentation used for graph construction.
    This utility overlays the segmentation boundaries on the original image
    to help inspect how the painting is partitioned into graph nodes.
    """

    plt.figure(figsize=(6, 6))
    plt.imshow(image)

    # overlay superpixel boundaries
    plt.contour(segments, colors="red", linewidths=0.5)

    plt.title("Superpixel Graph Segmentation")
    plt.axis("off")

    plt.show()