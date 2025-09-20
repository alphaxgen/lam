# 🏗️ N8n to Lamatic.ai Mapping Engine - Architecture Documentation

## 📋 **Overview**
Production-grade workflow migration platform with dual approaches: secure file upload (Approach 1) and enterprise bulk migration (Approach 2).

---

## 🎯 **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    DUAL APPROACH PLATFORM                   │
├─────────────────────────┬───────────────────────────────────┤
│     APPROACH 1          │         APPROACH 2                │
│   File Upload Migration │   API Integration (Bulk)          │
│   Port: 3000            │   Port: 3001                      │
└─────────────────────────┴───────────────────────────────────┘
```

---

## 📁 **Directory Structure**

```
D:\lam\
├── 📦 Core Application (Approach 1)
│   ├── server.js                    # Main Express server for file upload migration
│   ├── package.json                 # Dependencies and npm scripts for both approaches
│   ├── src/
│   │   └── mapping-engine.js        # Core conversion engine with 50+ node mappings
│   ├── public/                      # Frontend for standalone file upload interface
│   │   ├── index.html              # Upload interface with drag-and-drop
│   │   ├── script.js               # Frontend logic for file handling
│   │   └── style.css               # Professional UI styling
│   └── temp/                        # Temporary file storage for uploads
│
├── 🔗 Integration Package (Approach 2)
│   ├── lamatic-integration/
│   │   ├── demo-server.js          # Integration demo server (port 3001)
│   │   ├── api-handler.js          # Modular backend API for single file import
│   │   ├── bulk-migration.js       # Bulk migration API with real n8n REST API
│   │   ├── mapping-engine.js       # Copy of core engine for modularity
│   │   ├── N8nImporter.js          # Frontend component for single file import
│   │   ├── BulkMigration.js        # Frontend component for bulk migration
│   │   ├── example-integration.html # Demo of integration in Lamatic.ai UI
│   │   ├── package.json            # Integration-specific dependencies
│   │   └── docs/
│   │       ├── INTEGRATION_GUIDE.md # Step-by-step integration instructions
│   │       ├── N8N_API_GUIDE.md    # n8n API credentials and setup
│   │       └── API_INTEGRATION_SUMMARY.md # Real API integration features
│
├── 📚 Documentation
│   ├── README.md                   # Main project documentation with quick start
│   ├── APPROACHES.md               # Detailed comparison of both approaches
│   └── ARCHITECTURE.md             # This file - complete architecture overview
│
├── 🚀 Scripts
│   ├── start-both.bat             # Windows script to run both servers
│   ├── start-both.sh              # Linux/Mac script to run both servers
│   └── .gitignore                 # Git ignore with temp directories
│
└── 🗂️ Legacy/Backup
    └── src/mapping-engine-legacy.js # Backup of previous engine version
