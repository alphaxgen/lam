/**
 * N8n to Lamatic Workflow Converter
 * Transforms n8n workflow JSON files into Lamatic workflow format
 */

// Comprehensive n8n to Lamatic.ai migration mapping - handles ALL edge cases
const MIGRATION_MAPPINGS = {
    // =============== TRIGGER NODES ===============
    'n8n-nodes-base.webhook': {
        lamaticType: 'webhookTriggerNode',
        description: 'Direct webhook trigger replacement',
        category: 'trigger'
    },
    'n8n-nodes-base.formTrigger': {
        lamaticType: 'webhookTriggerNode', 
        description: 'Form becomes webhook + data processing',
        category: 'trigger'
    },
    'n8n-nodes-base.manualTrigger': {
        lamaticType: 'webhookTriggerNode',
        description: 'Manual trigger becomes webhook',
        category: 'trigger'
    },
    'n8n-nodes-base.scheduleTrigger': {
        lamaticType: 'webhookTriggerNode',
        description: 'Schedule trigger becomes webhook',
        category: 'trigger'
    },
    
    // =============== AI & LLM NODES ===============
    'n8n-nodes-base.openAi': {
        lamaticType: 'LLMNode',
        description: 'OpenAI integration'
    },
    '@n8n/n8n-nodes-langchain.agent': {
        lamaticType: 'agentNode',
        description: 'Advanced AI agent with multiple capabilities'
    },
    '@n8n/n8n-nodes-langchain.lmChatOpenRouter': {
        lamaticType: 'LLMNode',
        description: 'OpenRouter LLM model'
    },
    '@n8n/n8n-nodes-langchain.lmChatGoogleGemini': {
        lamaticType: 'LLMNode',
        description: 'Google Gemini LLM model'
    },
    '@n8n/n8n-nodes-langchain.lmChatOpenAi': {
        lamaticType: 'LLMNode',
        description: 'OpenAI LLM model'
    },
    '@n8n/n8n-nodes-langchain.lmChatAnthropic': {
        lamaticType: 'LLMNode',
        description: 'Anthropic LLM model'
    },
    '@n8n/n8n-nodes-langchain.outputParserStructured': {
        lamaticType: 'LLMNode',
        description: 'Structured output parsing via AI'
    },
    '@n8n/n8n-nodes-langchain.memoryBufferWindow': {
        lamaticType: 'LLMNode',
        description: 'Memory management for conversations'
    },
    '@n8n/n8n-nodes-langchain.vectorStoreSupabase': {
        lamaticType: 'LLMNode',
        description: 'Vector database operations'
    },
    '@n8n/n8n-nodes-langchain.vectorStorePinecone': {
        lamaticType: 'LLMNode',
        description: 'Pinecone vector database'
    },
    
    // =============== DATA MANIPULATION ===============
    'n8n-nodes-base.set': {
        lamaticType: 'LLMNode',
        description: 'Data transformation via AI'
    },
    'n8n-nodes-base.function': {
        lamaticType: 'codeNode',
        description: 'JavaScript function execution'
    },
    'n8n-nodes-base.functionItem': {
        lamaticType: 'codeNode',
        description: 'JavaScript function per item'
    },
    'n8n-nodes-base.code': {
        lamaticType: 'codeNode',
        description: 'Code execution'
    },
    'n8n-nodes-base.json': {
        lamaticType: 'LLMNode',
        description: 'JSON manipulation via AI'
    },
    'n8n-nodes-base.merge': {
        lamaticType: 'LLMNode',
        description: 'Data merging via AI'
    },
    'n8n-nodes-base.itemLists': {
        lamaticType: 'LLMNode',
        description: 'List operations via AI'
    },
    
    // =============== LOGIC & FLOW CONTROL ===============
    'n8n-nodes-base.switch': {
        lamaticType: 'branchNode',
        description: 'Conditional branching logic'
    },
    'n8n-nodes-base.if': {
        lamaticType: 'branchNode',
        description: 'Conditional logic'
    },
    'n8n-nodes-base.filter': {
        lamaticType: 'LLMNode',
        description: 'Data filtering via AI'
    },
    'n8n-nodes-base.wait': {
        lamaticType: 'LLMNode',
        description: 'Delay operations'
    },
    'n8n-nodes-base.noOp': {
        lamaticType: 'LLMNode',
        description: 'Pass-through node'
    },
    
    // =============== COMMUNICATION PLATFORMS ===============
    'n8n-nodes-base.slack': {
        lamaticType: 'slackNode',
        description: 'Slack integration'
    },
    'n8n-nodes-base.gmail': {
        lamaticType: 'gmailNode', 
        description: 'Gmail integration'
    },
    'n8n-nodes-base.microsoftTeams': {
        lamaticType: 'teamsNode',
        description: 'Microsoft Teams integration'
    },
    'n8n-nodes-base.discord': {
        lamaticType: 'LLMNode',
        description: 'Discord integration via AI'
    },
    'n8n-nodes-base.telegram': {
        lamaticType: 'LLMNode',
        description: 'Telegram integration via AI'
    },
    'n8n-nodes-base.whatsApp': {
        lamaticType: 'LLMNode',
        description: 'WhatsApp integration via AI'
    },
    
    // =============== STORAGE & FILES ===============
    'n8n-nodes-base.googleDrive': {
        lamaticType: 'LLMNode',
        description: 'Google Drive operations via AI'
    },
    'n8n-nodes-base.dropbox': {
        lamaticType: 'LLMNode',
        description: 'Dropbox operations via AI'
    },
    'n8n-nodes-base.oneDrive': {
        lamaticType: 'LLMNode',
        description: 'OneDrive operations via AI'
    },
    'n8n-nodes-base.s3': {
        lamaticType: 'LLMNode',
        description: 'AWS S3 operations via AI'
    },
    
    // =============== DATABASES ===============
    'n8n-nodes-base.airtable': {
        lamaticType: 'LLMNode',
        description: 'Airtable operations via AI'
    },
    'n8n-nodes-base.postgres': {
        lamaticType: 'LLMNode',
        description: 'PostgreSQL operations via AI'
    },
    'n8n-nodes-base.mysql': {
        lamaticType: 'LLMNode',
        description: 'MySQL operations via AI'
    },
    'n8n-nodes-base.mongodb': {
        lamaticType: 'LLMNode',
        description: 'MongoDB operations via AI'
    },
    'n8n-nodes-base.redis': {
        lamaticType: 'LLMNode',
        description: 'Redis operations via AI'
    },
    
    // =============== HTTP & API ===============
    'n8n-nodes-base.httpRequest': {
        lamaticType: 'LLMNode',
        description: 'HTTP requests via AI'
    },
    'n8n-nodes-base.webhook': {
        lamaticType: 'webhookTriggerNode',
        description: 'Webhook receiver',
        category: 'trigger'
    },
    
    // =============== WORKFLOW EXECUTION ===============
    'n8n-nodes-base.executeWorkflow': {
        lamaticType: 'LLMNode',
        description: 'Execute workflow via AI orchestration'
    },
    'n8n-nodes-base.respondToWebhook': {
        lamaticType: 'LLMNode',
        description: 'Webhook response via AI'
    },
    'n8n-nodes-base.error': {
        lamaticType: 'LLMNode',
        description: 'Error handling via AI'
    },
    'n8n-nodes-base.split': {
        lamaticType: 'LLMNode',
        description: 'Data splitting via AI'
    },
    'n8n-nodes-base.aggregate': {
        lamaticType: 'LLMNode',
        description: 'Data aggregation via AI'
    },
    
    // =============== IGNORE THESE (UI ELEMENTS) ===============
    'n8n-nodes-base.stickyNote': {
        ignore: true,
        description: 'UI annotation - ignored'
    }
};

