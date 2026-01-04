import torch
import torch.nn as nn

class WastePredictor(nn.Module):
    def __init__(self, input_dim=5, output_dim=8):
        super(WastePredictor, self).__init__()
        
        # Input normalization statistics (registered as buffers to be saved with state_dict)
        self.register_buffer('input_mean', torch.zeros(input_dim))
        self.register_buffer('input_std', torch.ones(input_dim))
        
        self.network = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, output_dim),
            nn.ReLU() # Enforce non-negativity
        )

    def forward(self, x):
        # Apply normalization
        x_norm = (x - self.input_mean) / (self.input_std + 1e-6)
        return self.network(x_norm)
