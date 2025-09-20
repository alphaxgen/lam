/**
 * N8n to Lamatic.ai Mapping Engine - Approach 2: API Integration (Bulk Migration)
 * 
 * Enterprise bulk migration server for streamlined large-scale workflow transitions.
 * 
 * User Flow: Enter n8n credentials → Fetch all workflows → Select → Bulk convert → Import to Lamatic
 * 
 * Features:
 * - n8n REST API integration for workflow fetching
 * - Bulk workflow selection and conversion
 * - Real-time progress tracking
 * - Demo environment with mock data fallback
 * - Production considerations documented for enterprise deployment
 * 
 * Note: For demo purposes, some API calls use mock data. Production deployment
 * requires additional security, compliance, and performance considerations.
 * 
 * @author Sparsh (Alpha)
 * @version 1.0.0
 * @since 2025
 */

const express = require('express');
const path = require('path');
const { setupN8nImport } = require('./api-handler');
const { setupBulkMigration } = require('./bulk-migration');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup API routes BEFORE static middleware
// Setup the n8n import feature (this is the one-line integration)
setupN8nImport(app, {
    endpoint: '/api/import/n8n',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    tempDir: 'temp/n8n-imports'
});

// Setup bulk migration feature
setupBulkMigration(app);

// Debug endpoint to verify API is working
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Lamatic Integration API is running',
        endpoints: [
            'GET /api/health',
            'POST /api/import/n8n',
            'POST /api/n8n/workflows', 
            'POST /api/n8n/bulk-convert'
        ],
        timestamp: new Date().toISOString()
    });
});

// Serve static files AFTER API routes
app.use(express.static(__dirname));

// Serve the Lamatic.ai integration demo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'example-integration.html'));
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
    console.log(`🎨 Lamatic.ai Integration Demo`);
    console.log(`📡 Running on http://localhost:${PORT}`);
    console.log(`✨ Features:`);
    console.log(`   📂 Single file import: /api/import/n8n`);
    console.log(`   📋 Bulk migration: /api/n8n/workflows`);
    console.log(`   🚀 Bulk convert: /api/n8n/bulk-convert`);
});

server.on('error', (err) => {
    console.error('❌ Demo Server Error:', err.message);
    if (err.code === 'EADDRINUSE') {
        console.error(`🚫 Port ${PORT} is already in use`);
    }
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('\n📴 Shutting down Lamatic.ai demo gracefully');
    server.close(() => {
        console.log('✅ Demo server closed successfully');
        process.exit(0);
    });
});