// Extract simple mapping for compatibility
const NODE_TYPE_MAPPINGS = Object.fromEntries(
    Object.entries(MIGRATION_MAPPINGS).map(([n8nType, config]) => [n8nType, config.lamaticType])
);

/**
 * Validates if the uploaded file is a valid n8n workflow
 */
function validateN8nFile(workflow) {
    try {
        // Check if it's a valid JSON object
        if (!workflow || typeof workflow !== 'object') {
            return { valid: false, error: 'Invalid JSON format' };
        }

        // Check for required n8n workflow properties
        if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
            return { valid: false, error: 'Missing or invalid nodes array' };
        }

        if (!workflow.connections || typeof workflow.connections !== 'object') {
            return { valid: false, error: 'Missing or invalid connections object' };
        }

        // Check if we have at least one supported node
        const supportedNodes = workflow.nodes.filter(node => 
            NODE_TYPE_MAPPINGS.hasOwnProperty(node.type)
        );

        if (supportedNodes.length === 0) {
            return { 
                valid: false, 
                error: `No supported node types found. Supported types: ${Object.keys(NODE_TYPE_MAPPINGS).join(', ')}` 
            };
        }

        return { valid: true };

    } catch (error) {
        return { valid: false, error: `Validation error: ${error.message}` };
    }
}

/**
 * Converts n8n workflow to Lamatic format
 */
