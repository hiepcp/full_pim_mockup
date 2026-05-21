# Overview: Quy Trình & Công Cụ AI Tạo / Render Hình Ảnh

> Landscape các workflow, thư viện open-source và API thương mại để tạo và render hình sản phẩm tự động. Tài liệu nghiên cứu, không gắn với kiến trúc hay service cụ thể.

## TL;DR

- **Quy trình**: T2I, I2I, inpainting, ControlNet, IP-Adapter, LoRA, BG removal, upscale, 3D-to-image (Blender), image-to-3D, image-to-video.
- **Open-source**: Stable Diffusion (SD 1.5/SDXL/SD3.5), FLUX.1, ComfyUI, Diffusers, ControlNet, IP-Adapter, SAM 2, BRIA RMBG, Real-ESRGAN, Blender, TripoSR, Hunyuan3D-2.
- **API thương mại**: OpenAI gpt-image-1, Google Imagen, Stability AI, Black Forest Labs FLUX, Adobe Firefly, Recraft, Photoroom, Bria AI, Replicate, fal.ai.
- **Đặc thù sản phẩm**: variant đổi màu vải, packshot từ CAD, lifestyle scene, upscale catalogue print 300dpi.

---

## 1. Các Quy Trình Tạo Hình Điển Hình

| Quy trình | Mô tả | Use case sản phẩm |
|-----------|-------|---------------------|
| **Text-to-Image (T2I)** | Sinh ảnh từ prompt mô tả | Concept moodboard, lifestyle scene |
| **Image-to-Image (I2I)** | Biến đổi ảnh nguồn | Re-style, đổi tone, retouching |
| **Inpainting** | Sửa vùng được mask | Thay vải sofa, đổi màu ghế giữ form |
| **Outpainting** | Mở rộng canvas | Mở rộng background cho banner |
| **ControlNet conditioning** | Giữ structure (pose/depth/edge/segment) khi gen | Variant đổi màu nhưng giữ silhouette |
| **IP-Adapter / Reference** | Chuyển style/identity từ ảnh tham chiếu | Giữ nhận diện thương hiệu xuyên series |
| **LoRA / fine-tune nhẹ** | Train ~5-50 ảnh để giữ identity | Huấn luyện riêng cho mỗi range nội thất |
| **Background removal** | Tách object khỏi nền | Chuẩn hóa packshot trắng |
| **Background replacement** | Ghép vào nền mới | Lifestyle composite |
| **Upscale / restoration** | Tăng phân giải, khử nhiễu | Catalogue print ≥300 dpi |
| **3D-to-Image** | Render headless từ GLB/FBX | Packshot đa góc từ CAD nội thất |
| **Image-to-3D** | Sinh mesh từ ảnh 2D | Prototype 3D từ ảnh studio |
| **Relighting** | Đổi ánh sáng giữ object | Đồng bộ lighting giữa packshot + scene |
| **Image-to-Video** | Sinh video xoay/lia camera | Reel TikTok/social từ ảnh tĩnh |
| **Material / PBR generation** | Sinh texture vật liệu | Swatch vải, gỗ, da cho 3D viewer |

---

## 2. Thư Viện & Framework Open Source

### 2.1 Diffusion models & runners

| Tên | Mô tả | License |
|-----|-------|---------|
| **Stable Diffusion 1.5 / SDXL / 3.5** (Stability AI) | Họ model phổ biến nhất | CreativeML Open RAIL++ (SDXL); SD3.5 Community License (free dưới ngưỡng doanh thu) |
| **FLUX.1** (Black Forest Labs) | SOTA open hiện nay; biến thể `schnell`, `dev`, `pro` | `schnell` Apache-2.0; `dev` non-commercial; `pro` qua API |
| **Diffusers** (Hugging Face) | Python lib chạy phần lớn diffusion model | Apache-2.0 |
| **ComfyUI** | Pipeline node-based, linh hoạt nhất | GPL-3.0 |
| **Automatic1111 WebUI** | Gradio UI + plugin phong phú | AGPL-3.0 |
| **Forge / reForge** | A1111 fork tối ưu hiệu năng | AGPL-3.0 |
| **InvokeAI** | UI pro-grade, có unified canvas | Apache-2.0 |
| **SD.Next** (vladmandic) | Runner tích hợp đa backend | AGPL-3.0 |

