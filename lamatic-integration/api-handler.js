/**
 * Lamatic.ai Backend API Handler for n8n Import - Both Approaches Supported
 * 
 * Provides backend API integration for both file upload and bulk migration approaches:
 * 
 * Approach 1: File Upload Migration
 * - Secure file upload with validation
 * - Local processing without external API calls
 * - Enterprise-ready for security-conscious environments
 * 
 * Approach 2: API Integration (Demo)
 * - n8n REST API integration capabilities
 * - Bulk workflow fetching and conversion
 * - Production considerations documented for enterprise deployment
 * 
 * @author Sparsh (Alpha)
 * @since 2025
 */

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Import the converter (adjust path as needed)
const { validateN8nFile, convertWorkflow } = require('./mapping-engine');

/**
 * Configure multer for file uploads
 */
const upload = multer({
    dest: 'temp/n8n-imports/',
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.originalname.endsWith('.json')) {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed'), false);
        }
    }
});

/**
 * Express.js route handler for n8n workflow import
 * 
 * Usage in your Express app:
 * const { handleN8nImport } = require('./api-handler');
 * app.post('/api/import/n8n', handleN8nImport);
 */
async function handleN8nImport(req, res) {
    // Use multer middleware
    upload.single('n8nFile')(req, res, async (uploadErr) => {
        if (uploadErr) {
            return res.status(400).json({
                success: false,
                error: 'File upload failed',
                details: uploadErr.message
            });
        }

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }

            // Read the uploaded file
            const fileContent = fs.readFileSync(req.file.path, 'utf8');
            let n8nWorkflow;

            try {
                n8nWorkflow = JSON.parse(fileContent);
            } catch (parseError) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid JSON format',
                    details: parseError.message
                });
            }

            // Validate n8n workflow structure
            const validation = validateN8nFile(n8nWorkflow);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid n8n workflow',
                    details: validation.error
                });
            }

            // Convert to Lamatic format
            const convertedWorkflow = convertWorkflow(n8nWorkflow);

            // Get analysis data
            const analysis = convertedWorkflow.metadata?.analysis || {};
            
            // Prepare response with comprehensive migration data (matching standalone format)
            const originalNodeCount = n8nWorkflow.nodes?.length || 0;
            
            const response = {
                success: true,
                original: {
                    name: n8nWorkflow.name || 'Unnamed Workflow',
                    nodeCount: originalNodeCount,
                    fileName: req.file?.originalname || 'workflow.json'
                },
                converted: {
                    name: convertedWorkflow.name,
                    description: convertedWorkflow.description,
                    nodes: convertedWorkflow.nodes,
                    triggerNode: convertedWorkflow.triggerNode,
                    connections: convertedWorkflow.connections
                },
                workflow: {
                    name: convertedWorkflow.name,
                    description: convertedWorkflow.description,
                    nodes: convertedWorkflow.nodes,
                    triggerNode: convertedWorkflow.triggerNode,
                    connections: convertedWorkflow.connections
                },
                summary: {
                    totalNodes: analysis.totalNodes || originalNodeCount,
                    supportedNodes: analysis.convertedNodes || 0,
                    unsupportedNodes: analysis.unsupportedNodes || 0,
                    ignoredNodes: analysis.ignoredNodes || 0,
                    triggerNode: analysis.triggerNodes || 0,
                    
                    // Detailed categorization
                    aiNodes: analysis.aiNodes || 0,
                    appNodes: analysis.appNodes || 0,
                    dataNodes: analysis.dataNodes || 0,
                    logicNodes: analysis.logicNodes || 0,
                    integrationNodes: analysis.integrationNodes || 0,
                    
                    // Authentication requirements
                    authRequiredCount: analysis.authRequiredCount || 0,
                    authProviders: Array.from(analysis.authProviders || []),
                    authNodes: analysis.authNodes || []
                },
                migrationReport: {
                    flowAnalysis: convertedWorkflow.connections?._metadata || {},
                    nodeMapping: generateNodeMapping(n8nWorkflow.nodes, convertedWorkflow, analysis),
                    recommendations: generateMigrationRecommendations(analysis),
                    timestamp: new Date().toISOString()
                },
                metadata: {
                    originalFileName: req.file.originalname,
                    fileSize: req.file.size,
                    importedAt: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            res.json(response);

        } catch (error) {
            // Clean up uploaded file if it exists
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            
            console.error('N8n import error:', error);
            
            res.status(500).json({
                success: false,
                error: 'Conversion failed',
                details: error.message
            });
        }
    });
}

/**
 * FastAPI/Python integration handler (pseudo-code)
 * This would be the equivalent for a Python/FastAPI backend
 */
