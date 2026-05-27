import cv2
import numpy as np


def create_binary_mask(
    heatmap,
    threshold=180
):

    _, binary_mask = cv2.threshold(
        heatmap,
        threshold,
        255,
        cv2.THRESH_BINARY
    )

    return binary_mask


def clean_mask(
    binary_mask,
    kernel_size=5
):

    kernel = np.ones(
        (kernel_size, kernel_size),
        np.uint8
    )

    cleaned = cv2.morphologyEx(
        binary_mask,
        cv2.MORPH_OPEN,
        kernel
    )

    cleaned = cv2.morphologyEx(
        cleaned,
        cv2.MORPH_CLOSE,
        kernel
    )

    return cleaned


def detect_defects(
    image,
    cleaned_mask,
    min_area=400
):

    contours, _ = cv2.findContours(
        cleaned_mask,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    output = image.copy()

    for contour in contours:

        area = cv2.contourArea(contour)

        if area < min_area:
            continue

        x, y, w, h = cv2.boundingRect(contour)

        cv2.rectangle(
            output,
            (x, y),
            (x + w, y + h),
            (255, 0, 0),
            2
        )

    return output