### 2.2 Conditioning & adapter

| Tên | Vai trò |
|-----|---------|
| **ControlNet** (lllyasviel) | Guide bằng canny, depth, pose, segmentation, normal map |
| **T2I-Adapter** (Tencent) | Nhẹ hơn ControlNet, ít VRAM |
| **IP-Adapter** (Tencent) | Reference image cho style/identity |
| **InstantID / PhotoMaker** (Tencent) | Bảo toàn identity (chân dung) |
| **AnyDoor** | Object teleportation — ghép vật vào scene |
| **IC-Light** (lllyasviel) | Relighting nhất quán |

### 2.3 Background / segmentation

| Tên | Đặc điểm |
|-----|----------|
| **rembg** | Wrapper U2-Net / ISNet, dễ dùng |
| **BRIA RMBG-2.0** | SOTA open weight cho object cutout |
| **Segment Anything (SAM 2)** (Meta) | Segmentation đa năng prompt-based |
| **CarveKit** | Pipeline cutout chất lượng cao |
| **MODNet** | Matting chân dung |

### 2.4 Upscale & restoration

| Tên | Đặc điểm |
|-----|----------|
| **Real-ESRGAN** (Tencent) | General upscaler 4x phổ biến |
| **GFPGAN / CodeFormer** | Khôi phục mặt người |
| **SwinIR** | Restoration SOTA |
| **APISR** | Tối ưu cho ảnh nét vẽ / anime |
| **Stable Diffusion x4 upscaler** | Diffusion-based upscale |

### 2.5 3D rendering

| Tên | Vai trò |
|-----|---------|
| **Blender + Cycles/Eevee** | Render industrial, Python API mạnh |
| **BlenderProc** (DLR) | Pipeline synthetic data automation |
| **PyTorch3D** (Meta) | Differentiable rendering |
| **Mitsuba 3** | Inverse rendering, vật liệu PBR |
| **Open3D / Trimesh / Pyrender** | Utility xử lý mesh & render nhanh |
| **Three.js / Babylon.js** | 3D viewer trên web |
| **Filament** (Google) | PBR realtime |

### 2.6 Image-to-3D

| Tên | Đặc điểm |
|-----|----------|
| **TripoSR** (Stability AI + Tripo) | Single-image-to-mesh trong vài giây |
| **Wonder3D** | Multi-view consistent reconstruction |
| **InstantMesh** | Nhanh, chất lượng cân bằng |
| **Zero123++** | Novel view synthesis |
| **DreamGaussian** | 3D Gaussian Splatting từ ảnh |
| **Hunyuan3D-2** (Tencent) | Mới, chất lượng SOTA open-source |
| **Stable Fast 3D** (Stability AI) | Hậu duệ TripoSR, nhanh hơn |

### 2.7 Video diffusion

| Tên | Đặc điểm |
|-----|----------|
| **Stable Video Diffusion** | Image-to-video 14-25 frame |
| **AnimateDiff** | Plug-in animate cho SD |
| **CogVideoX** (Zhipu) | T2V open-weight |
| **Hunyuan-Video** (Tencent) | T2V SOTA open |
| **LTX-Video** (Lightricks) | Latent video, latency thấp |
| **Mochi-1** (Genmo) | T2V chất lượng cao |

### 2.8 Material & vector

| Tên | Vai trò |
|-----|---------|
| **MaPa / Material Diffusion** | Sinh texture PBR (albedo/normal/roughness) |
| **Vector Magic / VTracer** | Raster-to-vector |
| **DiffSVG / VectorFusion** | Diffusion sinh SVG |

---

## 3. API Thương Mại / Managed

### 3.1 Image generation

