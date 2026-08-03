# Deployment Documentation & Architecture Strategy

This document outlines the production architecture, cloud deployment recommendations, and operational deployment checklist for **LDF (Local Destination Finder)**.

---

## 1. Production Architecture Overview

The system architecture consists of three decoupled layers:

```text
[ React 19 Frontend (Nginx SPA) ]
               │
               ▼ (Reverse Proxy / HTTPS)
[ ASP.NET Core 8 Web API (Stateless) ] ── (SignalR WebSockets / REST)
               │
               ▼ (EF Core SQL Server Provider)
[ SQL Server Database (Relational Data) ]
```

---

## 2. Cloud Platform Recommendation: Google Cloud Platform (GCP)

### Recommended Services Summary

| Component | Target Service | Rationale |
| :--- | :--- | :--- |
| **Frontend Container** | Cloud Run / Firebase Hosting | Fast global CDN edge delivery and serverless scaling. |
| **Backend API Container** | Cloud Run | Fully managed container execution, automated scaling to zero, native health checks. |
| **Database** | Cloud SQL for SQL Server (Standard) | Fully managed MS SQL Server instance with automated backups, IAM security, and point-in-time recovery. |
| **Container Registry** | Artifact Registry | Private container image storage integrated with GCP IAM permissions. |
| **Secrets & Keys** | Secret Manager | Secure environment variables (JWT Signing Key, Connection Strings, Gemini API Key). |

---

## 3. SignalR Cloud Run Scaling Strategy

Cloud Run instance autoscaling can spin up multiple backend containers. 
For real-time SignalR broadcasts across multiple instances, adopt one of the following:

1. **Phase 1 (Initial Launch)**: Pin `max-instances = 1` on Cloud Run for the Backend API. This avoids multi-node WebSocket routing issues without additional cost.
2. **Phase 2 (High Traffic Scale-Out)**: Integrate **Azure SignalR Service** or a **Redis Backplane** (`Microsoft.AspNetCore.SignalR.StackExchangeRedis`) to sync real-time messages across multiple backend instances seamlessly.

---

## 4. Production Security Checklist

- [x] **No Secrets in Source Control**: Connection strings, JWT signing keys, and API keys are stored in GCP Secret Manager.
- [x] **JWT Bearer Token Security**: High entropy key (32+ chars), strict Issuer and Audience validation.
- [x] **Relational EF Core Migrations**: Migration execution controlled via `APPLY_MIGRATIONS=true` on startup.
- [x] **Health Monitoring**: Native ASP.NET Core health endpoint configured at `/health`.
- [x] **CORS Configuration**: Restrict allowed origins to specific production HTTPS domains.