function convertWorkflow(n8nWorkflow) {
    try {
        // Process nodes and get statistics
        const { triggerNode, actionNodes, conversionStats, nodeIdMap } = processNodes(n8nWorkflow.nodes, n8nWorkflow.connections);

        // Build Lamatic.ai connections for flow visualization with comprehensive flow analysis
        const lamaticConnections = buildLamaticConnections(n8nWorkflow.connections, nodeIdMap, n8nWorkflow.nodes);

        // Create Lamatic.ai format workflow with proper name and connections
        const laMaticdWorkflow = {
            name: n8nWorkflow.name || 'Converted Workflow',
            description: `Migrated from n8n: ${n8nWorkflow.name || 'Unnamed Workflow'}`,
            triggerNode: triggerNode || {
                nodeId: 'triggerNode_1',
                nodeType: 'webhookTriggerNode',
                nodeName: 'Webhook',
                values: {},
                modes: {}
            },
            nodes: actionNodes,
            connections: lamaticConnections, // Add explicit connections for flow visualization
            _conversionStats: conversionStats // Internal stats for accurate counting
        };

        return laMaticdWorkflow;

    } catch (error) {
        throw new Error(`Conversion failed: ${error.message}`);
    }
}

/**
 * Processes n8n nodes and separates trigger from action nodes
 */
function processNodes(n8nNodes, n8nConnections) {
    let triggerNode = null;
    const actionNodes = [];
    const nodeMap = new Map();
    const nodeIdMap = new Map(); // Maps n8n node names to Lamatic nodeIds
    
    // Track conversion statistics
    const conversionStats = {
        originalCount: n8nNodes.length,
        ignoredCount: 0,
        unsupportedCount: 0,
        convertedCount: 0,
        triggerCount: 0,
        actionCount: 0
    };

    // Create a map of nodes for easy lookup
    n8nNodes.forEach(node => {
        nodeMap.set(node.name, node);
    });

    // First pass: Generate stable nodeIds for all supported nodes
    n8nNodes.forEach(node => {
        const config = MIGRATION_MAPPINGS[node.type];
        
        // Count ignored nodes (like sticky notes)
        if (config?.ignore) {
            conversionStats.ignoredCount++;
            return;
        }
        
        const mappedType = config?.lamaticType;
        if (mappedType) {
            if (mappedType === 'webhookTriggerNode') {
                nodeIdMap.set(node.name, 'triggerNode_1');
            } else {
                nodeIdMap.set(node.name, generateNodeId(node.name, mappedType));
            }
        }
    });

    // FLOW ANALYSIS: Analyze workflow patterns before processing nodes
    const flowAnalysis = analyzeWorkflowFlows(n8nNodes, n8nConnections, nodeIdMap);
    console.log(`🔍 Detected ${flowAnalysis.flowType.toUpperCase()} workflow with patterns: ${flowAnalysis.patterns.join(', ')}`);

    // Second pass: Process each node with stable dependencies and flow context
    n8nNodes.forEach(node => {
        const config = MIGRATION_MAPPINGS[node.type];
        
        // Skip ignored nodes (like sticky notes) - don't log warnings for these
        if (config?.ignore) {
            return;
        }
        
        const mappedType = config?.lamaticType;
        
        if (!mappedType) {
            console.warn(`Unsupported node type: ${node.type} (${node.name})`);
            conversionStats.unsupportedCount++;
            return;
        }

        const convertedNode = convertNodeWithStableIds(node, mappedType, n8nConnections, nodeMap, nodeIdMap, flowAnalysis);

        // Skip null nodes (like LangChain model nodes that get merged)
        if (!convertedNode) {
            conversionStats.unsupportedCount++;
            return;
        }

        // Determine if this is a trigger node
        if (config?.category === 'trigger' || mappedType === 'webhookTriggerNode') {
            triggerNode = convertedNode;
            conversionStats.triggerCount++;
            conversionStats.convertedCount++;
        } else {
            actionNodes.push(convertedNode);
            conversionStats.actionCount++;
            conversionStats.convertedCount++;
        }
    });

    return { triggerNode, actionNodes, conversionStats, nodeIdMap };
}

/**
 * Creates specialized Lamatic.ai nodes with stable IDs that preserve n8n functionality
 */
function createSpecializedLamaticNodeWithStableId(n8nNode, laMaticdType, dependencies, nodeIdMap, flowAnalysis) {
    const nodeId = nodeIdMap.get(n8nNode.name);
    
    // Determine execution order and flow context
    const executionOrder = flowAnalysis ? flowAnalysis.executionOrder.indexOf(n8nNode.name) : 0;
    const flowContext = determineNodeFlowContext(n8nNode.name, flowAnalysis);
    
    const baseNode = {
        nodeId: nodeId,
        nodeType: laMaticdType,
        nodeName: n8nNode.name,
        values: {},
        modes: {},
        needs: dependencies,
        _flowMetadata: {
            executionOrder: executionOrder,
            flowContext: flowContext,
            originalType: n8nNode.type
        }
    };

    return buildNodeByType(n8nNode, baseNode, laMaticdType);
}

