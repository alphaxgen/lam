/**
 * N8n to Lamatic.ai Mapping Engine Server - Approach 1: File Upload Migration
 * 
 * Production-ready Express.js server for secure n8n workflow transformation.
 * 
 * User Flow: n8n → Export JSON → Upload to Lamatic → Parse → Display workflow
 * 
 * Features:
 * - Secure file upload with validation
 * - Complete local processing (no external API calls)
 * - Comprehensive conversion analytics
 * - Professional UI with detailed migration reports
 * - Enterprise-ready security and error handling
 * 
 * @author Sparsh (Alpha)
 * @version 1.0.0
 * @since 2025
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Express application
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
const upload = multer({ 
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
            cb(null, true);
        } else {
            cb(new Error('Only JSON files are allowed!'), false);
        }
    }
});
const { validateN8nFile, convertWorkflow } = require('./src/mapping-engine');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.post('/convert', upload.single('n8nFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read the uploaded file
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const n8nWorkflow = JSON.parse(fileContent);

        // Validate n8n file structure
        const validation = validateN8nFile(n8nWorkflow);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        // Convert to Lamatic format
        const laMaticdWorkflow = convertWorkflow(n8nWorkflow);

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Calculate accurate conversion statistics using internal stats
        const stats = laMaticdWorkflow._conversionStats || {};
        const originalNodeCount = n8nWorkflow.nodes?.length || 0;
        const convertedActionNodes = (laMaticdWorkflow.nodes || []).length;
        const convertedTriggerNodes = laMaticdWorkflow.triggerNode ? 1 : 0;
        const totalConvertedNodes = convertedActionNodes + convertedTriggerNodes;
        
        // Use accurate count from conversion stats if available
        const actuallySkipped = stats.unsupportedCount || (originalNodeCount - totalConvertedNodes - (stats.ignoredCount || 0));

            // Get precise analysis from converter
            const analysis = laMaticdWorkflow.metadata?.analysis || {};
            
            // Calculate precise statistics using the production analyzer
            const preciseSummary = {
                totalNodes: analysis.totalNodes || originalNodeCount,
                triggerNode: analysis.triggerNodes || 0,
                supportedNodes: analysis.convertedNodes || 0,
                unsupportedNodes: analysis.unsupportedNodes || 0,
                ignoredNodes: analysis.ignoredNodes || 0,
                
                // Detailed breakdowns
                aiNodes: analysis.aiNodes || 0,
                appNodes: analysis.appNodes || 0,
                dataNodes: analysis.dataNodes || 0,
                logicNodes: analysis.logicNodes || 0,
                integrationNodes: analysis.integrationNodes || 0,
                
                // Auth requirements
                authRequiredCount: analysis.authRequiredCount || 0,
                authProviders: Array.from(analysis.authProviders || []),
                authNodes: analysis.authNodes || []
            };

            // Enhanced response with perfect precision
            res.json({
                success: true,
                original: {
                    name: n8nWorkflow.name || 'Unnamed Workflow',
                    nodeCount: originalNodeCount,
                    fileName: req.file?.originalname || 'workflow.json'
                },
                converted: {
                    ...laMaticdWorkflow,
                    metadata: undefined // Remove internal metadata from response
                },
                summary: preciseSummary,
                migrationReport: {
                    flowAnalysis: laMaticdWorkflow.connections?._metadata || {},
                    nodeMapping: generateDetailedNodeMapping(n8nWorkflow.nodes, laMaticdWorkflow, analysis),
                    recommendations: generatePreciseRecommendations(analysis),
                    timestamp: new Date().toISOString()
                }
            });

    } catch (error) {
        // Clean up uploaded file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        console.error('❌ Conversion error:', error.message);
        console.error('📍 Stack trace:', error.stack);
        
        res.status(500).json({ 
            error: 'Conversion failed', 
            details: error.message,
            stack: error.stack.split('\n').slice(0, 5).join('\n') // First 5 lines of stack
        });
    }
});

function generateDetailedNodeMapping(originalNodes, convertedWorkflow, analysis) {
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

function generatePreciseRecommendations(analysis) {
    const recommendations = [];

    // Basic conversion recommendations based on precise analysis
    if (analysis.unsupportedNodes > 0) {
        recommendations.push({
            type: 'warning',
            category: 'Node Conversion',
            title: 'Manual Review Required',
            description: `${analysis.unsupportedNodes} node(s) require manual implementation using Lamatic AI's LLM nodes or alternative approaches.`,
            priority: 'high'
        });
    }

    // Auth requirements
    if (analysis.authRequiredCount > 0) {
        recommendations.push({
            type: 'warning',
            category: 'Authentication',
            title: 'Re-authentication Required',
            description: `${analysis.authRequiredCount} node(s) require credential setup: ${Array.from(analysis.authProviders || []).join(', ')}`,
            priority: 'high'
        });
    }

    // Flow complexity recommendations
    if (analysis.complexity === 'high') {
        recommendations.push({
            type: 'info',
            category: 'Flow Complexity',
            title: 'High Complexity Workflow',
            description: 'This workflow has high complexity. Test thoroughly to ensure all execution paths work correctly.',
            priority: 'medium'
        });
    }

    // AI enhancement opportunities
    if (analysis.aiNodes > 0) {
        recommendations.push({
            type: 'tip',
            category: 'AI Enhancement',
            title: 'AI Nodes Detected',
            description: `${analysis.aiNodes} AI node(s) provide intelligent processing capabilities. Consider leveraging additional AI features.`,
            priority: 'low'
        });
    }

    // App integration guidance
    if (analysis.appNodes > 0) {
        recommendations.push({
            type: 'info',
            category: 'App Integrations',
            title: 'External App Integrations',
            description: `${analysis.appNodes} external app integration(s) detected. Ensure all necessary permissions and credentials are configured.`,
            priority: 'medium'
        });
    }

    // General migration guidance
    recommendations.push({
        type: 'tip',
        category: 'Migration',
        title: 'Test Thoroughly',
        description: 'Run comprehensive tests on your migrated workflow before deploying to production.',
        priority: 'high'
    });

    return recommendations;
}

// Server startup moved to end of file

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Create src directory if it doesn't exist
if (!fs.existsSync('src')) {
    fs.mkdirSync('src');
}

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
}

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`🚀 N8N to Lamatic.ai Mapping Engine Server`);
    console.log(`📡 Running on http://localhost:${PORT}`);
    console.log(`✅ Server ready for production use`);
});
server.on('error', (err) => {
    console.error('❌ Server Error:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`🚫 Port ${PORT} is already in use`);
    }
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Promise Rejection');
    console.error('📝 Reason:', reason);
});

process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n📴 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});
