# UI Mockups

## Main Application Layout

```
+-------------------------------------------------------+
|                       Header                          |
+---------------+---------------------------------------+
|               |                                       |
|               |                                       |
|               |                                       |
|  Tree         |  Diagram View (Tabbed Interface)     |
|  Structure    |                                       |
|  View         |                                       |
|               |                                       |
|               |                                       |
|               |                                       |
+---------------+---------------------------------------+
|                                                       |
|                  Chat Interface                       |
|                                                       |
+-------------------------------------------------------+
```

## Tree Structure View

The tree structure view will display the project hierarchy in an expandable/collapsible format:

```
Project Name
├── Frontend
│   ├── Components
│   │   ├── Header
│   │   ├── Sidebar
│   │   ├── Main Content
│   │   └── Footer
│   ├── Pages
│   │   ├── Home
│   │   ├── Dashboard
│   │   └── Settings
│   └── State Management
│       ├── Context
│       └── Redux Store
├── Backend
│   ├── API Endpoints
│   │   ├── User Management
│   │   ├── Project Management
│   │   └── Data Services
│   ├── Database Models
│   │   ├── User
│   │   ├── Project
│   │   └── Diagram
│   └── Services
│       ├── Authentication
│       ├── Planning
│       └── Diagram Generation
└── Deployment
    ├── Development
    ├── Staging
    └── Production
```

## Diagram View with Tabs

The diagram view will feature a tabbed interface for different diagram types:

```
+-------------------------------------------------------+
| [Architecture] [Components] [Sequence] [Data Model] + |
+-------------------------------------------------------+
|                                                       |
|                                                       |
|                                                       |
|                                                       |
|                 Diagram Content                       |
|                                                       |
|                                                       |
|                                                       |
|                                                       |
+-------------------------------------------------------+
| Zoom: [--------O--------] | Export: [PNG] [SVG] [URL] |
+-------------------------------------------------------+
```

### Sample Architecture Diagram (Mermaid.js)

```mermaid
flowchart TD
    Client[Client Browser] --> LB[Load Balancer]
    LB --> FE[Frontend Server]
    FE --> API[API Server]
    API --> AI[AI Planning Service]
    API --> DG[Diagram Generator]
    API --> DB[(Database)]
    API --> FS[File Storage]
    AI <--> LLM[LLM Service]
    
    subgraph "Frontend Layer"
        FE
    end
    
    subgraph "API Layer"
        LB
        API
    end
    
    subgraph "Service Layer"
        AI
        DG
    end
    
    subgraph "Data Layer"
        DB
        FS
    end
    
    subgraph "External Services"
        LLM
    end
    
    classDef frontend fill:#f9f,stroke:#333,stroke-width:2px;
    classDef api fill:#bbf,stroke:#333,stroke-width:2px;
    classDef service fill:#bfb,stroke:#333,stroke-width:2px;
    classDef data fill:#fbb,stroke:#333,stroke-width:2px;
    classDef external fill:#ddd,stroke:#333,stroke-width:2px;
    
    class FE frontend;
    class LB,API api;
    class AI,DG service;
    class DB,FS data;
    class LLM external;
```

### Sample Component Diagram (Mermaid.js)

```mermaid
classDiagram
    class Application {
        +components: Component[]
        +initialize()
        +render()
    }
    
    class Component {
        <<abstract>>
        +props: Object
        +state: Object
        +render()
        +update()
    }
    
    class LayoutComponent {
        +header: HeaderComponent
        +sidebar: SidebarComponent
        +content: ContentComponent
        +footer: FooterComponent
        +render()
    }
    
    class TreeViewComponent {
        +nodes: TreeNode[]
        +expandNode(nodeId)
        +collapseNode(nodeId)
        +selectNode(nodeId)
        +render()
    }
    
    class DiagramComponent {
        +tabs: Tab[]
        +activeTab: Tab
        +diagrams: Diagram[]
        +switchTab(tabId)
        +renderDiagram()
        +exportDiagram(format)
    }
    
    class ChatComponent {
        +messages: Message[]
        +sendMessage(text)
        +receiveMessage(message)
        +render()
    }
    
    Application --> LayoutComponent
    LayoutComponent --> TreeViewComponent
    LayoutComponent --> DiagramComponent
    LayoutComponent --> ChatComponent
    Component <|-- LayoutComponent
    Component <|-- TreeViewComponent
    Component <|-- DiagramComponent
    Component <|-- ChatComponent
```

## Chat Interface

The chat interface will be located at the bottom of the screen:

```
+-------------------------------------------------------+
| [AI] Hello! How can I help with your project today?   |
|                                                       |
| [User] I need to create a web application for         |
| inventory management.                                 |
|                                                       |
| [AI] I'll help you plan that. Let me create a basic   |
| project structure and some diagrams for you.          |
|                                                       |
| [System] Creating project structure...                |
| [System] Generating architecture diagram...           |
+-------------------------------------------------------+
| Type your message...                        [Send] [↑]|
+-------------------------------------------------------+
```

## Mobile View

On mobile devices, the layout will adapt to a tabbed interface:

```
+-------------------------------------------------------+
|  Project Name                              [≡] [👤]  |
+-------------------------------------------------------+
| [Tree] [Diagram] [Chat]                               |
+-------------------------------------------------------+
|                                                       |
|                                                       |
|                                                       |
|                                                       |
|                 Current Tab Content                   |
|                                                       |
|                                                       |
|                                                       |
|                                                       |
+-------------------------------------------------------+
```

## Context Menu for Tree Nodes

Right-clicking on a tree node will display a context menu:

```
+------------------------+
| ✏️ Edit                |
| 🔍 View Details        |
| 📊 Create Diagram      |
| 📋 Add Child Node      |
| 🗑️ Delete              |
| 📋 Copy                |
| 📋 Paste               |
+------------------------+
```

## Diagram Tab Context Menu

Right-clicking on a diagram tab will display a context menu:

```
+------------------------+
| 📋 Duplicate Tab       |
| 🔄 Refresh Diagram     |
| 💾 Export Diagram      |
| 🔍 View Mermaid Code   |
| 🗑️ Close Tab           |
+------------------------+
```