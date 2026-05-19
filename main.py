from transformers import CLIPProcessor, CLIPModel
from PIL import Image
from utils.postprocess_utils import (
    threshold_heatmap,
    clean_mask,
    detect_defects
)

import torch
import numpy as np
import cv2
import os

from utils.patch_utils import extract_overlapping_patches

from utils.embedding_utils import get_patch_embeddings

from utils.anomaly_utils import compute_anomaly_scores

from utils.visualization_utils import (
    generate_heatmap,
    create_overlay
)


# DEVICE SETUP

device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Using device: {device}")


# LOAD MODEL

model = CLIPModel.from_pretrained(
    "openai/clip-vit-base-patch32"
)

processor = CLIPProcessor.from_pretrained(
    "openai/clip-vit-base-patch32"
)

model = model.to(device)

print("CLIP model loaded successfully.")


# LOAD TEST IMAGE

test_image_path = (
    "data/raw/mvtec_anomaly_detection/"
    "bottle/test/broken_large/000.png"
)

test_image = Image.open(
    test_image_path
).convert("RGB")

test_image_np = np.array(test_image)

print("Test image loaded.")


# EXTRACT TEST PATCHES

patches, positions = extract_overlapping_patches(
    test_image_np,
    patch_size=64,
    stride=64
)

print(f"Total test patches: {len(patches)}")


# GENERATE TEST EMBEDDINGS

test_embeddings = get_patch_embeddings(
    patches,
    model,
    processor
)

print("Test embeddings generated.")


# LOAD REFERENCE IMAGES

reference_paths = [

    "data/raw/mvtec_anomaly_detection/"
    "bottle/train/good/000.png",

    "data/raw/mvtec_anomaly_detection/"
    "bottle/train/good/001.png",

    "data/raw/mvtec_anomaly_detection/"
    "bottle/train/good/002.png",

    "data/raw/mvtec_anomaly_detection/"
    "bottle/train/good/003.png"
]


all_reference_embeddings = []


for path in reference_paths:

    ref_image = Image.open(
        path
    ).convert("RGB")

    ref_np = np.array(ref_image)

    ref_patches, _ = extract_overlapping_patches(
        ref_np,
        patch_size=64,
        stride=64
    )

    ref_embeddings = get_patch_embeddings(
        ref_patches,
        model,
        processor
    )

    all_reference_embeddings.append(
        ref_embeddings
    )


print("Reference embeddings generated.")


# COMPUTE MEAN REFERENCE EMBEDDING

reference_stack = torch.stack(
    all_reference_embeddings
)

mean_reference_embedding = torch.mean(
    reference_stack,
    dim=0
)

print("Mean reference embedding created.")


# COMPUTE ANOMALY SCORES

anomaly_scores = compute_anomaly_scores(
    test_embeddings,
    mean_reference_embedding
)

print("Anomaly scores computed.")


# GENERATE HEATMAP

heatmap = generate_heatmap(
    anomaly_scores,
    positions,
    test_image_np.shape,
    patch_size=64
)

print("Heatmap generated.")

binary_mask = threshold_heatmap(
    heatmap,
    threshold=180
)

print("Binary mask created.")

cleaned_mask = clean_mask(
    binary_mask
)

print("Mask cleaned.")

defect_output = detect_defects(
    test_image_np,
    cleaned_mask
)

print("Defects detected.")


# CREATE OVERLAY

overlay = create_overlay(
    test_image_np,
    heatmap
)

print("Overlay created.")


# SAVE OUTPUTS

os.makedirs(
    "outputs",
    exist_ok=True
)

heatmap_path = "outputs/heatmap.png"

overlay_path = "outputs/overlay.png"

defect_output_path = "outputs/defect_detection.png"


cv2.imwrite(
    heatmap_path,
    np.uint8(255 * heatmap)
)

cv2.imwrite(
    overlay_path,
    cv2.cvtColor(
        overlay,
        cv2.COLOR_RGB2BGR
    )
)

cv2.imwrite(
    defect_output_path,
    cv2.cvtColor(
        defect_output,
        cv2.COLOR_RGB2BGR
    )
)


print(f"Heatmap saved at: {heatmap_path}")

print(f"Overlay saved at: {overlay_path}")

print(
    f"Defect detection saved at: {defect_output_path}"
)


print("Pipeline execution completed successfully.")