| Vendor | Model | Điểm mạnh | License đầu ra |
|--------|-------|-----------|----------------|
| **OpenAI** | gpt-image-2, gpt-image-1.5, gpt-image-1, gpt-image-1-mini | SOTA image gen, prompt-following xuất sắc, render text trong ảnh giỏi, flexible size (lên 4K) | Commercial OK |
| **Google Vertex AI** | Imagen 3, Imagen 4 | Photorealistic, brand-safe | Commercial (theo TOS) |
| **Stability AI Platform** | Stable Image Ultra (SD3.5), Core, Stable Image Control | Self-host được, giá hợp lý | Theo Community License |
| **Black Forest Labs** | FLUX 1.1 Pro, FLUX Kontext (edit) | Edit ảnh giữ context tốt, chất lượng top | Commercial OK |
| **Midjourney** | v6.1, v7 (qua web/Discord; chưa có official REST) | Aesthetic dẫn đầu | Hạn chế redistribution |
| **Ideogram** | v2, v3 | Render text trong ảnh (poster, banner) | Commercial OK |
| **Recraft** | Recraft V3 | Vector + raster + brand kit | Commercial OK |
| **Adobe Firefly** | Firefly Image 3 | Train trên Adobe Stock, IP-safe | Commercial (Adobe TOS) |
| **Leonardo.ai** | Phoenix, Lightning XL | Game asset focus, fine-tune dễ | Theo plan |
| **Bria AI** | Bria 2.3 | Trained-on-licensed-data, hợp pháp doanh nghiệp | Commercial OK |

### 3.2 Multi-model gateway

| Vendor | Đặc điểm |
|--------|----------|
| **Replicate** | REST cho hàng trăm model open, billing per-second, cold start lâu |
| **fal.ai** | Low-latency (websocket), chuyên realtime SDXL/Flux |
| **Runware** | Cost-optimized, batch friendly |
| **Hugging Face Inference API / Endpoints** | Serverless + dedicated GPU |
| **Modal / Banana / Beam** | Serverless GPU tự deploy code |
| **RunPod Serverless / Vast.ai** | GPU thuê theo phút, control cao nhất |
| **Together.ai** | Đa model, tập trung throughput |

### 3.3 Edit / utility API

| Vendor | Chức năng chính |
|--------|------------------|
| **Photoroom API** | Remove BG, generate scene, brand kit |
| **remove.bg** | Tách nền chuyên dụng, ổn định |
| **Cloudinary** | Transform + AI background + upscale, có CDN |
| **imgix** | Transform realtime + ML auto-tag |
| **Clipdrop** (Stability AI) | Suite tools (cleanup, relight, upscale) |
| **Magnific / Krea** | AI upscale & enhance hi-detail |
| **Pixelcut / Erase.bg / Slazzer** | BG removal alternative |
| **Pebblely / Booth.ai** | Sinh lifestyle scene từ packshot (e-commerce) |

### 3.4 3D / Video

| Vendor | Đặc điểm |
|--------|----------|
| **Tripo3D API** | Image-to-3D thương mại từ team TripoSR |
| **Meshy** | Image/text-to-3D + texture, UI thân thiện |
| **Kaedim** | 3D từ phác thảo, chất lượng cao, đắt |
| **Spline AI** | 3D editor + AI assist |
| **Luma Dream Machine + Genie** | Image-to-video + 3D capture |
| **Runway Gen-3 / Gen-4** | Image/text-to-video chất lượng cao |
| **Pika 1.5** | T2V dễ dùng |
| **Kling AI** (Kuaishou) | Video SOTA mở API |
| **Hailuo / MiniMax video** | T2V Trung Quốc, miễn phí ban đầu |

---

## 4. Quy Trình Mẫu Cho Sản Phẩm Nội Thất

### 4.1 Auto-generate variant đổi màu vải

```
Packshot gốc + swatch màu mới
   │
   ├─ Segment object (SAM 2 hoặc BRIA RMBG)
   │     → mask vùng vải
   │
   ├─ Inpaint (SDXL/FLUX) + ControlNet (depth, canny)
   │     + IP-Adapter (swatch reference)
   │     → ảnh đổi màu giữ silhouette
   │
   ├─ Refine: Real-ESRGAN x2
   │
   └─ Output: variant chuẩn hóa
```

### 4.2 3D CAD → packshot đa góc

```
GLB / FBX từ designer
   │
   ├─ Blender headless (Python script)
   │     + HDRi lighting preset
   │     + camera rig 8 góc
   │
   ├─ Composite trên nền trắng / scene
   │
   ├─ (Optional) Pass qua FLUX Kontext
   │     prompt: "studio photo, soft shadow"
   │
   └─ Output: bộ packshot đầy đủ
```

### 4.3 Lifestyle scene từ packshot

