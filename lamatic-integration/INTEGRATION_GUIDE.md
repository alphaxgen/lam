# 🔄 n8n to Lamatic.ai Import Feature Integration Guide

This guide explains how to integrate the n8n import functionality as a native feature within Lamatic.ai.

## 🎯 Overview

Transform the standalone n8n converter into a seamless "Import from n8n" button that:
- Opens a modal dialog for file upload
- Processes the n8n workflow in the background
- Shows migration summary and statistics
- Imports the converted workflow directly into Lamatic.ai

## 📁 File Structure

```
lamatic-integration/
├── N8nImporter.js          # Frontend component (React/Vue compatible)
├── api-handler.js          # Backend API handler (Express/FastAPI)
├── converter.js            # Core conversion logic (copy from src/converter.js)
├── INTEGRATION_GUIDE.md    # This guide
└── examples/               # Integration examples
    ├── react-example.jsx
    ├── vue-example.vue
    └── vanilla-example.html
```

## 🚀 Frontend Integration

### Option 1: Direct Script Integration (Vanilla JS)

```html
<!-- Add to your HTML head -->
<script src="/js/N8nImporter.js"></script>

<!-- Add import button anywhere in your UI -->
<button id="import-n8n-btn" class="btn btn-secondary">
    <svg width="20" height="20">...</svg>
    Import from n8n
</button>

<script>
// Initialize the importer
const n8nImporter = new N8nImporter({
    apiEndpoint: '/api/import/n8n',
    onSuccess: (result) => {
        // Handle successful import
        console.log('Workflow imported:', result);
        
        // Add workflow to Lamatic.ai workspace
        LamaticWorkspace.addWorkflow(result.workflow);
        
        // Show success notification
        showNotification('Workflow imported successfully!', 'success');
        
        // Redirect to workflow editor
        window.location.href = `/workflows/${result.workflow.id}/edit`;
    },
    onError: (error) => {
        // Handle errors
        console.error('Import failed:', error);
        showNotification('Import failed: ' + error.message, 'error');
    },
    onProgress: (percentage, message) => {
        // Optional: Show progress
        console.log(`Progress: ${percentage}% - ${message}`);
    }
});

// Bind to button
document.getElementById('import-n8n-btn').addEventListener('click', () => {
    n8nImporter.showImportDialog();
});
</script>
```

### Option 2: React Integration

```jsx
import React, { useRef } from 'react';
import { N8nImporter } from './N8nImporter';

function WorkflowImportButton() {
    const importerRef = useRef(null);

    const handleImport = () => {
        if (!importerRef.current) {
            importerRef.current = new N8nImporter({
                apiEndpoint: '/api/import/n8n',
                onSuccess: (result) => {
                    // Integrate with your React state management
                    dispatch(addWorkflow(result.workflow));
                    
                    // Show success toast
                    toast.success('Workflow imported successfully!');
                    
                    // Navigate to editor
                    navigate(`/workflows/${result.workflow.id}/edit`);
                },
                onError: (error) => {
                    toast.error(`Import failed: ${error.message}`);
                }
            });
        }
        
        importerRef.current.showImportDialog();
    };

    return (
        <button 
            onClick={handleImport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import from n8n
        </button>
    );
}

export default WorkflowImportButton;
```

### Option 3: Vue.js Integration

```vue
<template>
    <button 
        @click="showImportDialog"
        class="import-btn"
    >
        <icon name="upload" />
        Import from n8n
    </button>
</template>

<script>
import { N8nImporter } from './N8nImporter';

export default {
    name: 'N8nImportButton',
    data() {
        return {
            importer: null
        };
    },
    mounted() {
        this.importer = new N8nImporter({
            apiEndpoint: '/api/import/n8n',
            onSuccess: (result) => {
                // Integrate with Vuex store
                this.$store.dispatch('workflows/addWorkflow', result.workflow);
                
                // Show notification
                this.$notify({
                    title: 'Success',
                    message: 'Workflow imported successfully!',
                    type: 'success'
                });
                
                // Navigate to editor
                this.$router.push(`/workflows/${result.workflow.id}/edit`);
            },
            onError: (error) => {
                this.$notify({
                    title: 'Import Failed',
                    message: error.message,
                    type: 'error'
                });
            }
        });
    },
    methods: {
        showImportDialog() {
            this.importer.showImportDialog();
        }
    },
    beforeDestroy() {
        if (this.importer) {
            this.importer.destroy();
        }
    }
};
</script>
```

## 🔧 Backend Integration

### Express.js Integration