/**
 * Determines flow context for a specific node
 */
function determineNodeFlowContext(nodeName, flowAnalysis) {
    if (!flowAnalysis) return 'linear';
    
    if (flowAnalysis.branches.has(nodeName)) {
        return 'branch_point';
    }
    if (flowAnalysis.mergePoints.has(nodeName)) {
        return 'merge_point';
    }
    if (flowAnalysis.errorHandling.has(nodeName)) {
        return 'error_handler';
    }
    
    // Check if node is in error handling flow
    if (nodeName.toLowerCase().includes('error') || 
        nodeName.toLowerCase().includes('catch') ||
        nodeName.toLowerCase().includes('retry')) {
        return 'error_flow';
    }
    
    return 'linear';
}

/**
 * Creates specialized Lamatic.ai nodes that preserve n8n functionality
 */
function createSpecializedLamaticNode(n8nNode, laMaticdType, dependencies) {
    const nodeId = generateNodeId(n8nNode.name, laMaticdType);
    const migrationConfig = MIGRATION_MAPPINGS[n8nNode.type];
    
    const baseNode = {
        nodeId: nodeId,
        nodeType: laMaticdType,
        nodeName: n8nNode.name,
        values: {},
        modes: {},
        needs: dependencies
    };

    return buildNodeByType(n8nNode, baseNode, laMaticdType);
}

/**
 * Builds node values based on n8n node type
 */
