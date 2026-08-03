# Local Destination Finder (LDF) - Full-Stack Architecture

LDF is a modern tourism platform built for Saudi Arabia's 13 administrative regions, supporting destination exploration, custom package comparisons, real-time quotes, bookings, payments, and SignalR live messaging.

---

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Leaflet Maps + `@microsoft/signalr`
- **Backend**: ASP.NET Core 8 Web API + Identity + JWT Authentication + SignalR Hubs + EF Core
- **Database**:
  - Development: EF Core InMemory (`LdfDevDb`) / SQL Server
  - Production: MS SQL Server (`LdfProductionDb`)

---

## Running Locally

### Option 1: Standard Development Mode

1. **Start Backend**:
   ```bash
   cd backend/Ldf.Api
   dotnet run
   ```
   *Runs at `http://localhost:5205`*

2. **Start Frontend**:
   ```bash
   npm install
   npm run dev
   ```
   *Runs at `http://localhost:5173`*

---

### Option 2: Docker Compose (Full Stack with SQL Server)

```bash
docker compose up --build
```

- **Frontend App**: `http://localhost:8088`
- **ASP.NET Core API**: `http://localhost:5205`
- **SQL Server**: `localhost:1433`

---

##  Project Structure

```text
├── backend/
│   ├── Ldf.Api/             # Controllers, SignalR Hubs, Middleware, Program.cs
│   ├── Ldf.Core/            # Entities, Interfaces, Models
│   ├── Ldf.Infrastructure/  # DbContext, EF Repository, Migrations, Seeder
│   └── Dockerfile
├── src/                     # React 19 Frontend Components & Pages
│   ├── api/                 # API Clients (Auth, Regions, Destinations, Bookings, Payments, Quotes, Chats, Notifications)
│   ├── realtime/            # SignalR Client Connection Manager
│   └── pages/               # Application Pages
├── docker-compose.yml       # Docker orchestration for SQL Server, Backend, Frontend
└── docs/deployment.md       # Cloud deployment strategy documentation
```

---

##  License & Attribution

- Maps & Geospatial Data: © OpenStreetMap contributors
- AI Assistance: Google Gemini API Integration
