/**
 * Bulk N8n Migration Component
 * 
 * Provides UI for bulk n8n workflow migration.
 * 1. Enter n8n credentials
 * 2. Fetch all workflows
 * 3. Select which ones to migrate
 * 4. Bulk convert and import
 * 
 * @author Sparsh (Alpha)
 * @since 2025
 */

class BulkMigration {
    constructor(options = {}) {
        this.options = {
            onSuccess: options.onSuccess || (() => {}),
            onError: options.onError || (() => {}),
            onProgress: options.onProgress || (() => {}),
            apiBase: options.apiBase || '',
            ...options
        };
        
        this.dialog = null;
        this.workflows = [];
        this.selectedWorkflows = new Set();
        this.credentials = null;
    }

    showBulkMigrationDialog() {
        this.createDialog();
        this.dialog.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideBulkMigrationDialog() {
        if (this.dialog) {
            this.dialog.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    createDialog() {
        if (this.dialog) return;

        this.dialog = document.createElement('div');
        this.dialog.className = 'bulk-migration-overlay';
        this.dialog.innerHTML = `
            <div class="bulk-migration-dialog">
                <div class="bulk-migration-header">
                    <div class="header-content">
                        <div class="migration-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" stroke="currentColor" stroke-width="2"/>
                                <path d="M8 5v4M16 5v4" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="header-text">
                            <h2>Bulk Migration from n8n</h2>
                            <p>Connect to your n8n instance and migrate multiple workflows at once</p>
                        </div>
                    </div>
                    <button class="close-btn" onclick="this.closest('.bulk-migration-overlay').style.display='none'; document.body.style.overflow=''">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>

                <div class="bulk-migration-body">
                    <!-- Step 1: Credentials -->
                    <div class="step-container" id="credentialsStep">
                        <div class="step-header">
                            <h3>🔐 Connect to n8n Instance</h3>
                            <p>Enter your n8n credentials to fetch workflows</p>
                        </div>
                        
                        <div class="info-banner">
                            <div class="info-icon">💡</div>
                            <div class="info-content">
                                <strong>Need API credentials?</strong>
                                <p>Go to your n8n instance → Profile → Settings → API Keys → Create new key</p>
                                <details>
                                    <summary>Quick demo credentials</summary>
                                    <p><strong>URL:</strong> https://demo.n8n.io<br>
                                    <strong>API Key:</strong> demo-key<br>
                                    <small>Uses mock data for testing</small></p>
                                </details>
                            </div>
                        </div>
                        
                        <div class="credentials-form">
                            <div class="form-group">
                                <label for="n8nUrl">n8n Instance URL</label>
                                <input type="url" id="n8nUrl" placeholder="https://your-n8n-instance.com" />
                                <small class="input-help">Your n8n instance URL (e.g., https://mycompany.app.n8n.cloud)</small>
                            </div>
                            <div class="form-group">
                                <label for="apiKey">API Key</label>
                                <input type="password" id="apiKey" placeholder="Enter your n8n API key" />
                                <small class="input-help">Generated from n8n Settings → API Keys</small>
                            </div>
                            <div class="button-group">
                                <button class="btn-primary" id="connectBtn">Connect & Fetch Workflows</button>
                                <button class="btn-secondary" id="demoBtn">Try Demo</button>
                            </div>
                        </div>
                    </div>

                    <!-- Step 2: Workflow Selection -->
                    <div class="step-container" id="selectionStep" style="display: none;">
                        <div class="step-header">
                            <h3>📋 Select Workflows to Migrate</h3>
                            <p>Choose which workflows you want to convert and import</p>
                        </div>
                        <div class="workflow-selection">
                            <div class="selection-controls">
                                <button class="btn-secondary" id="selectAllBtn">Select All</button>
                                <button class="btn-secondary" id="selectNoneBtn">Select None</button>
                                <span class="selection-count">0 selected</span>
                            </div>
                            <div class="workflow-list" id="workflowList">
                                <!-- Workflows will be populated here -->
                            </div>
                        </div>
                    </div>

                    <!-- Step 3: Migration Progress -->
                    <div class="step-container" id="migrationStep" style="display: none;">
                        <div class="step-header">
                            <h3>🚀 Migration in Progress</h3>
                            <p>Converting and importing your selected workflows</p>
                        </div>
                        <div class="migration-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" id="migrationProgress"></div>
                            </div>
                            <div class="progress-text" id="migrationText">Starting migration...</div>
                            <div class="migration-results" id="migrationResults">
                                <!-- Results will be shown here -->
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bulk-migration-footer">
                    <button class="btn-secondary" id="cancelBtn">Cancel</button>
                    <button class="btn-primary" id="migrateBtn" style="display: none;">Migrate Selected</button>
                </div>
            </div>
        `;

        this.addStyles();
        this.bindEvents();
        document.body.appendChild(this.dialog);
    }

    bindEvents() {
        const connectBtn = this.dialog.querySelector('#connectBtn');
        const demoBtn = this.dialog.querySelector('#demoBtn');
        const selectAllBtn = this.dialog.querySelector('#selectAllBtn');
        const selectNoneBtn = this.dialog.querySelector('#selectNoneBtn');
        const migrateBtn = this.dialog.querySelector('#migrateBtn');
        const cancelBtn = this.dialog.querySelector('#cancelBtn');

        connectBtn.addEventListener('click', () => this.fetchWorkflows());
        demoBtn.addEventListener('click', () => this.fillDemoCredentials());
        selectAllBtn.addEventListener('click', () => this.selectAll());
        selectNoneBtn.addEventListener('click', () => this.selectNone());
        migrateBtn.addEventListener('click', () => this.startMigration());
        cancelBtn.addEventListener('click', () => this.hideBulkMigrationDialog());
    }

    fillDemoCredentials() {
        this.dialog.querySelector('#n8nUrl').value = 'https://demo.n8n.io';
        this.dialog.querySelector('#apiKey').value = 'demo-key';
    }

    async fetchWorkflows() {
        const n8nUrl = this.dialog.querySelector('#n8nUrl').value;
        const apiKey = this.dialog.querySelector('#apiKey').value;

        if (!n8nUrl || !apiKey) {
            this.showError('Please enter both n8n URL and API key');
            return;
        }

        try {
            const response = await fetch(`${this.options.apiBase}/api/n8n/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ n8nUrl, apiKey })
            });

            const result = await response.json();
            
            if (result.success) {
                this.workflows = result.workflows;
                this.credentials = { n8nUrl, apiKey };
                this.showWorkflowSelection();
            } else {
                this.showError(result.error || 'Failed to fetch workflows');
            }
        } catch (error) {
            this.showError('Connection failed: ' + error.message);
        }
    }

    showWorkflowSelection() {
        this.dialog.querySelector('#credentialsStep').style.display = 'none';
        this.dialog.querySelector('#selectionStep').style.display = 'block';
        this.dialog.querySelector('#migrateBtn').style.display = 'inline-flex';

        const workflowList = this.dialog.querySelector('#workflowList');
        workflowList.innerHTML = this.workflows.map(workflow => `
            <div class="workflow-item" data-id="${workflow.id}">
                <div class="workflow-checkbox">
                    <input type="checkbox" id="workflow-${workflow.id}" />
                </div>
                <div class="workflow-info">
                    <h4>${workflow.name}</h4>
                    <div class="workflow-meta">
                        <span class="node-count">${workflow.nodes} nodes</span>
                        <span class="status ${workflow.active ? 'active' : 'inactive'}">${workflow.active ? 'Active' : 'Inactive'}</span>
                        <span class="last-modified">Modified: ${workflow.lastModified}</span>
                    </div>
                    <div class="workflow-tags">
                        ${workflow.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // Bind checkbox events
        workflowList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateSelection());
        });
    }

    selectAll() {
        this.dialog.querySelectorAll('#workflowList input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
        });
        this.updateSelection();
    }

    selectNone() {
        this.dialog.querySelectorAll('#workflowList input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        this.updateSelection();
    }

    updateSelection() {
        const checkboxes = this.dialog.querySelectorAll('#workflowList input[type="checkbox"]');
        const selected = Array.from(checkboxes).filter(cb => cb.checked);
        
        this.selectedWorkflows = new Set(selected.map(cb => cb.id.replace('workflow-', '')));
        
        const count = this.selectedWorkflows.size;
        this.dialog.querySelector('.selection-count').textContent = `${count} selected`;
        
        const migrateBtn = this.dialog.querySelector('#migrateBtn');
        migrateBtn.disabled = count === 0;
        migrateBtn.textContent = `Migrate ${count} Workflow${count !== 1 ? 's' : ''}`;
    }

    async startMigration() {
        if (this.selectedWorkflows.size === 0) return;

        this.dialog.querySelector('#selectionStep').style.display = 'none';
        this.dialog.querySelector('#migrationStep').style.display = 'block';
        this.dialog.querySelector('#migrateBtn').style.display = 'none';

        try {
            const response = await fetch(`${this.options.apiBase}/api/n8n/bulk-convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    n8nUrl: this.credentials.n8nUrl,
                    apiKey: this.credentials.apiKey,
                    selectedWorkflows: Array.from(this.selectedWorkflows)
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showMigrationResults(result);
                this.options.onSuccess(result);
            } else {
                this.showError(result.error || 'Migration failed');
            }
        } catch (error) {
            this.showError('Migration failed: ' + error.message);
        }
    }

    showMigrationResults(result) {
        const progressBar = this.dialog.querySelector('#migrationProgress');
        const progressText = this.dialog.querySelector('#migrationText');
        const resultsContainer = this.dialog.querySelector('#migrationResults');

        progressBar.style.width = '100%';
        progressText.textContent = 'Migration complete!';

        resultsContainer.innerHTML = `
            <div class="migration-summary">
                <h4>Migration Summary</h4>
                <div class="summary-stats">
                    <div class="stat success">
                        <span class="stat-number">${result.summary.successful}</span>
                        <span class="stat-label">Successful</span>
                    </div>
                    <div class="stat error">
                        <span class="stat-number">${result.summary.failed}</span>
                        <span class="stat-label">Failed</span>
                    </div>
                    <div class="stat info">
                        <span class="stat-number">${result.summary.totalNodes}</span>
                        <span class="stat-label">Total Nodes</span>
                    </div>
                    <div class="stat warning">
                        <span class="stat-number">${result.summary.authRequired}</span>
                        <span class="stat-label">Need Auth</span>
                    </div>
                </div>
            </div>
            <div class="results-list">
                ${result.results.map(res => `
                    <div class="result-item ${res.success ? 'success' : 'error'}">
                        <span class="result-icon">${res.success ? '✅' : '❌'}</span>
                        <span class="result-name">${res.workflow?.name || res.id}</span>
                        ${res.success ? 
                            `<span class="result-details">${res.summary.convertedNodes}/${res.summary.totalNodes} nodes converted</span>` :
                            `<span class="result-error">${res.error}</span>`
                        }
                    </div>
                `).join('')}
            </div>
        `;
    }

    showError(message) {
        // Simple error display - in production, this would be more sophisticated
        alert('Error: ' + message);
    }

    addStyles() {
        if (document.querySelector('#bulk-migration-styles')) return;

        const style = document.createElement('style');
        style.id = 'bulk-migration-styles';
        style.textContent = `
            .bulk-migration-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.75);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                padding: 20px;
                backdrop-filter: blur(4px);
            }

            .bulk-migration-dialog {
                background: white;
                border-radius: 16px;
                width: 100%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                display: flex;
                flex-direction: column;
            }

            .bulk-migration-header {
                padding: 24px 24px 0;
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                border-bottom: 1px solid #f3f4f6;
                margin-bottom: 24px;
            }

            .header-content {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .migration-icon {
                width: 48px;
                height: 48px;
                background: #ff4757;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }

            .header-text h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: #111827;
            }

            .header-text p {
                margin: 4px 0 0;
                font-size: 14px;
                color: #6b7280;
            }

            .close-btn {
                background: none;
                border: none;
                padding: 8px;
                cursor: pointer;
                border-radius: 8px;
                color: #6b7280;
                transition: all 0.2s;
            }

            .close-btn:hover {
                background: #f3f4f6;
                color: #374151;
            }

            .bulk-migration-body {
                padding: 0 24px;
                flex: 1;
            }

            .step-container {
                margin-bottom: 24px;
            }

            .step-header h3 {
                margin: 0 0 8px;
                font-size: 18px;
                font-weight: 600;
                color: #111827;
            }

            .step-header p {
                margin: 0 0 16px;
                color: #6b7280;
            }

            .info-banner {
                background: #eff6ff;
                border: 1px solid #bfdbfe;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 20px;
                display: flex;
                gap: 12px;
                align-items: flex-start;
            }

            .info-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .info-content {
                flex: 1;
            }

            .info-content strong {
                color: #1e40af;
                font-size: 14px;
            }

            .info-content p {
                margin: 4px 0 0;
                font-size: 13px;
                color: #1e40af;
            }

            .info-content details {
                margin-top: 8px;
            }

            .info-content summary {
                cursor: pointer;
                font-size: 12px;
                color: #3b82f6;
                font-weight: 500;
            }

            .info-content details[open] summary {
                margin-bottom: 4px;
            }

            .credentials-form {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .form-group label {
                font-weight: 500;
                color: #374151;
            }

            .form-group input {
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 14px;
            }

            .form-group input:focus {
                outline: none;
                border-color: #ff4757;
                box-shadow: 0 0 0 3px rgba(255, 71, 87, 0.1);
            }

            .input-help {
                font-size: 12px;
                color: #6b7280;
                margin-top: 2px;
            }

            .button-group {
                display: flex;
                gap: 12px;
                align-items: center;
            }

            .selection-controls {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 12px;
                border-bottom: 1px solid #e5e7eb;
            }

            .selection-count {
                margin-left: auto;
                font-weight: 500;
                color: #374151;
            }

            .workflow-list {
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
            }

            .workflow-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                border-bottom: 1px solid #f3f4f6;
                cursor: pointer;
                transition: background 0.2s;
            }

            .workflow-item:hover {
                background: #f9fafb;
            }

            .workflow-item:last-child {
                border-bottom: none;
            }

            .workflow-checkbox {
                flex-shrink: 0;
            }

            .workflow-info {
                flex: 1;
            }

            .workflow-info h4 {
                margin: 0 0 4px;
                font-size: 14px;
                font-weight: 600;
                color: #111827;
            }

            .workflow-meta {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 4px;
                font-size: 12px;
                color: #6b7280;
            }

            .status.active {
                color: #10b981;
                font-weight: 500;
            }

            .status.inactive {
                color: #f59e0b;
                font-weight: 500;
            }

            .workflow-tags {
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
            }

            .tag {
                background: #f3f4f6;
                color: #6b7280;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 500;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: #f3f4f6;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 12px;
            }

            .progress-fill {
                height: 100%;
                background: #ff4757;
                border-radius: 4px;
                transition: width 0.3s ease;
                width: 0%;
            }

            .progress-text {
                text-align: center;
                color: #6b7280;
                margin-bottom: 24px;
            }

            .migration-summary h4 {
                margin: 0 0 12px;
                color: #111827;
            }

            .summary-stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                margin-bottom: 20px;
            }

            .stat {
                text-align: center;
                padding: 12px;
                border-radius: 8px;
                background: #f9fafb;
            }

            .stat.success {
                background: #f0fdf4;
                color: #065f46;
            }

            .stat.error {
                background: #fef2f2;
                color: #991b1b;
            }

            .stat.info {
                background: #eff6ff;
                color: #1e40af;
            }

            .stat.warning {
                background: #fffbeb;
                color: #92400e;
            }

            .stat-number {
                display: block;
                font-size: 20px;
                font-weight: 700;
                margin-bottom: 4px;
            }

            .stat-label {
                font-size: 12px;
                font-weight: 500;
            }

            .results-list {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                max-height: 200px;
                overflow-y: auto;
            }

            .result-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 12px;
                border-bottom: 1px solid #f3f4f6;
                font-size: 14px;
            }

            .result-item:last-child {
                border-bottom: none;
            }

            .result-item.success {
                background: #f0fdf4;
            }

            .result-item.error {
                background: #fef2f2;
            }

            .result-name {
                font-weight: 500;
                color: #111827;
            }

            .result-details {
                margin-left: auto;
                color: #6b7280;
                font-size: 12px;
            }

            .result-error {
                margin-left: auto;
                color: #dc2626;
                font-size: 12px;
            }

            .bulk-migration-footer {
                padding: 24px;
                border-top: 1px solid #f3f4f6;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }

            .btn-secondary {
                background: #f9fafb;
                border: 1px solid #d1d5db;
                color: #374151;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-secondary:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
            }

            .btn-primary {
                background: #ff4757;
                border: 1px solid #ff4757;
                color: white;
                padding: 8px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }

            .btn-primary:hover {
                background: #ff3838;
                border-color: #ff3838;
            }

            .btn-primary:disabled {
                background: #d1d5db;
                border-color: #d1d5db;
                cursor: not-allowed;
            }
        `;

        document.head.appendChild(style);
    }

    destroy() {
        if (this.dialog) {
            this.dialog.remove();
            this.dialog = null;
        }
        
        const styles = document.querySelector('#bulk-migration-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BulkMigration;
}

// Global export for direct script inclusion
if (typeof window !== 'undefined') {
    window.BulkMigration = BulkMigration;
}