function buildNodeByType(n8nNode, baseNode, laMaticdType) {
    // Create node based on specific n8n node type and its function
    switch (n8nNode.type) {
        case 'n8n-nodes-base.webhook':
            return {
                nodeId: baseNode.nodeId || 'triggerNode_1',
                nodeType: 'webhookTriggerNode',
                nodeName: n8nNode.name,
                values: {
                    path: n8nNode.parameters?.path || '',
                    method: n8nNode.parameters?.httpMethod || 'POST',
                    description: `Webhook endpoint: ${n8nNode.parameters?.path || '/webhook'}`
                },
                modes: {}
            };
            
        case 'n8n-nodes-base.formTrigger':
            return {
                nodeId: baseNode.nodeId || 'triggerNode_1',
                nodeType: 'webhookTriggerNode',
                nodeName: n8nNode.parameters?.formTitle || n8nNode.name,
                values: {
                    description: `Form: ${n8nNode.parameters?.formDescription || ''}`,
                    expectedFields: n8nNode.parameters?.formFields?.values?.map(field => field.fieldLabel) || []
                },
                modes: {}
            };
        
        case 'n8n-nodes-base.manualTrigger':
        case 'n8n-nodes-base.scheduleTrigger':
            return {
                nodeId: baseNode.nodeId || 'triggerNode_1',
                nodeType: 'webhookTriggerNode',
                nodeName: n8nNode.name,
                values: {
                    description: `Converted from ${n8nNode.type}`,
                    originalType: n8nNode.type
                },
                modes: {}
            };
            
        case 'n8n-nodes-base.set':
            return {
                ...baseNode,
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: 'You are a data transformation assistant. Transform the input data according to the specified structure.',
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: `Transform the data to this structure: ${n8nNode.parameters?.jsonOutput || JSON.stringify(n8nNode.parameters, null, 2)}`,
                            role: 'user'
                        }
                    ],
                    tools: ['data_transformation', 'json_processing'],
                    credentials: '',
                    messages: '[]',
                    memories: '[]',
                    attachments: ''
                }
            };
            
        case 'n8n-nodes-base.googleDrive':
            return {
                ...baseNode,
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: 'You are a file management assistant with Google Drive access.',
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: `Perform this operation: ${n8nNode.parameters?.resource || 'file'} - ${n8nNode.parameters?.operation || 'create'} with name: ${n8nNode.parameters?.name || ''}`,
                            role: 'user'
                        }
                    ],
                    tools: ['google_drive_api', 'file_operations', 'folder_management'],
                    credentials: '',
                    messages: '[]',
                    memories: '[]',
                    attachments: ''
                }
            };
            
        case '@n8n/n8n-nodes-langchain.agent':
            return {
                ...baseNode,
                nodeType: 'agentNode',
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: n8nNode.parameters?.options?.systemMessage || 'You are an AI Assistant specialized in creative content generation.',
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: n8nNode.parameters?.text || 'Generate creative assets based on the provided brand guidelines and product information.',
                            role: 'user'
                        }
                    ],
                    agents: [
                        {
                            name: 'Creative Director',
                            description: 'Generates multiple creative concepts for marketing assets',
                            schema: {}
                        }
                    ],
                    tools: ['image_generation', 'content_creation', 'brand_guidelines'],
                    messages: '[]',
                    stopWord: '',
                    maxIterations: 5,
                    connectedTo: ''
                }
            };
            
        case '@n8n/n8n-nodes-langchain.lmChatOpenRouter':
        case '@n8n/n8n-nodes-langchain.lmChatGoogleGemini':
        case '@n8n/n8n-nodes-langchain.lmChatOpenAi':
        case '@n8n/n8n-nodes-langchain.lmChatAnthropic':
            return {
                ...baseNode,
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: 'You are an AI assistant powered by ' + (n8nNode.parameters?.model || 'advanced language model'),
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: 'Process the input and provide helpful responses.',
                            role: 'user'
                        }
                    ],
                    tools: ['chat_completion', 'text_generation'],
                    credentials: '',
                    messages: '[]',
                    memories: '[]',
                    attachments: ''
                }
            };
        
        case '@n8n/n8n-nodes-langchain.memoryBufferWindow':
            return {
                ...baseNode,
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: 'You are a conversation memory manager. Maintain context and history of the conversation.',
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: `Manage conversation memory with window size: ${n8nNode.parameters?.maxTokenLimit || 'default'}`,
                            role: 'user'
                        }
                    ],
                    tools: ['memory_management', 'conversation_history'],
                    credentials: '',
                    messages: '[]',
                    memories: '[]',
                    attachments: ''
                }
            };
        
        case '@n8n/n8n-nodes-langchain.vectorStoreSupabase':
        case '@n8n/n8n-nodes-langchain.vectorStorePinecone':
            return {
                ...baseNode,
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: 'You are a vector database assistant. Handle document storage, retrieval, and similarity search.',
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: `Perform vector operations on the ${n8nNode.type.includes('Supabase') ? 'Supabase' : 'Pinecone'} database.`,
                            role: 'user'
                        }
                    ],
                    tools: ['vector_search', 'document_embedding', 'similarity_search'],
                    credentials: '',
                    messages: '[]',
                    memories: '[]',
                    attachments: ''
                }
            };
            
        case '@n8n/n8n-nodes-langchain.outputParserStructured':
            return {
                ...baseNode,
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: 'You are a structured data parser. Parse and format AI responses according to specific schemas.',
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: `Parse the output according to this schema: ${n8nNode.parameters?.jsonSchemaExample || '{}'}`,
                            role: 'user'
                        }
                    ],
                    tools: ['json_parsing', 'schema_validation', 'data_structuring'],
                    credentials: '',
                    messages: '[]',
                    memories: '[]',
                    attachments: ''
                }
            };
            
        case 'n8n-nodes-base.code':
            return {
                ...baseNode,
                values: {
                    code: n8nNode.parameters?.jsCode || '// Converted from n8n code node\nreturn items;'
                }
            };
            
        case 'n8n-nodes-base.switch':
            const conditions = n8nNode.parameters?.rules?.values || [];
            return {
                ...baseNode,
                values: {
                    branches: conditions.map((rule, index) => ({
                        label: `Condition ${index + 1}`,
                        value: `${baseNode.nodeId}-branch_${index + 1}`
                    }))
                },
                branches: conditions.map((rule, index) => ({
                    label: `Condition ${index + 1}`,
                    value: `plus-node-addNode_${Math.floor(Math.random() * 1000000)}`
                }))
            };
            
        case 'n8n-nodes-base.httpRequest':
            return {
                ...baseNode,
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: 'You are an API integration assistant. Make HTTP requests and process responses.',
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: `Make a ${n8nNode.parameters?.method || 'GET'} request to: ${n8nNode.parameters?.url || ''} with the provided data.`,
                            role: 'user'
                        }
                    ],
                    tools: ['http_requests', 'api_calls', 'image_generation_api'],
                    credentials: '',
                    messages: '[]',
                    memories: '[]',
                    attachments: ''
                }
            };
            
        // Communication nodes
        case 'n8n-nodes-base.gmail':
            return {
                ...baseNode,
                values: {
                    credentials: '',
                    action: n8nNode.parameters?.operation || 'send',
                    recipient_email: n8nNode.parameters?.toList || n8nNode.parameters?.to || '',
                    cc: '',
                    bcc: '',
                    subject: n8nNode.parameters?.subject || '',
                    body: n8nNode.parameters?.message || n8nNode.parameters?.body || '',
                    is_html: false,
                    max_results: 10,
                    from_user: '',
                    to_user: ''
                }
            };
            
        case 'n8n-nodes-base.slack':
            return {
                ...baseNode,
                values: {
                    credentials: '',
                    action: n8nNode.parameters?.operation || 'postMessage',
                    channel: n8nNode.parameters?.channel || '',
                    message: n8nNode.parameters?.text || n8nNode.parameters?.message || '',
                    thread_ts: '',
                    username: '',
                    icon_emoji: '',
                    icon_url: ''
                }
            };
        
        case 'n8n-nodes-base.executeWorkflow':
            return {
                ...baseNode,
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: 'You are a workflow orchestration assistant. Execute workflows and manage sub-workflow calls.',
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: `Execute workflow: ${n8nNode.parameters?.workflowId || 'specified workflow'} with the provided parameters.`,
                            role: 'user'
                        }
                    ],
                    tools: ['workflow_execution', 'sub_workflow_calls', 'process_orchestration'],
                    credentials: '',
                    messages: '[]',
                    memories: '[]',
                    attachments: ''
                }
            };
        
        case 'n8n-nodes-base.respondToWebhook':
            return {
                ...baseNode,
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: 'You are a webhook response assistant. Generate appropriate responses for incoming webhook requests.',
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: `Generate webhook response with status: ${n8nNode.parameters?.responseCode || 200} and message: ${n8nNode.parameters?.responseData || 'Success'}`,
                            role: 'user'
                        }
                    ],
                    tools: ['webhook_response', 'http_response_generation', 'status_codes'],
                    credentials: '',
                    messages: '[]',
                    memories: '[]',
                    attachments: ''
                }
            };
            
        default:
            // Generic LLM node for unsupported types
            return {
                ...baseNode,
                values: {
                    prompts: [
                        {
                            id: generateId(),
                            content: `You are an AI assistant handling ${n8nNode.type} functionality.`,
                            role: 'system'
                        },
                        {
                            id: generateId(),
                            content: `Process the input data according to the original node configuration: ${JSON.stringify(n8nNode.parameters, null, 2)}`,
                            role: 'user'
                        }
                    ],
                    tools: [],
                    credentials: '',
                    messages: '[]',
                    memories: '[]',
                    attachments: ''
                }
            };
    }
}

