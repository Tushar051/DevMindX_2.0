import { parse } from 'mermaid/dist/mermaid.js';

const chart = `flowchart TB
    classDef frontend fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef backend fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef ext fill:#fce4ec,stroke:#c2185b,stroke-width:2px;
    classDef db fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef infra fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px;

    User((Developer Client)):::ext
    Guest((Collab Guest)):::ext
    
    subgraph Presentation_Layer [Presentation / Frontend]
        direction LR
        UI[Main Dashboard]:::frontend
        Editor[Collab Code Editor (Monaco/Yjs)]:::frontend
        Canvas[Live Whiteboard]:::frontend
        VideoUI[WebRTC Video Chat]:::frontend
        AIChat[AI Assistant Chatbox]:::frontend
    end
    
    subgraph Network [API Gateway & Routing]
        LB[Load Balancer / Nginx]:::infra
    end
    
    subgraph App_Services [Application Services]
        API[Main REST API (Next.js / Express)]:::backend
        WSS[WebSocket CRDT Server (Yjs / socket.io)]:::backend
        Signaling[WebRTC Signalling Server]:::backend
        LLMProxy[AI Orchestrator API]:::backend
        ExecProxy[Sandbox Manager API]:::backend
    end
    
    subgraph Code_Execution [Secure Execution Environment]
        Docker[(Isolated Sandbox Containers)]:::infra
    end
    
    subgraph Persistence [Data Persistence]
        RDS[(PostgreSQL<br/>Auth, Projects, Logs)]:::db
        Blob[(Object Storage<br/>Files, Avatars, PDF Exports)]:::db
        Redis[(Redis Cache<br/>Sessions, Rate Limits, State)]:::db
    end
    
    subgraph External_Providers [External Providers]
        Auth([Supabase / OAuth IDP]):::ext
        LLMs([External LLMs]):::ext
    end

    User -->|HTTPS| LB
    Guest -->|HTTPS / WSS| LB
    
    LB -->|Renders UI| UI
    LB -->|Code Sync (WSS)| WSS
    LB -->|Canvas Sync (WSS)| WSS
    LB -->|Peer signal (WSS)| Signaling
    LB -->|Standard reqs| API
    
    UI --> Editor
    UI --> Canvas
    UI --> VideoUI
    UI --> AIChat
    
    API -->|Authorize Token| Auth
    API -->|Read/Write| RDS
    API -->|Serve/Save Blobs| Blob
    API -->|Check Quotas| Redis

    WSS -->|Persist Document State| RDS
    Signaling -->|Manage Rooms| Redis
    
    API -->|Run Request| ExecProxy
    ExecProxy <-->|Spawns env & runs| Docker
    
    API -->|Prompt Request| LLMProxy
    LLMProxy <-->|Forwards stream| LLMs
`;

async function test() {
  const m = await import('mermaid');
  m.default.initialize({ startOnLoad: false });
  try {
    await m.default.parse(chart);
    console.log("Success");
  } catch (e) {
    console.log("Parse Error:", e.message);
  }
}
test();
