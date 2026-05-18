# PIM System - Tech Stack Overview

## Architecture: 3 Independent Microservices

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  ASP.NET Core 8 │    │  React 18 + TS  │    │  Python FastAPI  │
│  Backend API    │    │  Admin UI       │    │  AI Service      │
│  Port: 5000     │    │  Port: 3000     │    │  Port: 8000      │
└────────┬────────┘    └────────┬────────┘    └────────┬─────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
    ┌────┴────┐          ┌──────┴──────┐        ┌─────┴─────┐
    │PostgreSQL│          │   Redis     │        │ RabbitMQ  │
    │TimescaleDB│         │   Cache     │        │  Queue    │
    └─────────┘          └─────────────┘        └───────────┘
```

---

## 1. Backend: ASP.NET Core 8

| Package | Version | Vai trò |
|---------|---------|---------|
| `Npgsql.EntityFrameworkCore.PostgreSQL` | 8.x | EF Core provider cho PostgreSQL |
| `Hangfire.PostgreSql` | latest | Background jobs: D365 sync (15 min), image resize, publish |
| `SixLabors.ImageSharp` | 3.x | Image Engine: resize, convert, watermark |
| `Magick.NET-Q8-AnyCPU` | 14.x | Xử lý PSD/RAW/TIFF, CAD preview |
| `MassTransit.RabbitMQ` | 8.x | Message broker abstraction |
| `StackExchange.Redis` | 2.x | Distributed cache + session |
| `tusdotnet` | 2.x | Resumable upload (video, CAD files lớn) |
| `Microsoft.PowerPlatform.Dataverse.Client` | 1.x | D365 sync API |
| `Typesense` (HTTP client) | — | Search engine client |

### Clean Architecture Layers

```
src/
├── Pim.Api/              → Controllers, Middleware, DI
├── Pim.Application/      → Services, DTOs, Interfaces
├── Pim.Domain/           → Entities, Enums, Value Objects
└── Pim.Infrastructure/   → EF Core, Repositories, External Services
```

---

## 2. Frontend: React 18 + TypeScript + MUI

| Package | Version | Vai trò |
|---------|---------|---------|
| `@refinedev/core` | 5.x | CRUD framework (data fetching, routing, auth) |
| `@refinedev/mui` | 8.x | MUI integration cho Refine (ThemedLayout, buttons) |
| `@mui/material` | 6.x | Component library (UI chính) |
| `@mui/x-data-grid` | 8.x | Product list table với sort/filter/pagination |
| `@refinedev/simple-rest` | 6.x | REST data provider (kết nối backend) |
| `@refinedev/react-router` | 2.x | Router integration |
| `@tiptap/react` | 2.x | Rich text editor (descriptions, USPs, care guides) |
| `tus-js-client` | 4.x | Resumable upload phía client |
| `recharts` | 2.x | Analytics charts (Asset Link Map, performance) |
| `@dnd-kit/core` | 6.x | Drag-drop (Campaign Builder) |
| `react-router-dom` | 7.x | Client-side routing |
| `i18next` | 26.x | Internationalization (DA/EN) |

### Frontend Structure

```
src/
├── App.jsx               → Refine config, routing, providers
├── pages/
│   ├── dashboard/        → Stats, activity, completeness scores
│   ├── products/         → CRUD: list, show, edit, create
│   ├── assets/           → Gallery view, upload, detail
│   ├── text-content/     → Rich text editor (Tiptap)
│   └── campaigns/        → Social Campaign Builder (drag-drop)
├── components/           → Shared UI components
├── providers/            → Auth, data, notification providers
└── utils/                → Helpers, constants
```

---

## 3. AI Service: Python FastAPI + Claude (Anthropic)

| Package | Version | Vai trò |
|---------|---------|---------|
| `fastapi` | 0.115+ | Web framework cho AI microservice |
| `uvicorn` | 0.34+ | ASGI server |
| `anthropic` | 0.40+ | Claude API client (text generation) |
| `chromadb` | 0.6+ | Vector DB cho embeddings |
| `Pillow` | 11.x | Image analysis, metadata extraction |
| `pika` | 1.x | RabbitMQ client (consume messages) |
| `httpx` | 0.28+ | Async HTTP client |

### AI Service Capabilities

| Feature | Mô tả | Phase |
|---------|--------|-------|
| Text Generation | Descriptions, USPs, care instructions | Phase 1 |
| Image Tagging | Auto-tag assets bằng AI vision | Phase 1 |
| Caption Generation | Social media captions | Phase 2 |
| Quality Check | Kiểm tra chất lượng text/image | Phase 2 |
| Embeddings | Vector search cho similar products | Phase 2 |
| AI Rendering | Generate packshot variants | Phase 3 (Research) |

---

## 4. Database Layer

| Database | Vai trò | Port |
|----------|---------|------|
| **PostgreSQL 16** | Primary DB (products, assets, users, workflows) | 5432 |
| **TimescaleDB** | Time-series analytics (performance, campaign metrics) | 5432 (extension) |
| **Redis 7** | Cache, session, rate limiting, pub/sub | 6379 |
| **Typesense 27** | Full-text search (typo-tolerant, fast faceted search) | 8108 |
| **ChromaDB** | Vector embeddings (AI similarity search) | 8001 |

---

## 5. Infrastructure & DevOps

| Tool | Vai trò |
|------|---------|
| **Docker Compose** | Local dev environment (all services) |
| **Kubernetes** | Production deployment (scaling, health checks) |
| **GitHub Actions** | CI/CD pipeline (build, test, deploy) |
| **Azure Blob Storage** | File storage (images, videos, documents) |
| **Azure CDN** | Global content delivery |
| **RabbitMQ** | Async messaging giữa services |
| **Hangfire Dashboard** | Monitor background jobs |

### Docker Compose Services

```yaml
services:
  api:          # ASP.NET Core 8 backend
  client:       # React dev server (Vite)
  ai-service:   # Python FastAPI
  postgres:     # PostgreSQL + TimescaleDB
  redis:        # Redis cache
  rabbitmq:     # Message broker
  typesense:    # Search engine