/**
 * Converts a single n8n node to Lamatic format with stable IDs
 */
function convertNodeWithStableIds(n8nNode, laMaticdType, n8nConnections, nodeMap, nodeIdMap, flowAnalysis) {
    const dependencies = buildDependencies(n8nNode.name, n8nConnections, nodeMap)
        .map(dep => nodeIdMap.get(dep))
        .filter(id => id); // Remove undefined dependencies
    
    return createSpecializedLamaticNodeWithStableId(n8nNode, laMaticdType, dependencies, nodeIdMap, flowAnalysis);
}

/**
 * Converts a single n8n node to Lamatic format with full functionality preservation (legacy)
 */
function convertNode(n8nNode, laMaticdType, n8nConnections, nodeMap) {
    const dependencies = buildDependencies(n8nNode.name, n8nConnections, nodeMap)
        .map(dep => generateNodeId(dep, getNodeTypeByName(dep, nodeMap)));
    
    return createSpecializedLamaticNode(n8nNode, laMaticdType, dependencies);
}

/**
 * Converts n8n node parameters to Lamatic settings format
 */
function convertNodeSettings(n8nNode, laMaticdType) {
    const settings = {
        originalType: n8nNode.type,
        position: n8nNode.position || { x: 0, y: 0 },
        enabled: !n8nNode.disabled,
        parameters: n8nNode.parameters || {}
    };

    // Add any type-specific settings conversion logic here
    return settings;
}

/**
 * Builds dependency array (needs) based on n8n connections
 */
function buildDependencies(nodeName, n8nConnections, nodeMap) {
    const dependencies = [];
    
    // Look through all connections to find what this node depends on
    for (const [sourceNodeName, connections] of Object.entries(n8nConnections)) {
        if (connections.main && Array.isArray(connections.main)) {
            connections.main.forEach(outputConnections => {
                if (Array.isArray(outputConnections)) {
                    outputConnections.forEach(connection => {
                        if (connection.node === nodeName) {
                            // This node depends on sourceNodeName
                            const sourceNode = nodeMap.get(sourceNodeName);
                            if (sourceNode && NODE_TYPE_MAPPINGS[sourceNode.type]) {
                                dependencies.push(sourceNodeName);
                            }
                        }
                    });
                }
            });
        }
    }

    return [...new Set(dependencies)]; // Remove duplicates
}

/**
 * Generates a unique ID for nodes
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 4) + '-' + Math.random().toString(36).substr(2, 4) + '-' + Math.random().toString(36).substr(2, 4) + '-' + Math.random().toString(36).substr(2, 12);
}

/**
 * Advanced flow analysis for comprehensive workflow patterns
 */
