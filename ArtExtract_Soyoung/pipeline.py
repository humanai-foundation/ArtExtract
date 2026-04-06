"""
AI Pipeline for Hidden Image Reconstruction as per the proposal.
Enhanced with state-of-the-art models for superior performance.

System Architecture (Pipeline Flow):

                ┌────────────────────┐
                │   Input RGB Image  │
                └─────────┬──────────┘
                          ↓
                ┌────────────────────┐
                │  Preprocessing     │
                │ (Denoising, Clean) │
                └─────────┬──────────┘
                          ↓
                ┌────────────────────┐
                │ Edge Detection     │
                │ (Canny)            │
                └─────────┬──────────┘
                          ↓
                ┌────────────────────┐
                │ Segmentation       │
                │ (ROI Extraction)   │
                └─────────┬──────────┘
                          ↓
                ┌────────────────────┐
                │ Mask Fusion        │
                │ edges OR seg_mask  │
                └─────────┬──────────┘
                          ↓
                ┌────────────────────┐
                │ Generative AI      │
                │ (ControlNet + SD)  │
                └─────────┬──────────┘
                          ↓
                ┌────────────────────┐
                │ Enhancement        │
                │ + Upscaling        │
                └─────────┬──────────┘
                          ↓
                ┌────────────────────┐
                │ Final Output       │
                │ Reconstructed Art  │
                └────────────────────┘
"""