```javascript
const express = require('express');
const { setupN8nImport } = require('./api-handler');

const app = express();

// Setup n8n import feature
setupN8nImport(app, {
    endpoint: '/api/import/n8n',
    tempDir: 'temp/n8n-imports',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    cleanupInterval: 60 * 60 * 1000 // 1 hour
});

app.listen(3000, () => {
    console.log('Server running with n8n import feature');
});
```

### Custom Integration

```javascript
const { handleN8nImport } = require('./api-handler');

// Add to your existing Express routes
app.post('/api/import/n8n', handleN8nImport);

// Or integrate into your custom handler
app.post('/api/workflows/import', async (req, res) => {
    const { source } = req.body;
    
    if (source === 'n8n') {
        return handleN8nImport(req, res);
    }
    
    // Handle other import sources
    // ... your existing import logic
});
```

### FastAPI Integration (Python)

```python
from fastapi import FastAPI, UploadFile
from .n8n_converter import convert_n8n_workflow

app = FastAPI()

@app.post("/api/import/n8n")
async def import_n8n_workflow(n8n_file: UploadFile):
    """Import n8n workflow"""
    try:
        # Read and parse file
        content = await n8n_file.read()
        n8n_data = json.loads(content)
        
        # Convert workflow
        lamatic_workflow = convert_n8n_workflow(n8n_data)
        
        return {
            "success": True,
            "workflow": lamatic_workflow,
            "migration": {
                "summary": lamatic_workflow.get("metadata", {})
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## 🎨 UI Integration Patterns

### 1. Main Toolbar Button

```html
<!-- Add to your main workflow toolbar -->
<div class="toolbar">
    <button class="btn-primary">New Workflow</button>
    <button class="btn-secondary" onclick="openTemplateGallery()">Templates</button>
    <button class="btn-secondary" onclick="n8nImporter.showImportDialog()">Import from n8n</button>
</div>
```

### 2. Import Menu Option

```html
<!-- Add to your import dropdown -->
<div class="dropdown-menu">
    <a href="#" onclick="importFromFile()">Import JSON</a>
    <a href="#" onclick="importFromUrl()">Import from URL</a>
    <a href="#" onclick="n8nImporter.showImportDialog()">Import from n8n</a>
    <hr>
    <a href="#" onclick="importFromZapier()">Import from Zapier</a>
</div>
```

### 3. Empty State Action

```html
<!-- Add to your empty workspace -->
<div class="empty-state">
    <h2>Create your first workflow</h2>
    <div class="action-buttons">
        <button class="btn-primary">Start from Scratch</button>
        <button class="btn-secondary">Use Template</button>
        <button class="btn-secondary" onclick="n8nImporter.showImportDialog()">Import from n8n</button>
    </div>