```

---

## ⚙️ **Core Components**

### **1. Mapping Engine (`src/mapping-engine.js`)**
- **Purpose**: Production-grade n8n to Lamatic.ai workflow transformation
- **Features**: 50+ node type mappings, flow analysis, auth detection, statistics
- **Key Functions**:
  - `validateN8nFile()` - Validates uploaded n8n workflow JSON
  - `convertWorkflow()` - Main conversion with precision analysis
  - `ProductionAnalyzer` - Advanced workflow analysis engine

### **2. Approach 1: Standalone Server (`server.js`)**
- **Purpose**: Secure file upload migration server
- **Port**: 3000
- **Features**: Multer file upload, comprehensive error handling, detailed analytics
- **API Endpoints**:
  - `POST /api/convert` - Main conversion endpoint
  - `GET /` - Serves frontend interface

### **3. Approach 2: Integration Demo (`lamatic-integration/demo-server.js`)**
- **Purpose**: Enterprise bulk migration server
- **Port**: 3001
- **Features**: Single file import, bulk migration, real n8n API integration
- **API Endpoints**:
  - `POST /api/import/n8n` - Single file import
  - `POST /api/n8n/workflows` - Fetch n8n workflows
  - `POST /api/n8n/bulk-convert` - Bulk conversion
  - `GET /api/health` - Health check

---

## 🔄 **Data Flow Architecture**

### **Approach 1: File Upload Flow**
```
User Upload → Multer → File Validation → Mapping Engine → 
Analytics → Response → Download
```

### **Approach 2: Bulk Migration Flow**
```
n8n Credentials → n8n REST API → Workflow List → User Selection → 
Bulk Conversion → Lamatic Import
```

### **Core Conversion Pipeline**
```
n8n JSON → Validation → Node Analysis → Type Mapping → 
Dependency Building → Flow Analysis → Lamatic JSON
```

---

## 🎨 **Frontend Architecture**

### **Approach 1: Standalone Interface**
- **File**: `public/index.html`, `public/script.js`
- **Features**: Drag-and-drop upload, progress tracking, detailed results
- **Technology**: Vanilla JavaScript with modern ES6+

### **Approach 2: Integration Components**
- **N8nImporter.js**: Self-contained modal for single file import
- **BulkMigration.js**: Complete bulk migration interface
- **Integration**: Framework-agnostic (works with React, Vue, Angular)

---

## 🔧 **Backend Architecture**

### **Express.js Server Structure**
```javascript
app.use(express.json())           // JSON parsing
app.use(multer())                 // File upload handling
app.post('/api/*', handlers)      // API routes
app.use(express.static())         // Static file serving
```

### **API Response Structure**
```javascript
{
  success: boolean,
  original: { name, nodeCount, fileName },
  converted: { name, description, nodes, triggerNode, connections },
  summary: { totalNodes, convertedNodes, authRequiredCount, categories },
  migrationReport: { flowAnalysis, nodeMapping, recommendations },
  metadata: { importedAt, version, fileSize }
}
```

---

## 📊 **Node Mapping Architecture**

### **Production Mapping Rules Structure**
```javascript
PRODUCTION_MAPPING_RULES = {
  'n8n-node-type': {
    category: 'trigger|ai|app|data|logic|integration',
    subcategory: 'webhook|llm|email|transformation|etc',
    lamaticType: 'webhookTriggerNode|LLMNode|gmailNode|etc',
    requiresAuth: boolean,
    authProvider: 'Gmail|OpenAI|Slack|etc',
    description: 'Human readable description'
  }
}
```

### **Supported Categories**
- **Triggers**: webhook, form, schedule, email triggers
- **AI**: LLM nodes, agents, parsers, chains
- **Apps**: Gmail, Slack, Teams, Drive integrations
- **Data**: Transformation, aggregation, splitting
- **Logic**: Conditional branching, loops, error handling
- **Integration**: HTTP requests, API calls, webhooks

---

## 🔐 **Security Architecture**

### **File Upload Security**
- **Validation**: File type, size, JSON structure checks
- **Sanitization**: Parameter cleaning, credential removal
- **Temporary Storage**: Auto-cleanup with configurable intervals
- **Error Handling**: Secure error messages without data leakage

### **API Integration Security**
- **Authentication**: Bearer token for n8n API calls
- **Rate Limiting**: Configurable request limits
- **Data Protection**: No persistent credential storage
- **HTTPS**: Secure communication requirements

---

## 📈 **Analytics & Monitoring**

### **Conversion Statistics**
```javascript
{
  totalNodes: number,           // Original node count
  convertedNodes: number,       // Successfully mapped
  unsupportedNodes: number,     // Require manual implementation
  ignoredNodes: number,         // UI elements (sticky notes)
  authRequiredCount: number,    // Nodes needing re-authentication
  categories: {                 // Detailed breakdown
    triggers, aiNodes, appNodes, dataNodes, logicNodes, integrationNodes
  }
}
```

### **Flow Analysis**
- **Pattern Detection**: Linear, branching, merging, error handling flows
- **Execution Order**: Topological sorting for proper sequence
- **Dependencies**: Node relationship mapping
- **Metadata**: Flow complexity and characteristics

---

## 🚀 **Deployment Architecture**

### **Development Environment**
```bash
npm start                    # Approach 1 (port 3000)
npm run start:approach2      # Approach 2 (port 3001)
npm run start:both          # Both servers simultaneously
```

### **Production Deployment Options**

#### **Approach 1: Immediate Deployment**
- **Requirements**: Node.js 16+, basic Express setup
- **Security**: SSL certificates, file size limits
- **Monitoring**: Error tracking, performance metrics

#### **Approach 2: Enterprise Planning**
- **Infrastructure**: Redis caching, queue systems
- **Security**: OAuth 2.0, encrypted key storage
- **Compliance**: GDPR, SOC2 requirements
- **Performance**: Load balancing, horizontal scaling

---

## 🔗 **Integration Patterns**

### **Backend Integration**
```javascript
// One-line Express integration
const { setupN8nImport } = require('./lamatic-integration/api-handler');
setupN8nImport(app);

