#!/usr/bin/env python3
"""
Quick test script for the improved art reconstruction pipeline.
This demonstrates the pipeline with a simple test image.
"""

import sys
import os
import numpy as np
import cv2
from PIL import Image

# Add the module to path
sys.path.insert(0, '/workspaces/ArtExtract_proposal/ArtExtract_Soyoung')

from pipeline import ArtReconstructionPipeline


def create_test_image(output_path='/tmp/test_artwork_quick.png'):
    """Create a synthetic test image"""
    print("Creating test image...")
    
    # Create base canvas
    canvas = np.ones((256, 256, 3), dtype=np.uint8) * 240
    
    # Add simulated painting layers
    canvas[50:200, 50:200] = [200, 180, 160]
    cv2.rectangle(canvas, (75, 75), (175, 175), (180, 150, 120), -1)
    cv2.circle(canvas, (125, 125), 40, (220, 200, 180), -1)
    
    # Add noise
    noise = np.random.normal(0, 15, canvas.shape)
    canvas = np.clip(canvas.astype(float) + noise, 0, 255).astype(np.uint8)
    
    # Save
    cv2.imwrite(output_path, cv2.cvtColor(canvas, cv2.COLOR_RGB2BGR))
    print(f"✓ Test image created: {output_path}")
    
    return output_path, canvas


def test_preprocessing():
    """Test preprocessing step"""
    print("\n" + "="*60)
    print("TEST 1: PREPROCESSING")
    print("="*60)
    
    # Create test image
    test_path, original = create_test_image()
    
    # Initialize pipeline
    pipeline = ArtReconstructionPipeline()
    
    # Test preprocessing
    preprocessed = pipeline.preprocess_image(test_path)
    print(f"✓ Preprocessing successful")
    print(f"  Input shape: {original.shape}")
    print(f"  Output shape: {preprocessed.shape}")
    print(f"  Intensity range: [{preprocessed.min()}, {preprocessed.max()}]")
    
    return pipeline, preprocessed


def test_edge_detection(pipeline, image):
    """Test edge detection"""
    print("\n" + "="*60)
    print("TEST 2: EDGE DETECTION")
    print("="*60)
    
    edges = pipeline.edge_detection(image)
    print(f"✓ Edge detection successful")
    print(f"  Output shape: {edges.shape}")
    print(f"  Non-zero pixels: {np.count_nonzero(edges)}")
    print(f"  Coverage: {np.count_nonzero(edges) / edges.size * 100:.2f}%")
    
    return edges


def test_segmentation(pipeline, image):
    """Test segmentation"""
    print("\n" + "="*60)
    print("TEST 3: SEGMENTATION")
    print("="*60)
    
    print("Loading Mask2Former model (this may take a moment)...")
    seg_mask = pipeline.segmentation(image)
    print(f"✓ Segmentation successful")
    print(f"  Output shape: {seg_mask.shape}")
    print(f"  Mask coverage: {np.count_nonzero(seg_mask) / seg_mask.size * 100:.2f}%")
    print(f"  Intensity range: [{seg_mask.min()}, {seg_mask.max()}]")
    
    return seg_mask


def test_mask_fusion(pipeline, edges, seg_mask):
    """Test mask fusion"""
    print("\n" + "="*60)
    print("TEST 4: MASK FUSION")
    print("="*60)
    
    fused = pipeline.mask_fusion(edges, seg_mask)
    print(f"✓ Mask fusion successful")
    print(f"  Output shape: {fused.shape}")
    print(f"  Intensity range: [{fused.min()}, {fused.max()}]")
    print(f"  Non-zero pixels: {np.count_nonzero(fused)}")
    
    return fused


def test_full_pipeline():
    """Test the complete pipeline"""
    print("\n" + "="*60)
    print("FULL PIPELINE TEST")
    print("="*60)
    
    # Create test image
    test_path, _ = create_test_image()
    
    # Initialize pipeline
    pipeline = ArtReconstructionPipeline()
    
    # Run individual steps to test
    print("\n1. Testing Preprocessing...")
    preprocessed = pipeline.preprocess_image(test_path)
    print("   ✓ Success")
    
    print("2. Testing Edge Detection...")
    edges = pipeline.edge_detection(preprocessed)
    print("   ✓ Success")
    
    print("3. Testing Segmentation...")
    seg_mask = pipeline.segmentation(preprocessed)
    print("   ✓ Success")
    
    print("4. Testing Mask Fusion...")
    fused_mask = pipeline.mask_fusion(edges, seg_mask)
    print("   ✓ Success")
    
    print("\nAll core pipeline steps tested successfully!")
    print("\nNote: Generative inpainting and enhancement require significant")
    print("      GPU memory and time. They are available in the full pipeline.")


if __name__ == "__main__":
    print("="*60)
    print("IMPROVED ART RECONSTRUCTION PIPELINE - TEST SUITE")
    print("="*60)
    
    try:
        # Run full pipeline test
        test_full_pipeline()
        
        print("\n" + "="*60)
        print("ALL TESTS PASSED!")
        print("="*60)
        print("\nTo run the complete pipeline with generative inpainting")
        print("and super-resolution, use the Jupyter notebook:")
        print("  improved_pipeline.ipynb")
        print("\nOr use the pipeline directly:")
        print("  python pipeline.py <image_path>")
        
    except Exception as e:
        print(f"\n✗ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)