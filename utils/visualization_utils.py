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
        ] += score

        count_map[
            y:y + patch_size,
            x:x + patch_size
        ] += 1

    count_map[
        count_map == 0
    ] = 1

    heatmap = heatmap / count_map

    heatmap = cv2.GaussianBlur(
        heatmap,
        (31, 31),
        0
    )

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

    heatmap_uint8 = np.uint8(
        255 * heatmap
    )

    heatmap_colored = cv2.applyColorMap(
        heatmap_uint8,
        cv2.COLORMAP_JET
    )

    heatmap_colored = cv2.cvtColor(
        heatmap_colored,
        cv2.COLOR_BGR2RGB
    )

    overlay = cv2.addWeighted(
        image,
        0.6,
        heatmap_colored,
        0.4,
        0
    )

    return overlay