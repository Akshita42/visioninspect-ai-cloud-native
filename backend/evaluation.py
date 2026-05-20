import io
import os
import sys
import json
import numpy as np
import cv2
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# Add parent directory to sys.path so we can import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.patch_utils import extract_overlapping_patches
from utils.embedding_utils import get_patch_embeddings
from utils.anomaly_utils import compute_anomaly_scores
from utils.visualization_utils import generate_heatmap
from utils.postprocess_utils import create_binary_mask, clean_mask

def main():
    print("VisionInspect AI — Dataset Evaluation Tool")
    print("=========================================")
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    # Load Model
    print("Loading CLIP model...")
    try:
        model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        print("CLIP model and processor loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    # Define paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_dir = os.path.join(base_dir, "data", "raw", "mvtec_anomaly_detection", "bottle")
    
    ref_image_path = os.path.join(dataset_dir, "train", "good", "000.png")
    test_dir = os.path.join(dataset_dir, "test")
    
    if not os.path.exists(ref_image_path):
        print(f"Error: Reference image not found at {ref_image_path}")
        return
        
    print(f"Using baseline reference image: {ref_image_path}")
    
    # Load reference image and compute embeddings once
    ref_pil = Image.open(ref_image_path).convert("RGB")
    ref_resized = ref_pil.resize((512, 512), Image.Resampling.LANCZOS)
    ref_np = np.array(ref_resized)
    ref_patches, _ = extract_overlapping_patches(ref_np, patch_size=64, stride=64)
    ref_embeddings = get_patch_embeddings(ref_patches, model, processor, device=device)
    
    categories = ["good", "broken_large", "broken_small", "contamination"]
    samples = []
    
    print("\nRunning evaluations on MVTec bottle dataset...")
    
    # Track statistics
    total_count = 0
    tp = 0 # True Positives (Anomaly classified as Anomaly)
    fp = 0 # False Positives (Normal classified as Anomaly)
    tn = 0 # True Negatives (Normal classified as Normal)
    fn = 0 # False Negatives (Anomaly classified as Normal)
    
    for category in categories:
        cat_dir = os.path.join(test_dir, category)
        if not os.path.exists(cat_dir):
            print(f"Warning: category directory {cat_dir} does not exist.")
            continue
            
        # Get sorted images to keep order deterministic
        img_names = sorted([f for f in os.listdir(cat_dir) if f.endswith(".png")])
        print(f"  Category: '{category}' - found {len(img_names)} images.")
        
        actual_label = "normal" if category == "good" else "anomaly"
        
        for name in img_names:
            img_path = os.path.join(cat_dir, name)
            
            # Load test image
            test_pil = Image.open(img_path).convert("RGB")
            test_resized = test_pil.resize((512, 512), Image.Resampling.LANCZOS)
            test_np = np.array(test_resized)
            
            # Extract patches and run embeddings
            test_patches, positions = extract_overlapping_patches(test_np, patch_size=64, stride=64)
            test_embeddings = get_patch_embeddings(test_patches, model, processor, device=device)
            
            # Similarity math
            anomaly_scores = compute_anomaly_scores(test_embeddings, ref_embeddings)
            raw_similarities = torch.nn.functional.cosine_similarity(test_embeddings, ref_embeddings, dim=1).cpu().numpy()
            mean_sim = float(np.mean(raw_similarities))
            min_sim = float(np.min(raw_similarities))
            max_sim = float(np.max(raw_similarities))
            
            # Heatmap & Contours
            heatmap = generate_heatmap(anomaly_scores, positions, test_np.shape, patch_size=64)
            is_nominal = (mean_sim >= 0.985 and min_sim >= 0.95) or (np.max(heatmap) == 0)
            
            detected_regions = []
            if not is_nominal:
                binary_mask = create_binary_mask(heatmap, threshold=180)
                cleaned_mask = clean_mask(binary_mask)
                
                if np.max(heatmap) >= 15:
                    contours, _ = cv2.findContours(cleaned_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    for contour in contours:
                        area = cv2.contourArea(contour)
                        if area >= 600:
                            x, y, w, h = cv2.boundingRect(contour)
                            detected_regions.append({
                                "area_px": int(area)
                            })
            
            # Decision
            has_anomalies = (mean_sim < 0.985 or min_sim < 0.95) and (len(detected_regions) > 0)
            pred_label = "anomaly" if has_anomalies else "normal"
            
            # Anomaly Score computation
            if len(detected_regions) > 0:
                anomaly_score = float((1.0 - mean_sim) * 0.3 + (1.0 - min_sim) * 0.7)
                anomaly_score = max(0.0, min(1.0, anomaly_score))
            else:
                anomaly_score = float(max(0.0, (1.0 - mean_sim) * 0.1))
                
            # Calibrate severity status
            if anomaly_score < 0.12:
                severity = "STRUCTURE VERIFIED"
            elif anomaly_score < 0.28:
                severity = "MINOR VISUAL VARIATION"
            elif anomaly_score < 0.50:
                severity = "MODERATE ANOMALY"
            else:
                severity = "SEVERE ANOMALY"
                
            # Compare with ground truth
            is_correct = (pred_label == actual_label)
            
            if actual_label == "anomaly":
                if pred_label == "anomaly":
                    tp += 1
                else:
                    fn += 1
            else: # actual_label == "normal"
                if pred_label == "anomaly":
                    fp += 1
                else:
                    tn += 1
                    
            total_count += 1
            
            samples.append({
                "filename": name,
                "category": category,
                "actual": actual_label,
                "predicted": pred_label,
                "is_correct": is_correct,
                "anomaly_score": anomaly_score,
                "severity": severity,
                "mean_similarity": mean_sim,
                "min_similarity": min_sim,
                "regions_detected": len(detected_regions)
            })
            
            print(f"    Image: {category}/{name} | Score: {anomaly_score:.3f} | Severity: {severity} | Correct: {is_correct}")

    # Compute final metrics
    correct_predictions = tp + tn
    accuracy = correct_predictions / total_count if total_count > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1_score = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0

    results_summary = {
        "metrics": {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1_score),
            "total_samples": total_count,
            "correct_predictions": correct_predictions,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp,
            "true_negatives": tn
        },
        "samples": samples
    }
    
    # Save results to JSON
    json_path = os.path.join(os.path.dirname(__file__), "evaluation_results.json")
    with open(json_path, "w") as f:
        json.dump(results_summary, f, indent=2)
        
    # Write text report
    report_path = os.path.join(os.path.dirname(__file__), "evaluation_report.txt")
    report_text = f"""VisionInspect AI Evaluation Summary

Total Images: {total_count}
Correct Predictions: {correct_predictions}
Accuracy: {accuracy*100:.1f}%
Precision: {precision*100:.1f}%
Recall: {recall*100:.1f}%
F1 Score: {f1_score*100:.1f}%

False Positives: {fp}
False Negatives: {fn}
True Positives: {tp}
True Negatives: {tn}
"""
    with open(report_path, "w") as f:
        f.write(report_text)
        
    # Print summary to terminal
    print("\n" + "="*40)
    print("VisionInspect AI Evaluation Summary")
    print("="*40)
    print(f"Total Images: {total_count}")
    print(f"Correct Predictions: {correct_predictions}")
    print(f"Accuracy: {accuracy*100:.1f}%")
    print(f"Precision: {precision*100:.1f}%")
    print(f"Recall: {recall*100:.1f}%")
    print(f"F1 Score: {f1_score*100:.1f}%")
    print("-"*40)
    print(f"False Positives: {fp}")
    print(f"False Negatives: {fn}")
    print("="*40)
    print(f"Saved evaluation files in:\n - JSON: {json_path}\n - TXT: {report_path}\n")

if __name__ == "__main__":
    main()
