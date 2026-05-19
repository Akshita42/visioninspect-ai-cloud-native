import cv2
import numpy as np


def generate_heatmap(
    anomaly_scores,
    positions,
    image_shape,
    patch_size=64
):

    heatmap = np.zeros(
        image_shape[:2],
        dtype=np.float32
    )

    count_map = np.zeros(
        image_shape[:2],
        dtype=np.float32
    )

    for score, (x, y) in zip(
        anomaly_scores,
        positions
    ):

        heatmap[
            y:y + patch_size,
            x:x + patch_size
        ] += float(score)

        count_map[
            y:y + patch_size,
            x:x + patch_size
        ] += 1

    count_map[
        count_map == 0
    ] = 1

    # Average overlapping patches
    heatmap = heatmap / count_map

    # Normalize before blur
    heatmap = cv2.normalize(
        heatmap,
        None,
        0,
        1,
        cv2.NORM_MINMAX
    )

    # Mild smoothing (NOT overly blurry)
    heatmap = cv2.GaussianBlur(
        heatmap,
        (9, 9),
        0
    )

    # Increase contrast
    heatmap = np.power(
        heatmap,
        1.5
    )

    # Convert to 0-255
    heatmap = cv2.normalize(
        heatmap,
        None,
        0,
        255,
        cv2.NORM_MINMAX
    )

    heatmap = heatmap.astype(
        np.uint8
    )

    return heatmap


def create_overlay(
    image,
    heatmap
):

    # Apply color map
    heatmap_colored = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET
    )

    # Convert BGR -> RGB
    heatmap_colored = cv2.cvtColor(
        heatmap_colored,
        cv2.COLOR_BGR2RGB
    )

    # Blend overlay
    overlay = cv2.addWeighted(
        image,
        0.72,
        heatmap_colored,
        0.28,
        0
    )

    return overlay