const fastApiHandler = `
from fastapi import APIRouter, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import json
import tempfile
import os
from typing import Dict, Any

# Import your Python converter
from .converter import validate_n8n_file, convert_workflow

router = APIRouter()

@router.post("/api/import/n8n")
async def import_n8n_workflow(n8n_file: UploadFile):
    """Import n8n workflow and convert to Lamatic.ai format"""
    
    # Validate file type
    if not n8n_file.filename.endswith('.json'):
        raise HTTPException(status_code=400, detail="Only JSON files are allowed")
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(mode='w+b', delete=False, suffix='.json') as tmp_file:
        content = await n8n_file.read()
        tmp_file.write(content)
        tmp_file_path = tmp_file.name
    
    try:
        # Parse JSON
        with open(tmp_file_path, 'r') as f:
            n8n_workflow = json.load(f)
        
        # Validate workflow
        validation = validate_n8n_file(n8n_workflow)
        if not validation['valid']:
            raise HTTPException(status_code=400, detail=validation['error'])
        
        # Convert workflow
        converted = convert_workflow(n8n_workflow)
        
        # Prepare response
        response = {
            "success": True,
            "workflow": {
                "name": converted.get("name"),
                "description": converted.get("description"),
                "nodes": converted.get("nodes", []),
                "triggerNode": converted.get("triggerNode"),
                "connections": converted.get("connections", {})
            },
            "migration": {
                "summary": converted.get("metadata", {}).get("analysis", {}),
                "report": {
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
        }
        
        return JSONResponse(content=response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_file_path):
            os.unlink(tmp_file_path)
`;

/**
 * Generate node mapping information for the migration report
 */
function generateNodeMapping(originalNodes, convertedWorkflow, analysis) {
    const mapping = {
        successful: [],
        unsupported: [],
        ignored: []
    };

    originalNodes.forEach(node => {
        const nodeInfo = {
            name: node.name,
            originalType: node.type,
            parameters: Object.keys(node.parameters || {}).length
        };

        // Check if it's a sticky note (ignored)
        if (node.type === 'n8n-nodes-base.stickyNote') {
            mapping.ignored.push({
                ...nodeInfo,
                reason: 'UI element - not functional node'
            });
        } else {
            // Check if node was converted
            const wasConverted = convertedWorkflow.nodes?.some(n => n.nodeName === node.name) || 
                               convertedWorkflow.triggerNode?.nodeName === node.name;

            if (wasConverted) {
                const convertedNode = convertedWorkflow.nodes?.find(n => n.nodeName === node.name) || 
                                    convertedWorkflow.triggerNode;
                mapping.successful.push({
                    ...nodeInfo,
                    convertedType: convertedNode.nodeType,
                    flowContext: convertedNode._flowMetadata?.flowContext || 'linear'
                });
            } else {
                mapping.unsupported.push({
                    ...nodeInfo,
                    reason: 'No direct mapping available - requires manual implementation'
                });
            }
        }
    });

    return mapping;
}

/**
 * Generate migration recommendations based on analysis
 */
function generateMigrationRecommendations(analysis) {
    const recommendations = [];

    // Basic conversion recommendations
    if (analysis.unsupportedNodes > 0) {
        recommendations.push({
            type: 'warning',
            category: 'Node Conversion',
            title: 'Manual Review Required',
            description: `${analysis.unsupportedNodes} node(s) require manual implementation using Lamatic AI's features.`,
            priority: 'high'
        });
    }

    // Auth requirements
    if (analysis.authRequiredCount > 0) {
        recommendations.push({
            type: 'action',
            category: 'Authentication',
            title: 'Re-authentication Required',
            description: `${analysis.authRequiredCount} node(s) require credential setup: ${Array.from(analysis.authProviders || []).join(', ')}`,
            priority: 'high',
            action: 'setup_credentials'
        });
    }

    // AI enhancement opportunities
    if (analysis.aiNodes > 0) {
        recommendations.push({
            type: 'tip',
            category: 'AI Enhancement',
            title: 'AI Nodes Available',
            description: `${analysis.aiNodes} AI node(s) provide intelligent processing. Consider optimizing prompts for better results.`,
            priority: 'medium',
            action: 'optimize_ai'
        });
    }

    // General migration guidance
    recommendations.push({
        type: 'info',
        category: 'Migration',
        title: 'Test Before Production',
        description: 'Run comprehensive tests on your migrated workflow before deploying to production.',
        priority: 'high',
        action: 'test_workflow'
    });

    return recommendations;
}

/**
 * Middleware to ensure the temp directory exists
 */
function ensureTempDirectory() {
    const tempDir = 'temp/n8n-imports';
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
}

/**
 * Cleanup old temporary files (call this periodically)
 */
function cleanupTempFiles() {
    const tempDir = 'temp/n8n-imports';
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    if (!fs.existsSync(tempDir)) return;
    
    fs.readdir(tempDir, (err, files) => {
        if (err) return;
        
        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                
                if (Date.now() - stats.mtime.getTime() > maxAge) {
                    fs.unlink(filePath, () => {});
                }
            });
        });
    });
}

/**
 * Setup function to initialize the n8n import feature
 */
function setupN8nImport(app, options = {}) {
    const {
        endpoint = '/api/import/n8n',
        tempDir = 'temp/n8n-imports',
        maxFileSize = 10 * 1024 * 1024,
        cleanupInterval = 60 * 60 * 1000 // 1 hour
    } = options;

    // Ensure temp directory exists
    ensureTempDirectory();

    // Setup cleanup interval
    setInterval(cleanupTempFiles, cleanupInterval);

    // Register the route
    app.post(endpoint, handleN8nImport);

    console.log(`N8n import endpoint registered at ${endpoint}`);
}

module.exports = {
    handleN8nImport,
    setupN8nImport,
    ensureTempDirectory,
    cleanupTempFiles,
    generateNodeMapping,
    generateMigrationRecommendations,
    fastApiHandler // For Python integration reference
};
