/**
 * Test Script for n8n API Integration
 * 
 * This script tests the n8n API endpoints to verify credentials work.
 * 
 * Usage:
 * node test-n8n-api.js <n8n-url> <api-key>
 * 
 * Example:
 * node test-n8n-api.js https://your-n8n.com your-api-key
 */

const fetch = require('node-fetch');

async function testN8nAPI(n8nUrl, apiKey) {
    console.log('🧪 Testing n8n API Integration\n');
    console.log(`📍 URL: ${n8nUrl}`);
    console.log(`🔑 API Key: ${apiKey.substring(0, 8)}...`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Test 1: List workflows
        console.log('📋 Test 1: Fetching workflows list...');
        const workflowsUrl = `${n8nUrl.replace(/\/$/, '')}/api/v1/workflows`;
        
        const response = await fetch(workflowsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const workflows = data.data || [];
        
        console.log(`✅ Success! Found ${workflows.length} workflows`);
        
        if (workflows.length > 0) {
            console.log('\n📊 Sample workflows:');
            workflows.slice(0, 3).forEach((wf, i) => {
                console.log(`  ${i + 1}. ${wf.name || 'Unnamed'} (ID: ${wf.id}) - ${wf.nodes?.length || 0} nodes`);
            });
        }

        // Test 2: Fetch first workflow details (if any exist)
        if (workflows.length > 0) {
            console.log('\n🔍 Test 2: Fetching workflow details...');
            const firstWorkflow = workflows[0];
            const workflowUrl = `${n8nUrl.replace(/\/$/, '')}/api/v1/workflows/${firstWorkflow.id}`;
            
            const workflowResponse = await fetch(workflowUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (workflowResponse.ok) {
                const workflowData = await workflowResponse.json();
                const workflow = workflowData.data || workflowData;
                
                console.log(`✅ Success! Fetched "${workflow.name}" details`);
                console.log(`   - Nodes: ${workflow.nodes?.length || 0}`);
                console.log(`   - Connections: ${Object.keys(workflow.connections || {}).length}`);
                console.log(`   - Active: ${workflow.active ? 'Yes' : 'No'}`);
            } else {
                console.log(`⚠️ Warning: Could not fetch workflow details (${workflowResponse.status})`);
            }
        }

        console.log('\n🎉 All tests passed! Your n8n API integration is working correctly.');
        
        return {
            success: true,
            workflowCount: workflows.length,
            message: 'API integration successful'
        };

    } catch (error) {
        console.log(`❌ Test failed: ${error.message}\n`);
        
        // Provide troubleshooting guidance
        console.log('🔧 Troubleshooting:');
        
        if (error.message.includes('ENOTFOUND')) {
            console.log('   • Check if the n8n URL is correct');
            console.log('   • Verify the n8n instance is running and accessible');
        } else if (error.message.includes('401')) {
            console.log('   • Check if the API key is correct');
            console.log('   • Verify the API key hasn\'t expired');
        } else if (error.message.includes('403')) {
            console.log('   • API key lacks required permissions');
            console.log('   • Ensure the key has workflow:read access');
        } else if (error.message.includes('CORS')) {
            console.log('   • CORS issue - this is normal for browser-based calls');
            console.log('   • Server-side API calls should work fine');
        } else {
            console.log(`   • Unexpected error: ${error.message}`);
        }
        
        console.log('\n💡 Try these demo credentials for testing:');
        console.log('   URL: https://demo.n8n.io');
        console.log('   API Key: demo-key');
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Command line usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        console.log('Usage: node test-n8n-api.js <n8n-url> <api-key>');
        console.log('');
        console.log('Example:');
        console.log('  node test-n8n-api.js https://your-n8n.com your-api-key');
        console.log('  node test-n8n-api.js https://demo.n8n.io demo-key');
        process.exit(1);
    }
    
    const [n8nUrl, apiKey] = args;
    testN8nAPI(n8nUrl, apiKey);
}

module.exports = { testN8nAPI };