function analyzeWorkflowFlows(n8nNodes, n8nConnections, nodeIdMap) {
    const flowAnalysis = {
        flowType: 'unknown',
        patterns: [],
        executionOrder: [],
        dependencies: new Map(),
        errorHandling: new Map(),
        branches: new Map(),
        mergePoints: new Map()
    };

    // 1. ANALYZE FLOW PATTERNS
    const nodeMap = new Map(n8nNodes.map(node => [node.name, node]));
    const incomingConnections = new Map();
    const outgoingConnections = new Map();

    // Build connection maps
    for (const [sourceNode, connections] of Object.entries(n8nConnections)) {
        outgoingConnections.set(sourceNode, []);
        
        if (connections.main) {
            connections.main.forEach((outputGroup, outputIndex) => {
                outputGroup.forEach(target => {
                    // Track outgoing
                    outgoingConnections.get(sourceNode).push({
                        target: target.node,
                        type: 'main',
                        outputIndex,
                        targetIndex: target.index
                    });
                    
                    // Track incoming
                    if (!incomingConnections.has(target.node)) {
                        incomingConnections.set(target.node, []);
                    }
                    incomingConnections.get(target.node).push({
                        source: sourceNode,
                        type: 'main',
                        outputIndex,
                        targetIndex: target.index
                    });
                });
            });
        }
    }

    // 2. DETECT FLOW TYPES
    const triggerNodes = n8nNodes.filter(node => MIGRATION_MAPPINGS[node.type]?.category === 'trigger');
    const endNodes = n8nNodes.filter(node => !outgoingConnections.has(node.name) || outgoingConnections.get(node.name).length === 0);
    
    // 3. BRANCHING DETECTION (1 input → multiple outputs)
    for (const [nodeName, outputs] of outgoingConnections) {
        if (outputs.length > 1) {
            flowAnalysis.branches.set(nodeName, {
                type: 'branch',
                outputs: outputs,
                nodeId: nodeIdMap.get(nodeName)
            });
            flowAnalysis.patterns.push('branching');
        }
    }
    
    // 4. MERGING DETECTION (multiple inputs → 1 output)
    for (const [nodeName, inputs] of incomingConnections) {
        if (inputs.length > 1) {
            flowAnalysis.mergePoints.set(nodeName, {
                type: 'merge',
                inputs: inputs,
                nodeId: nodeIdMap.get(nodeName)
            });
            flowAnalysis.patterns.push('merging');
        }
    }
    
    // 5. ERROR HANDLING DETECTION
    n8nNodes.forEach(node => {
        if (node.type === 'n8n-nodes-base.error' || 
            node.name.toLowerCase().includes('error') ||
            node.name.toLowerCase().includes('catch')) {
            flowAnalysis.errorHandling.set(node.name, {
                type: 'errorHandler',
                nodeId: nodeIdMap.get(node.name)
            });
            flowAnalysis.patterns.push('errorHandling');
        }
    });

    // 6. DETERMINE OVERALL FLOW TYPE
    if (flowAnalysis.patterns.includes('branching') && flowAnalysis.patterns.includes('merging')) {
        flowAnalysis.flowType = 'complex'; // Branching + Merging
    } else if (flowAnalysis.patterns.includes('branching')) {
        flowAnalysis.flowType = 'branching'; // Just branching
    } else if (flowAnalysis.patterns.includes('merging')) {
        flowAnalysis.flowType = 'merging'; // Just merging
    } else if (flowAnalysis.patterns.includes('errorHandling')) {
        flowAnalysis.flowType = 'errorHandling'; // Error handling
    } else {
        flowAnalysis.flowType = 'linear'; // Simple linear flow
    }

    // 7. BUILD EXECUTION ORDER via topological sort
    flowAnalysis.executionOrder = buildExecutionOrder(n8nNodes, n8nConnections, triggerNodes);
    
    return flowAnalysis;
}

/**
 * Builds execution order using topological sorting
 */
function buildExecutionOrder(nodes, connections, triggerNodes) {
    const visited = new Set();
    const visiting = new Set();
    const order = [];
    
    function visit(nodeName) {
        if (visiting.has(nodeName)) {
            // Circular dependency - handle gracefully
            return;
        }
        if (visited.has(nodeName)) {
            return;
        }
        
        visiting.add(nodeName);
        
        // Visit dependencies first
        if (connections[nodeName]?.main) {
            connections[nodeName].main.forEach(outputGroup => {
                outputGroup.forEach(target => {
                    visit(target.node);
                });
            });
        }
        
        visiting.delete(nodeName);
        visited.add(nodeName);
        order.unshift(nodeName); // Add to beginning for reverse topological order
    }
    
    // Start from trigger nodes
    triggerNodes.forEach(trigger => visit(trigger.name));
    
    // Visit any remaining unvisited nodes
    nodes.forEach(node => {
        if (!visited.has(node.name)) {
            visit(node.name);
        }
    });
    
    return order;
}

/**
 * Builds comprehensive Lamatic.ai connections with all flow types
 */
