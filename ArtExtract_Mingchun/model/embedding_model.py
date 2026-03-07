import torch
import torch.nn as nn
from torch_geometric.utils import dropout_edge
from torch_geometric.nn import GATConv, global_mean_pool, global_max_pool
from torch_geometric.nn import GlobalAttention

class GATBackbone(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels, heads=4, dropout=0.1):
        super(GATBackbone, self).__init__()
        self.conv1 = GATConv(in_channels, hidden_channels, heads=heads, concat=True)
        self.conv2 = GATConv(hidden_channels * heads, out_channels, heads=heads, concat=True)
        self.conv3 = GATConv(out_channels * heads, out_channels, heads=heads, concat=False)

        self.lrelu = nn.LeakyReLU()
        self.dropout = nn.Dropout(dropout)

        self.norm1 = nn.LayerNorm(hidden_channels * heads)
        self.norm2 = nn.LayerNorm(out_channels * heads)
        self.norm3 = nn.LayerNorm(out_channels)

        # Attention pooling
        self.att_pool = GlobalAttention(
            gate_nn=nn.Sequential(
                nn.Linear(out_channels, 1)
            )
        )

    def forward(self, data):
        x, edge_index, batch = data.x, data.edge_index, data.batch
        # Edge dropout for regularization
        edge_index, _ = dropout_edge(edge_index, p=0.1, training=self.training)

        # ---- Layer 1 ----
        h = self.conv1(x, edge_index)
        h = self.lrelu(self.norm1(h))
        h = self.dropout(h)
        x = h

        # ---- Layer 2 ----
        h = self.conv2(x, edge_index)
        h = self.lrelu(self.norm2(h))
        h = self.dropout(h)
        x = x + h if x.shape == h.shape else h  # residual connection

        # ---- Layer 3 ----
        h = self.conv3(x, edge_index)
        h = self.lrelu(self.norm3(h))
        h = self.dropout(h)
        x = x + h if x.shape == h.shape else h

        g_mean = global_mean_pool(x, batch)
        g_max = global_max_pool(x, batch)

        # attention-based pooling
        g_att = self.att_pool(x, batch)

        # combine multiple graph representations
        g = torch.cat([g_mean, g_max, g_att], dim=1)
        
        return g, x, edge_index

class GATSiameseNetworkEncoder(nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels, heads=1):
        super(GATSiameseNetworkEncoder, self).__init__()
        self.gat = GATBackbone(in_channels, hidden_channels, out_channels, heads)
        in_proj = 3 * out_channels
        self.proj = nn.Sequential(
            nn.Linear(in_proj, hidden_channels),
            nn.ReLU(),
            nn.Linear(hidden_channels, out_channels)
        )

    def forward(self, data):
        g, *_ = self.gat(data)  # [B, 2*outchannels]   
        z = self.proj(g) # [B, proj_dim]
        z = torch.nn.functional.normalize(z, p=2, dim=-1) # L2 normalization

        return z