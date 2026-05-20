import torch
import numpy as np
import cv2

from PIL import Image


device = "cuda" if torch.cuda.is_available() else "cpu"


def get_patch_embeddings(
    patches,
    model,
    processor,
    batch_size=64,
    device="cpu"
):

    all_features = []

    for i in range(0, len(patches), batch_size):

        batch_patches = patches[i:i + batch_size]

        patch_images = []

        for patch in batch_patches:

            patch = patch.astype(np.uint8)

            if len(patch.shape) == 2:

                patch = cv2.cvtColor(
                    patch,
                    cv2.COLOR_GRAY2RGB
                )

            patch_images.append(
                Image.fromarray(patch)
            )

        inputs = processor(
            images=patch_images,
            return_tensors="pt",
            padding=True
        )

        inputs = {
            key: value.to(device)
            for key, value in inputs.items()
        }

        with torch.no_grad():

            outputs = model.vision_model(
                pixel_values=inputs["pixel_values"]
            )

            batch_features = outputs.pooler_output

        batch_features = batch_features / torch.norm(
            batch_features,
            dim=-1,
            keepdim=True
        )

        all_features.append(
            batch_features.cpu()
        )

    return torch.cat(all_features, dim=0)