function buildLamaticConnections(n8nConnections, nodeIdMap, n8nNodes) {
    const flowAnalysis = analyzeWorkflowFlows(n8nNodes, n8nConnections, nodeIdMap);
    const lamaticConnections = {};
    
    console.log(`🔄 Detected flow type: ${flowAnalysis.flowType.toUpperCase()}`);
    console.log(`📊 Flow patterns: ${flowAnalysis.patterns.join(', ')}`);
    
    // Build connections based on flow analysis
    for (const [sourceNodeName, connections] of Object.entries(n8nConnections)) {
        const sourceNodeId = nodeIdMap.get(sourceNodeName);
        if (!sourceNodeId) continue;
        
        lamaticConnections[sourceNodeId] = {
            flowType: flowAnalysis.flowType,
            executionOrder: flowAnalysis.executionOrder.indexOf(sourceNodeName),
            connections: {}
        };
        
        // 1. MAIN FLOW CONNECTIONS
        if (connections.main && Array.isArray(connections.main)) {
            lamaticConnections[sourceNodeId].connections.main = [];
            
            connections.main.forEach((outputConnections, outputIndex) => {
                if (Array.isArray(outputConnections)) {
                    const targets = outputConnections
                        .map(connection => {
                            const targetNodeId = nodeIdMap.get(connection.node);
                            if (!targetNodeId) return null;
                            
                            // Enhanced connection with flow context
                            return {
                                nodeId: targetNodeId,
                                type: connection.type || 'main',
                                index: connection.index || 0,
                                outputIndex: outputIndex,
                                flowContext: determineFlowContext(sourceNodeName, connection.node, flowAnalysis)
                            };
                        })
                        .filter(Boolean);
                    
                    if (targets.length > 0) {
                        lamaticConnections[sourceNodeId].connections.main.push(targets);
                    }
                }
            });
        }
        
        // 2. SPECIAL AI CONNECTIONS (LangChain)
        ['ai_languageModel', 'ai_outputParser', 'ai_memory', 'ai_vectorStore'].forEach(connectionType => {
            if (connections[connectionType]) {
                lamaticConnections[sourceNodeId].connections[connectionType] = connections[connectionType]
                    .map(outputConnections => 
                        outputConnections.map(connection => {
                            const targetNodeId = nodeIdMap.get(connection.node);
                            return targetNodeId ? {
                                nodeId: targetNodeId,
                                type: connectionType,
                                index: connection.index || 0,
                                flowContext: 'ai_pipeline'
                            } : null;
                        }).filter(Boolean)
                    ).filter(arr => arr.length > 0);
            }
        });
        
        // 3. ERROR HANDLING CONNECTIONS
        if (connections.error) {
            lamaticConnections[sourceNodeId].connections.error = connections.error
                .map(outputConnections => 
                    outputConnections.map(connection => {
                        const targetNodeId = nodeIdMap.get(connection.node);
                        return targetNodeId ? {
                            nodeId: targetNodeId,
                            type: 'error',
                            index: connection.index || 0,
                            flowContext: 'error_handling'
                        } : null;
                    }).filter(Boolean)
                ).filter(arr => arr.length > 0);
        }
    }
    
    // Add flow metadata
    lamaticConnections._flowMetadata = {
        flowType: flowAnalysis.flowType,
        patterns: flowAnalysis.patterns,
        executionOrder: flowAnalysis.executionOrder,
        branchCount: flowAnalysis.branches.size,
        mergeCount: flowAnalysis.mergePoints.size,
        errorHandlers: flowAnalysis.errorHandling.size
    };
    
    return lamaticConnections;
}

/**
 * Determines the flow context for a connection
 */
function determineFlowContext(sourceNode, targetNode, flowAnalysis) {
    if (flowAnalysis.branches.has(sourceNode)) {
        return 'branch_output';
    }
    if (flowAnalysis.mergePoints.has(targetNode)) {
        return 'merge_input';
    }
    if (flowAnalysis.errorHandling.has(targetNode)) {
        return 'error_handling';
    }
    return 'linear';
}

/**
 * Generates a nodeId in Lamatic format
 */
function generateNodeId(nodeName, nodeType) {
    const cleanName = nodeName.replace(/[^a-zA-Z0-9]/g, '');
    const randomNum = Math.floor(Math.random() * 1000);
    return `${nodeType}_${randomNum}`;
}

/**
 * Gets node type by node name from nodeMap
 */
function getNodeTypeByName(nodeName, nodeMap) {
    const node = nodeMap.get(nodeName);
    if (!node) return 'LLMNode'; // Default fallback
    const mappedType = NODE_TYPE_MAPPINGS[node.type];
    return mappedType || 'LLMNode';
}

module.exports = {
    validateN8nFile,
    convertWorkflow,
    NODE_TYPE_MAPPINGS,
    MIGRATION_MAPPINGS
};
