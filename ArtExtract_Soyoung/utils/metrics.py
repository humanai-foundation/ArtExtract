import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from pytorch_msssim import ms_ssim
from torchmetrics.image import StructuralSimilarityIndexMeasure as ssim

#Loss Metrics
class MS_SSIMLoss(nn.Module):
    def __init__(self):
        super(MS_SSIMLoss, self).__init__()

    def forward(self, output, target):
        loss = 1 - ms_ssim(output, target, data_range=1.0, size_average=True)
        return loss

#Evaluation Metrics
class EvalMetrics(nn.Module):
    def __init__(self, feature_extractor, size_average=True):
        super(EvalMetrics, self).__init__()
        self.size_average = size_average
        self.feature_extractor = feature_extractor
        self.loss_fn = nn.MSELoss()
        self.ssim_metric = ssim(data_range=1.0)

    def psnr(self, output, target):
        if output.shape != target.shape:
            raise ValueError(
                f"Shape mismatch: output has shape {output.shape}, target has shape {target.shape}"
            )
        # Compute MSE per channel
        mse_per_channel = torch.mean((target - output) ** 2, dim=[0, 2, 3])  # MSE per channel
        
        # Handle cases where MSE is zero (perfect match), set PSNR to infinity
        max_pixel = 1.0
       
        psnr_value_per_channel = 10 * torch.log10(max_pixel / mse_per_channel)
        # Set PSNR to infinity where MSE is zero
        psnr_value_per_channel[mse_per_channel == 0] = float('inf')  

        # Average across channels
        psnr_value = psnr_value_per_channel.mean()  
        return psnr_value

    def ssim(self, output, target):
        # Ensure SSIM is computed per channel
        ssim_value_per_channel = []
        for c in range(output.size(1)):  # Iterate over channels
            ssim_value = self.ssim_metric(output[:, c:c+1, :, :], target[:, c:c+1, :, :])
            ssim_value_per_channel.append(ssim_value.mean().item())
        
        ssim_value_per_channel = torch.tensor(ssim_value_per_channel)
        # Average SSIM values across channels and then across batches
        ssim_value = ssim_value_per_channel.mean()
        return ssim_value

    def lpips(self, output, target):
        # Extract features
        output_features = self.feature_extractor(output)
        target_features = self.feature_extractor(target)
        
        # Compute LPIPS loss per channel
        lpips_per_channel = []
        for c in range(output.size(1)):  # Iterate over channels
            output_features_c = output_features[:, c:c+1, :, :]
            target_features_c = target_features[:, c:c+1, :, :]
            lpips_value = self.loss_fn(output_features_c, target_features_c).mean().item()
            lpips_per_channel.append(lpips_value)
        
        lpips_per_channel = torch.tensor(lpips_per_channel)
        # Average LPIPS values across channels and then across batches
        lpips_value = lpips_per_channel.mean()
        return lpips_value

    def forward(self, output, target):
        psnr_value = self.psnr(output, target)
        lpips_value = self.lpips(output, target)
        ssim_value = self.ssim(output, target)
        return psnr_value, lpips_value, ssim_value
