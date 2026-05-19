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

    anomaly_scores = (
        1 - similarities.cpu().numpy()
    )

    anomaly_scores = (
        anomaly_scores - anomaly_scores.min()
    ) / (
        anomaly_scores.max()
        - anomaly_scores.min()
        + 1e-8
    )

    anomaly_scores = anomaly_scores ** 3

    return anomaly_scores