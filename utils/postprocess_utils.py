import cv2
import numpy as np


def threshold_heatmap(
    heatmap,
    threshold=180
):

    binary_mask = np.zeros_like(
        heatmap,
        dtype=np.uint8
    )

    binary_mask[
        heatmap >= threshold
    ] = 255

    return binary_mask


def clean_mask(
    binary_mask
):

    kernel = np.ones(
        (5, 5),
        np.uint8
    )

    cleaned_mask = cv2.morphologyEx(
        binary_mask,
        cv2.MORPH_OPEN,
        kernel
    )

    cleaned_mask = cv2.morphologyEx(
        cleaned_mask,
        cv2.MORPH_CLOSE,
        kernel
    )

    return cleaned_mask


def detect_defects(
    image,
    cleaned_mask,
    min_area=100
):

    output_image = image.copy()

    contours, _ = cv2.findContours(
        cleaned_mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    for contour in contours:

        area = cv2.contourArea(
            contour
        )

        if area < min_area:
            continue

        x, y, w, h = cv2.boundingRect(
            contour
        )

        cv2.rectangle(
            output_image,
            (x, y),
            (x + w, y + h),
            (255, 0, 0),
            2
        )

    return output_image