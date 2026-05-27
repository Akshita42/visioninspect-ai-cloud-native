import torch
import torch.nn.functional as F
import numpy as np


def compute_anomaly_scores(
    test_embeddings,
    reference_embeddings
):

    similarities = F.cosine_similarity(
        test_embeddings,
        reference_embeddings,
        dim=1
    )

    raw_scores = 1 - similarities.cpu().numpy()

    # If the maximum raw cosine distance deviation is below the noise threshold (0.015),
    # suppress all scores to zero to prevent floating-point noise amplification.
    if raw_scores.max() < 0.015:
        return np.zeros_like(raw_scores)

    anomaly_scores = (
        raw_scores - raw_scores.min()
    ) / (
        raw_scores.max()
        - raw_scores.min()
        + 1e-8
    )

    anomaly_scores = anomaly_scores ** 3

    return anomaly_scores