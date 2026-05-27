import numpy as np

def extract_overlapping_patches(
    image,
    patch_size=64,
    stride=32
):

    patches = []
    positions = []

    h, w = image.shape[:2]

    for y in range(0, h - patch_size + 1, stride):

        for x in range(0, w - patch_size + 1, stride):

            patch = image[
                y:y + patch_size,
                x:x + patch_size
            ]

            patches.append(patch)

            positions.append((x, y))

    return patches, positions