```

---

## 6. External Integrations

| Service | Mô tả | Protocol |
|---------|--------|----------|
| **Microsoft D365** | ERP sync (products, prices, dimensions) | OData / Dataverse API |
| **iPaper** | Digital catalogue publishing | REST API |
| **Meta Graph API** | Facebook/Instagram publishing | OAuth + REST |
| **LinkedIn API** | LinkedIn post publishing | OAuth + REST |
| **TikTok API** | TikTok content publishing | OAuth + REST |
| **Azure Blob** | Asset storage | Azure SDK |
| **Azure CDN** | Content delivery | Auto (linked to Blob) |

---

## 7. Development Tools

| Tool | Vai trò |
|------|---------|
| **Vite 8** | Frontend build tool (HMR, fast builds) |
| **Vitest** | Frontend unit testing |
| **xUnit** | Backend unit testing |
| **ESLint** | Frontend linting |
| **Prettier** | Code formatting |
| **Swagger/OpenAPI** | API documentation |

---

## 8. So sánh với BRD gốc

| Khía cạnh | BRD (Azure-heavy) | Thực tế (PDF) | Lý do thay đổi |
|---|---|---|---|
| Database | Azure SQL | PostgreSQL | Chi phí thấp, self-hosted, Docker-friendly |
| Search | Azure Cognitive Search | Typesense | Open-source, nhanh, typo-tolerant |
| AI | Azure OpenAI | Claude (Anthropic) | Chất lượng text tốt hơn cho use case PIM |
| Queue | Azure Service Bus | RabbitMQ | Self-hosted, Docker-friendly, MassTransit support |
| Jobs | Azure Functions | Hangfire | Tích hợp trong ASP.NET Core, dễ debug |
| Infra | Azure PaaS | Docker/K8s | Portable, vendor-neutral, local dev dễ |
| Storage | Azure Blob | Azure Blob (**giữ nguyên**) | Vẫn tốt nhất cho file storage |
| CDN | Azure CDN | Azure CDN (**giữ nguyên**) | Vẫn cần cho global delivery |

---

## 9. Phased Roadmap

### Phase 1 (Month 1-4): Core PIM
- D365 sync (Hangfire recurring job, 15 min)
- Product CRUD + Visual Assets upload
- Image Engine (auto-resize < 30s)
- AI text generation (Claude)
- Review & Approve workflow
- Completeness Score
- Publish to iPaper

### Phase 2 (Month 4-6): Social & Analytics
- Social Campaign Builder (drag-drop)
- Asset Link Map (track usage across channels)
- Performance analytics (TimescaleDB + Recharts)
- Multi-platform publish (FB/IG/LinkedIn/TikTok)

### Phase 3 (Month 6+): Advanced AI
- AI Rendering (feasibility study)
- 360° Spin Sets
- Advanced embeddings search
- ML pipeline for auto-categorization
