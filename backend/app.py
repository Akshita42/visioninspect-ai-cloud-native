import io
import base64
import os
import sys
import numpy as np
import cv2
import torch
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# Add parent directory to sys.path so we can import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.patch_utils import extract_overlapping_patches
from utils.embedding_utils import get_patch_embeddings
from utils.anomaly_utils import compute_anomaly_scores
from utils.visualization_utils import generate_heatmap, create_overlay
from utils.postprocess_utils import create_binary_mask, clean_mask, detect_defects

# Initialize FastAPI App
app = FastAPI(
    title="VisionInspect AI",
    description="CLIP-Based Reference Anomaly Detection Backend API"
)

# Enable CORS for frontend API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
device = "cuda" if torch.cuda.is_available() else "cpu"
model = None
processor = None

@app.on_event("startup")
def load_clip_model():
    global model, processor
    print(f"Loading CLIP model on device: {device}...")
    try:
        model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        print("CLIP model and processor loaded successfully.")
    except Exception as e:
        print(f"Error loading CLIP model: {e}")
        raise e

def encode_img_to_base64(img_np):
    _, buffer = cv2.imencode('.png', img_np)
    img_b64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{img_b64}"

@app.post("/analyze")
async def analyze_images(
    reference: UploadFile = File(...),
    test: UploadFile = File(...)
):
    global model, processor
    if model is None or processor is None:
        raise HTTPException(status_code=503, detail="Model is still loading or failed to initialize.")

    try:
        # Read file bytes
        ref_bytes = await reference.read()
        test_bytes = await test.read()

        # Load as PIL Images
        ref_pil = Image.open(io.BytesIO(ref_bytes)).convert("RGB")
        test_pil = Image.open(io.BytesIO(test_bytes)).convert("RGB")

        # Resize to standard size (512x512) for patch-to-patch mapping
        ref_resized = ref_pil.resize((512, 512), Image.Resampling.LANCZOS)
        test_resized = test_pil.resize((512, 512), Image.Resampling.LANCZOS)

        # Convert to numpy arrays
        ref_np = np.array(ref_resized)
        test_np = np.array(test_resized)

        # Extract patches (using stride 64 as in main.py)
        ref_patches, _ = extract_overlapping_patches(ref_np, patch_size=64, stride=64)
        test_patches, positions = extract_overlapping_patches(test_np, patch_size=64, stride=64)

        if not ref_patches or not test_patches:
            raise HTTPException(status_code=400, detail="Images are too small to extract patches.")

        # Generate embeddings
        ref_embeddings = get_patch_embeddings(ref_patches, model, processor, device=device)
        test_embeddings = get_patch_embeddings(test_patches, model, processor, device=device)

        # Compute anomaly scores (patch similarity subtraction)
        # test_embeddings: (N, 512), ref_embeddings: (N, 512)
        anomaly_scores = compute_anomaly_scores(test_embeddings, ref_embeddings)

        # Compute raw similarity metrics for reporting
        raw_similarities = torch.nn.functional.cosine_similarity(test_embeddings, ref_embeddings, dim=1).cpu().numpy()
        mean_sim = float(np.mean(raw_similarities))
        min_sim = float(np.min(raw_similarities))
        max_sim = float(np.max(raw_similarities))

        # Generate anomaly visual outputs
        heatmap = generate_heatmap(anomaly_scores, positions, test_np.shape, patch_size=64)
        binary_mask = create_binary_mask(heatmap, threshold=180)
        cleaned_mask = clean_mask(binary_mask)
        defect_detection = detect_defects(test_np, cleaned_mask)
        overlay = create_overlay(test_np, heatmap)

        # Find contours to calculate detected regions in percentage coordinates
        contours, _ = cv2.findContours(cleaned_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        detected_regions = []
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if area < 400: # min_area limit
                continue
            x, y, w, h = cv2.boundingRect(contour)
            detected_regions.append({
                "id": i,
                "x": float(x) / 512.0 * 100,
                "y": float(y) / 512.0 * 100,
                "width": float(w) / 512.0 * 100,
                "height": float(h) / 512.0 * 100,
                "area_px": int(area)
            })

        # Calculate a realistic anomaly score (percentage of anomalous surface area)
        anomaly_pixel_ratio = float(np.sum(cleaned_mask > 0) / cleaned_mask.size)
        # Scale score dynamically based on defect count and size
        anomaly_score = min(1.0, float(1.0 - mean_sim + len(detected_regions) * 0.1))

        # Create localized explanation based on real patch similarities
        if len(detected_regions) > 0:
            status = "POSSIBLE ANOMALY DETECTED"
            explanation = (
                f"The patch comparison detected visual inconsistencies compared to the reference image in "
                f"{len(detected_regions)} localized region(s). The system flagged anomalous surface features "
                f"with a maximum localized deviation score of {(1.0 - min_sim):.3f} and an average patch "
                f"similarity index of {mean_sim:.3f}. These regions correspond to unusual surface patterns, "
                f"deformations, or texture variations."
            )
        else:
            status = "NOMINAL STRUCTURE PASSED"
            explanation = (
                f"No significant visual anomalies were detected. All patches conform to the reference image "
                f"within acceptable statistical thresholds. The average patch similarity index is {mean_sim:.3f} "
                f"(minimum local similarity: {min_sim:.3f}), indicating a highly similar surface configuration."
            )

        # Convert images to base64 Data URLs
        ref_b64 = encode_img_to_base64(cv2.cvtColor(ref_np, cv2.COLOR_RGB2BGR))
        test_b64 = encode_img_to_base64(cv2.cvtColor(test_np, cv2.COLOR_RGB2BGR))
        heatmap_b64 = encode_img_to_base64(cv2.cvtColor(heatmap, cv2.COLOR_GRAY2BGR))
        overlay_b64 = encode_img_to_base64(cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
        defect_b64 = encode_img_to_base64(cv2.cvtColor(defect_detection, cv2.COLOR_RGB2BGR))

        return {
            "status": status,
            "anomaly_score": anomaly_score,
            "detected_regions": detected_regions,
            "explanation": explanation,
            "reference_image": ref_b64,
            "test_image": test_b64,
            "heatmap": heatmap_b64,
            "overlay": overlay_b64,
            "defect_detection": defect_b64,
            "metrics": {
                "mean_similarity": mean_sim,
                "min_similarity": min_sim,
                "max_similarity": max_sim,
                "anomaly_pixel_ratio": anomaly_pixel_ratio
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

# Serve static assets
frontend_dist_path = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
)
assets_path = os.path.join(frontend_dist_path, "assets")

if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
else:
    print(f"Warning: Static assets path not found at {assets_path}. Run 'npm run build' first.")

# Catch-all route to serve the React frontend index.html for all other paths
@app.get("/{catchall:path}")
async def serve_frontend(catchall: str):
    index_file = os.path.join(frontend_dist_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    raise HTTPException(
        status_code=404, 
        detail=f"Frontend build index.html not found at {index_file}. Run 'npm run build' first."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=False)