// Custom endpoint integration
app.post('/api/import/n8n', handleN8nImport);
```

### **Frontend Integration**
```javascript
// Vanilla JavaScript
const importer = new N8nImporter({ apiEndpoint: '/api/import/n8n' });
importer.showImportDialog();

// React integration
import { N8nImporter } from './N8nImporter';
const importer = new N8nImporter({ onSuccess: handleSuccess });
```

---

## 📝 **Configuration Management**

### **Environment Variables**
```bash
PORT=3000                    # Server port
NODE_ENV=production          # Environment
MAX_FILE_SIZE=10485760       # 10MB file limit
TEMP_DIR=temp/uploads        # Temporary storage
CLEANUP_INTERVAL=3600000     # 1 hour cleanup
```

### **Feature Flags**
- **Real API Integration**: Enable/disable actual n8n API calls
- **Mock Data Fallback**: Demo mode with sample workflows
- **Debug Logging**: Detailed conversion process logs
- **Analytics**: Track conversion success rates and performance

---

## 🎯 **Performance Considerations**

### **Memory Management**
- **Streaming**: Large file processing without memory spikes
- **Cleanup**: Automatic temporary file removal
- **Caching**: Workflow metadata for repeated operations

### **Scalability**
- **Horizontal**: Load balancer with multiple server instances
- **Database**: Optional workflow storage for enterprise features
- **Queue**: Async processing for bulk migrations

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- **Mapping Engine**: Node conversion accuracy
- **Validation**: File format and structure checks
- **Analytics**: Statistics calculation verification

### **Integration Tests**
- **API Endpoints**: Request/response validation
- **File Upload**: End-to-end upload and conversion
- **n8n API**: Real API integration testing

### **Performance Tests**
- **Large Files**: 1MB+ workflow processing
- **Concurrent**: Multiple simultaneous conversions
- **Memory**: Resource usage monitoring

---

## 📚 **Documentation Architecture**

### **User Documentation**
- **README.md**: Quick start and overview
- **APPROACHES.md**: Detailed approach comparison
- **INTEGRATION_GUIDE.md**: Step-by-step integration

### **Developer Documentation**
- **ARCHITECTURE.md**: This comprehensive architecture guide
- **API_INTEGRATION_SUMMARY.md**: Technical API details
- **N8N_API_GUIDE.md**: n8n setup and credentials

### **Code Documentation**
- **JSDoc Comments**: Function and class documentation
- **Inline Comments**: Complex logic explanation
- **Type Definitions**: Parameter and return type documentation

---

This architecture provides enterprise-grade flexibility with immediate deployment capability (Approach 1) and future-ready bulk migration features (Approach 2), all built on a production-ready foundation with comprehensive security, monitoring, and integration capabilities.