import cv2
import numpy as np
import torch
import logging
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForInstanceSegmentation, pipeline
from diffusers import StableDiffusionControlNetInpaintPipeline, ControlNetModel, DDIMScheduler
from realesrgan import RealESRGAN

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ArtReconstructionPipeline:
    def __init__(self, device=None):
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        
        # Initialize models
        self.segmentation_processor = None
        self.segmentation_model = None
        self.controlnet = None
        self.inpaint_pipe = None
        self.upscaler = None
        
    def preprocess_image(self, image_path):
        """Enhanced preprocessing with bilateral filtering and histogram equalization"""
        logger.info(f"Preprocessing image: {image_path}")
        image = cv2.imread(image_path)
        
        if image is None:
            raise ValueError(f"Could not load image from {image_path}")
        
        # Bilateral filtering for edge-preserving denoising
        image = cv2.bilateralFilter(image, 9, 75, 75)
        
        # Morphological operations
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        image = cv2.morphologyEx(image, cv2.MORPH_CLOSE, kernel)
        
        # Convert to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        logger.info("Preprocessing complete")
        return image

    def edge_detection(self, image):
        """Enhanced edge detection using Sobel and Canny"""
        logger.info("Performing edge detection")
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        
        # Sobel edge detection
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        sobel_edges = np.sqrt(sobelx**2 + sobely**2).astype(np.uint8)
        
        # Canny edge detection
        canny_edges = cv2.Canny(gray, 50, 150)
        
        # Combine edges
        combined_edges = cv2.bitwise_or(sobel_edges, canny_edges)
        
        logger.info("Edge detection complete")
        return combined_edges

    def segmentation(self, image):
        """Improved segmentation using Mask2Former with attention"""
        logger.info("Performing semantic segmentation")
        
        # Load models on first use
        if self.segmentation_model is None:
            self.segmentation_processor = AutoImageProcessor.from_pretrained(
                "facebook/mask2former-swin-large-coco-instance"
            )
            self.segmentation_model = AutoModelForInstanceSegmentation.from_pretrained(
                "facebook/mask2former-swin-large-coco-instance"
            ).to(self.device)
        
        # Prepare inputs
        inputs = self.segmentation_processor(images=image, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = self.segmentation_model(**inputs)
        
        # Post-process
        results = self.segmentation_processor.post_process_instance_segmentation(
            outputs, target_sizes=[image.shape[:2]]
        )
        
        # Extract instance masks
        masks = results[0]["segmentation"].cpu().numpy()
        
        # Generate segmentation mask
        if masks.size > 0:
            # Use weighted combination of masks
            seg_mask = np.max(masks, axis=0).astype(np.uint8) * 255
        else:
            seg_mask = np.zeros(image.shape[:2], dtype=np.uint8)
        
        logger.info("Segmentation complete")
        return seg_mask

    def mask_fusion(self, edges, seg_mask):
        """Intelligent mask fusion with morphological operations"""
        logger.info("Performing mask fusion")
        
        # Normalize masks
        edges_norm = (edges / 255.0).astype(np.float32)
        seg_norm = (seg_mask / 255.0).astype(np.float32)
        
        # Weighted fusion
        fused = (0.6 * edges_norm + 0.4 * seg_norm)
        
        # Morphological processing
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        fused = cv2.dilate((fused * 255).astype(np.uint8), kernel, iterations=2)
        fused = cv2.erode(fused, kernel, iterations=1)
        
        # Gaussian blur for smooth transitions
        fused = cv2.GaussianBlur(fused, (7, 7), 0)
        
        logger.info("Mask fusion complete")
        return fused

    def generative_inpainting(self, image, mask, prompt=None):
        """Enhanced inpainting using improved Stable Diffusion and ControlNet"""
        logger.info("Performing generative inpainting")
        
        if prompt is None:
            prompt = "masterpiece, high quality artwork, hidden composition, artistic detail, oil painting"
        
        # Load models on first use
        if self.inpaint_pipe is None:
            logger.info("Loading ControlNet and Stable Diffusion models...")
            
            self.controlnet = ControlNetModel.from_pretrained(
                "lllyasviel/sd-controlnet-canny",
                torch_dtype=torch.float16
            )
            
            self.inpaint_pipe = StableDiffusionControlNetInpaintPipeline.from_pretrained(
                "runwayml/stable-diffusion-v1-5-inpainting",
                controlnet=self.controlnet,
                torch_dtype=torch.float16
            )
            
            self.inpaint_pipe.scheduler = DDIMScheduler.from_config(
                self.inpaint_pipe.scheduler.config
            )
            self.inpaint_pipe = self.inpaint_pipe.to(self.device)
            self.inpaint_pipe.enable_attention_slicing()
        
        # Prepare inputs
        init_image = Image.fromarray(image)
        mask_image = Image.fromarray(mask)
        
        # Generate with enhanced parameters
        with torch.autocast("cuda" if self.device.type == "cuda" else "cpu"):
            output = self.inpaint_pipe(
                prompt=prompt,
                image=init_image,
                mask_image=mask_image,
                control_image=init_image,
                negative_prompt="blurry, low quality, distorted",
                num_inference_steps=30,
                guidance_scale=8.5,
                controlnet_conditioning_scale=1.0,
                height=init_image.height,
                width=init_image.width,
                generator=torch.Generator(device=self.device).manual_seed(42)
            ).images[0]
        
        logger.info("Generative inpainting complete")
        return np.array(output)

    def enhancement(self, image):
        """Super-resolution enhancement using RealESRGAN"""
        logger.info("Performing super-resolution enhancement")
        
        if self.upscaler is None:
            self.upscaler = RealESRGAN(self.device, scale=4)
            self.upscaler.load_weights('weights/RealESRGAN_x4plus.pth', download=True)
        
        # Convert PIL to numpy if needed
        if isinstance(image, Image.Image):
            image = np.array(image)
        
        # Ensure proper format
        image = np.clip(image, 0, 255).astype(np.uint8)
        
        # Upscale
        enhanced = self.upscaler.predict(image)
        
        logger.info("Enhancement complete")
        return enhanced

    def run(self, image_path, prompt=None, output_path="final_output.png"):
        """Run the complete pipeline"""
        logger.info("=" * 60)
        logger.info("Starting Art Reconstruction Pipeline")
        logger.info("=" * 60)
        
        try:
            # Step 1: Preprocessing
            image = self.preprocess_image(image_path)
            
            # Step 2: Edge Detection
            edges = self.edge_detection(image)
            
            # Step 3: Segmentation
            seg_mask = self.segmentation(image)
            
            # Step 4: Mask Fusion
            fused_mask = self.mask_fusion(edges, seg_mask)
            
            # Step 5: Generative Inpainting
            reconstructed = self.generative_inpainting(image, fused_mask, prompt)
            
            # Step 6: Enhancement
            final_output = self.enhancement(reconstructed)
            
            # Save output
            final_image = Image.fromarray(np.clip(final_output, 0, 255).astype(np.uint8))
            final_image.save(output_path)
            logger.info(f"Final output saved to {output_path}")
            
            logger.info("=" * 60)
            logger.info("Pipeline completed successfully!")
            logger.info("=" * 60)
            
            return final_output
            
        except Exception as e:
            logger.error(f"Pipeline failed with error: {str(e)}", exc_info=True)
            raise


def main(image_path, output_path="final_output.png", prompt=None):
    """Main entry point"""
    pipeline = ArtReconstructionPipeline()
    result = pipeline.run(image_path, prompt, output_path)
    return result


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        output_path = sys.argv[2] if len(sys.argv) > 2 else "final_output.png"
        prompt = sys.argv[3] if len(sys.argv) > 3 else None
        main(image_path, output_path, prompt)
    else:
        print("Usage: python pipeline.py <image_path> [output_path] [prompt]")