```
Packshot trắng nền
   │
   ├─ Tách object (rembg)
   │
   ├─ Method A: Outpainting với FLUX Kontext
   │     prompt: "modern living room, natural light"
   │
   ├─ Method B: AnyDoor teleport vào scene render
   │
   ├─ Relight: IC-Light hài hòa ánh sáng
   │
   ├─ Upscale + watermark + EXIF/C2PA metadata
   │
   └─ Output: ảnh lifestyle social-ready
```

### 4.4 Catalogue print upscaling

```
Ảnh web 1920px
   │
   ├─ Real-ESRGAN x4 (general)
   │     hoặc Magnific (commercial, đẹp hơn)
   │
   ├─ Sharpen + color profile (sRGB → CMYK)
   │
   └─ Output: 300 dpi đủ in A4/A3
```

---

## 5. Tiêu Chí Lựa Chọn

| Tiêu chí | Self-host (open-source) | Managed API |
|----------|-------------------------|-------------|
| Chi phí 10k ảnh/tháng | Thấp (chỉ GPU) | Trung bình → cao |
| Setup time | Cao (GPU, deploy, model weight) | Thấp (REST) |
| Chất lượng SOTA | Phụ thuộc model open hiện có | Thường dẫn đầu |
| Latency | Tự kiểm soát | Phụ thuộc vendor |
| IP-safe / brand-safe | Tự chịu trách nhiệm | Vendor cam kết (Bria, Firefly) |
| Custom (LoRA, ControlNet) | Linh hoạt nhất | Hạn chế |
| Determinism (seed) | Có | Một số vendor có |
| Privacy / dữ liệu nhạy cảm | Không leak | Phụ thuộc DPA |
| Khả năng scale | Phụ thuộc đầu tư GPU | Vendor lo |

### Khuyến nghị bước đầu cho R&D Phase 3

1. **Variant đổi màu nhanh**: `fal.ai` (FLUX dev + ControlNet) cho POC trong tuần.
2. **Tách nền**: `Photoroom API` cho chất lượng, hoặc `rembg` + `BRIA RMBG` self-host khi volume lớn.
3. **3D render packshot**: `Blender headless` trong Docker, không cần AI — kết quả ổn định.
4. **Image-to-3D thử nghiệm**: `TripoSR` self-host hoặc `Meshy` API.
5. **Upscale catalogue**: `Real-ESRGAN` self-host; nếu cần wow factor dùng `Magnific`.
6. **Pipeline production**: chuyển sang `ComfyUI` + GPU thuê (`RunPod`) khi workflow đã ổn định.

---

## 6. Lưu Ý Pháp Lý & Bản Quyền

- **Output license**: kiểm tra TOS từng vendor — OpenAI, Adobe, Bria cho phép thương mại; Midjourney hạn chế redistribution.
- **Training data**: Adobe Firefly và Bria AI cam kết trained-on-licensed-data (an toàn IP); SD/Flux có rủi ro nếu phát hiện ảnh có bản quyền trong tập train.
- **Provenance / watermark**: GPT Image-1 và Imagen gắn metadata C2PA; nên lưu provenance trong PIM để audit.
- **Cá nhân hóa / GDPR**: tránh gửi ảnh chân dung khách hàng vào API ngoài EU không có DPA.
- **Fine-tuning / LoRA**: nếu train trên ảnh studio nội bộ, đảm bảo có quyền với nhiếp ảnh gia / model.
- **Brand similarity**: prompt nêu tên thương hiệu khác có thể vi phạm trademark — dùng prompt mô tả phong cách thay vì tên hãng.

---

## 7. Tài Nguyên & Cộng Đồng

- **Hugging Face Spaces** — thử model online trước khi self-host.
- **Civitai** — kho LoRA và checkpoint fine-tuned (chú ý license từng item).
- **OpenArt** / **ComfyWorkflows** — workflow ComfyUI ready-to-use.
- **PromptHero / Lexica** — kho prompt tham khảo.
- **Reddit**: `r/StableDiffusion`, `r/comfyui`, `r/aivideo`.
- **Papers With Code** topic *image-generation*, *image-to-3d*.
- **GitHub topics**: `stable-diffusion`, `controlnet`, `comfyui`, `image-to-3d`, `diffusion-models`.

---

*Cập nhật: 2026-05-19. Tài liệu R&D nền cho hướng AI rendering trong [00_System_Overview.md](00_System_Overview.md) §8.*