</div>
```

## 📊 Data Flow Integration

### 1. Workflow Import Process

```javascript
// After successful import
const handleWorkflowImport = (importResult) => {
    const { workflow, migration } = importResult;
    
    // 1. Create workflow in database
    const workflowId = await createWorkflow({
        name: workflow.name,
        description: workflow.description,
        source: 'n8n',
        importedAt: new Date(),
        metadata: {
            migration: migration,
            originalFormat: 'n8n'
        }
    });
    
    // 2. Create nodes
    for (const node of workflow.nodes) {
        await createNode({
            workflowId,
            nodeId: node.nodeId,
            type: node.nodeType,
            name: node.nodeName,
            config: node.values,
            position: node.position || { x: 0, y: 0 }
        });
    }
    
    // 3. Create trigger
    if (workflow.triggerNode) {
        await createTrigger({
            workflowId,
            type: workflow.triggerNode.nodeType,
            config: workflow.triggerNode.values
        });
    }
    
    // 4. Create connections
    await createConnections({
        workflowId,
        connections: workflow.connections
    });
    
    // 5. Show success and redirect
    showMigrationSummary(migration);
    redirectToWorkflow(workflowId);
};
```

### 2. Migration Summary Display

```javascript
const showMigrationSummary = (migration) => {
    const { summary, report } = migration;
    
    // Show summary modal
    showModal({
        title: 'Import Complete',
        content: `
            <div class="migration-summary">
                <div class="stats">
                    <div class="stat">
                        <span class="number">${summary.totalNodes}</span>
                        <span class="label">Total Nodes</span>
                    </div>
                    <div class="stat success">
                        <span class="number">${summary.supportedNodes}</span>
                        <span class="label">Converted</span>
                    </div>
                    <div class="stat warning">
                        <span class="number">${summary.unsupportedNodes}</span>
                        <span class="label">Need Review</span>
                    </div>
                </div>
                
                ${summary.authRequiredCount > 0 ? `
                    <div class="auth-notice">
                        <strong>⚠️ Authentication Required</strong>
                        <p>Please configure credentials for: ${summary.authProviders.join(', ')}</p>
                    </div>
                ` : ''}
                
                <div class="recommendations">
                    ${report.recommendations.map(rec => `
                        <div class="recommendation ${rec.type}">
                            <strong>${rec.title}</strong>
                            <p>${rec.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `,
        actions: [
            { text: 'Setup Credentials', action: 'setupCredentials', primary: true },
            { text: 'Continue', action: 'close' }
        ]
    });
};
```

## 🔒 Security Considerations

### 1. File Validation

```javascript
// Validate uploaded files
const validateN8nFile = (file) => {
    // Size check
    if (file.size > 10 * 1024 * 1024) {
        throw new Error('File too large');
    }
    
    // Type check
    if (!file.name.endsWith('.json')) {
        throw new Error('Invalid file type');
    }
    
    // Content validation
    const content = JSON.parse(file.content);
    if (!content.nodes || !Array.isArray(content.nodes)) {
        throw new Error('Invalid n8n workflow format');
    }
    
    return true;
};
```

### 2. Sanitization

```javascript
// Sanitize node configurations
const sanitizeNodeConfig = (config) => {
    // Remove sensitive data
    delete config.credentials;
    delete config.apiKeys;
    delete config.passwords;
    
    // Validate URLs
    if (config.url) {
        config.url = sanitizeUrl(config.url);
    }
    
    return config;
};
```

## 🧪 Testing Integration

### 1. Unit Tests

```javascript
describe('N8n Import Feature', () => {
    test('should import valid n8n workflow', async () => {
        const mockWorkflow = {
            name: 'Test Workflow',
            nodes: [/* mock nodes */],
            connections: {/* mock connections */}
        };
        
        const result = await importN8nWorkflow(mockWorkflow);
        
        expect(result.success).toBe(true);
        expect(result.workflow.name).toBe('Test Workflow');
    });
    
    test('should reject invalid workflow', async () => {
        const invalidWorkflow = { invalid: true };
        
        await expect(importN8nWorkflow(invalidWorkflow))
            .rejects.toThrow('Invalid n8n workflow format');
    });
});
```

### 2. Integration Tests

```javascript
describe('Import API Endpoint', () => {
    test('POST /api/import/n8n should convert workflow', async () => {
        const response = await request(app)
            .post('/api/import/n8n')
            .attach('n8nFile', 'test-workflow.json')
            .expect(200);
        
        expect(response.body.success).toBe(true);
        expect(response.body.workflow).toBeDefined();
    });
});
```

## 📈 Analytics & Monitoring

### 1. Track Import Events

```javascript
// Track successful imports
analytics.track('n8n_workflow_imported', {
    nodeCount: result.migration.summary.totalNodes,
    conversionRate: result.migration.summary.supportedNodes / result.migration.summary.totalNodes,
    authRequired: result.migration.summary.authRequiredCount > 0,
    fileSize: file.size
});

// Track errors
analytics.track('n8n_import_failed', {
    error: error.message,
    fileSize: file.size,
    fileName: file.name
});
```

### 2. Monitor Performance

```javascript
// Performance monitoring
const importStartTime = Date.now();

// ... import logic ...

const importDuration = Date.now() - importStartTime;
performance.track('n8n_import_duration', {
    duration: importDuration,
    nodeCount: workflow.nodes.length
});
```

## 🚀 Deployment Checklist

- [ ] Copy `converter.js` to your backend
- [ ] Install required dependencies (`multer`, `express`, etc.)
- [ ] Add API endpoint to your backend routes
- [ ] Include `N8nImporter.js` in your frontend build
- [ ] Add import button to your UI
- [ ] Setup temp directory with proper permissions
- [ ] Configure file upload limits
- [ ] Add error monitoring
- [ ] Test with sample n8n workflows
- [ ] Update documentation

## 💡 Best Practices

1. **Progressive Enhancement**: The import feature should work without breaking existing functionality
2. **User Feedback**: Always show clear progress and status messages
3. **Error Handling**: Provide helpful error messages and recovery options
4. **Performance**: Handle large workflows efficiently with streaming/chunking
5. **Accessibility**: Ensure the import dialog is keyboard and screen reader accessible
6. **Mobile Support**: Make the import process work on mobile devices

## 🎯 Success Metrics

- **Import Success Rate**: % of uploads that successfully convert
- **User Adoption**: Number of users using the import feature
- **Conversion Quality**: % of nodes successfully converted
- **Time to First Workflow**: How quickly users can get started with imported workflows
- **User Satisfaction**: Feedback scores for the import experience

---

This integration transforms the standalone converter into a seamless part of Lamatic.ai, providing users with a smooth migration path from n8n! 🚀
