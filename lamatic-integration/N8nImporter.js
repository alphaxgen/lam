/**
 * N8n to Lamatic.ai Mapping Engine Importer Component
 * 
 * @author Sparsh (Alpha)
 * @since 2025
 */

class N8nImporter {
    constructor(options = {}) {
        this.options = {
            onSuccess: options.onSuccess || (() => {}),
            onError: options.onError || (() => {}),
            onProgress: options.onProgress || (() => {}),
            apiEndpoint: options.apiEndpoint || '/api/import/n8n',
            maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
            ...options
        };
        
        this.dialog = null;
        this.isProcessing = false;
    }

    /**
     * Show the import dialog
     */
    showImportDialog() {
        this.createDialog();
        this.dialog.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    /**
     * Hide the import dialog
     */
    hideImportDialog() {
        if (this.dialog) {
            this.dialog.style.display = 'none';
            document.body.style.overflow = ''; // Restore scroll
        }
    }

    /**
     * Create the import dialog UI
     */
    createDialog() {
        if (this.dialog) return;

        this.dialog = document.createElement('div');
        this.dialog.className = 'n8n-import-overlay';
        this.dialog.innerHTML = `
            <div class="n8n-import-dialog">
                <div class="n8n-import-header">
                    <div class="header-content">
                        <div class="import-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
                                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </div>
                        <div class="header-text">
                            <h2>Import from n8n</h2>
                            <p>Upload your n8n workflow JSON to convert it to Lamatic.ai format</p>
                        </div>
                    </div>
                    <button class="close-btn" onclick="this.closest('.n8n-import-overlay').style.display='none'; document.body.style.overflow=''">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                </div>

                <div class="n8n-import-body">
                    <!-- Upload Area -->
                    <div class="upload-zone" id="uploadZone">
                        <div class="upload-content">
                            <div class="upload-icon">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                    <path d="M24 32V16M16 24L24 16L32 24" stroke="currentColor" stroke-width="2"/>
                                    <path d="M40 24V38C40 39.1046 39.1046 40 38 40H10C8.89543 40 8 39.1046 8 38V24" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </div>
                            <h3>Drop your n8n workflow file here</h3>
                            <p>or <button class="browse-btn" id="browseBtn">browse files</button></p>
                            <div class="file-info">
                                <small>Supports .json files up to 10MB</small>
                            </div>
                        </div>
                    </div>

                    <!-- Progress Area (Hidden by default) -->
                    <div class="progress-area" id="progressArea" style="display: none;">
                        <div class="progress-content">
                            <div class="progress-icon">
                                <div class="spinner"></div>
                            </div>
                            <h3 id="progressTitle">Analyzing workflow...</h3>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            <p id="progressText">Reading n8n workflow structure</p>
                        </div>
                    </div>

                    <!-- Results Area (Hidden by default) -->
                    <div class="results-area" id="resultsArea" style="display: none;">
                        <!-- Will be populated with conversion results -->
                    </div>
                </div>

                <div class="n8n-import-footer">
                    <button class="btn-secondary" id="cancelBtn">Cancel</button>
                    <button class="btn-primary" id="importBtn" style="display: none;">Import Workflow</button>
                </div>

                <input type="file" id="fileInput" accept=".json" style="display: none;">
            </div>
        `;

        // Add styles
        this.addStyles();
        
        // Bind events
        this.bindEvents();
        
        document.body.appendChild(this.dialog);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        const uploadZone = this.dialog.querySelector('#uploadZone');
        const fileInput = this.dialog.querySelector('#fileInput');
        const browseBtn = this.dialog.querySelector('#browseBtn');
        const cancelBtn = this.dialog.querySelector('#cancelBtn');
        const importBtn = this.dialog.querySelector('#importBtn');

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleFile(e.target.files[0]);
            }
        });

        // Browse button
        browseBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // Upload zone drag & drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files[0]) {
                this.handleFile(files[0]);
            }
        });

        // Upload zone click
        uploadZone.addEventListener('click', () => {
            if (!this.isProcessing) {
                fileInput.click();
            }
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            this.hideImportDialog();
        });

        // Import button
        importBtn.addEventListener('click', () => {
            this.finalizeImport();
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.dialog && this.dialog.style.display === 'flex') {
                this.hideImportDialog();
            }
        });
    }

    /**
     * Handle file selection/drop
     */
    async handleFile(file) {
        // Validate file
        if (!file.name.endsWith('.json')) {
            this.showError('Please select a valid JSON file');
            return;
        }

        if (file.size > this.options.maxFileSize) {
            this.showError('File size too large. Maximum size is 10MB');
            return;
        }

        this.isProcessing = true;
        this.showProgress();

        try {
            // Read and validate file
            const content = await this.readFile(file);
            let workflow;
            
            try {
                workflow = JSON.parse(content);
            } catch (e) {
                throw new Error('Invalid JSON file format');
            }

            // Basic n8n validation
            if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
                throw new Error('Invalid n8n workflow format: missing nodes array');
            }

            this.updateProgress(25, 'Validating workflow structure...');

            // Send to conversion API
            const result = await this.convertWorkflow(file);
            
            this.updateProgress(100, 'Conversion complete!');
            
            // Show results
            this.showResults(result);
            
        } catch (error) {
            this.showError(error.message || 'Failed to process workflow');
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Convert workflow via API
     */
    async convertWorkflow(file) {
        const formData = new FormData();
        formData.append('n8nFile', file);

        this.updateProgress(50, 'Converting to Lamatic.ai format...');

        const response = await fetch(this.options.apiEndpoint, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || error.error || 'Conversion failed');
        }

        this.updateProgress(75, 'Generating migration report...');

        return await response.json();
    }

    /**
     * Show conversion results
     */
    showResults(result) {
        const resultsArea = this.dialog.querySelector('#resultsArea');
        const { summary, converted, migrationReport } = result;

        resultsArea.innerHTML = `
            <div class="conversion-success">
                <div class="success-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <h3>Conversion Successful!</h3>
                <p>Your n8n workflow has been converted to Lamatic.ai format</p>
            </div>

            <div class="conversion-stats">
                <div class="stat-card">
                    <div class="stat-number">${summary.totalNodes}</div>
                    <div class="stat-label">Total Nodes</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-number">${summary.supportedNodes}</div>
                    <div class="stat-label">Converted</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-number">${summary.unsupportedNodes}</div>
                    <div class="stat-label">Manual Review</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-number">${summary.authRequiredCount || 0}</div>
                    <div class="stat-label">Need Auth</div>
                </div>
            </div>

            <div class="node-categories">
                <h4>Node Categories</h4>
                <div class="category-grid">
                    <div class="category-item">
                        <span class="category-icon">🎯</span>
                        <span class="category-count">${summary.triggerNode || 0}</span>
                        <span class="category-name">Triggers</span>
                    </div>
                    <div class="category-item">
                        <span class="category-icon">🤖</span>
                        <span class="category-count">${summary.aiNodes || 0}</span>
                        <span class="category-name">AI Nodes</span>
                    </div>
                    <div class="category-item">
                        <span class="category-icon">📱</span>
                        <span class="category-count">${summary.appNodes || 0}</span>
                        <span class="category-name">Apps</span>
                    </div>
                    <div class="category-item">
                        <span class="category-icon">📊</span>
                        <span class="category-count">${summary.dataNodes || 0}</span>
                        <span class="category-name">Data</span>
                    </div>
                    <div class="category-item">
                        <span class="category-icon">🔀</span>
                        <span class="category-count">${summary.logicNodes || 0}</span>
                        <span class="category-name">Logic</span>
                    </div>
                    <div class="category-item">
                        <span class="category-icon">🔗</span>
                        <span class="category-count">${summary.integrationNodes || 0}</span>
                        <span class="category-name">Integration</span>
                    </div>
                </div>
            </div>

            ${summary.authProviders && summary.authProviders.length > 0 ? `
                <div class="auth-warning">
                    <div class="warning-icon">🔐</div>
                    <div class="warning-content">
                        <strong>Authentication Required</strong>
                        <p>The following services need re-authentication: ${summary.authProviders.join(', ')}</p>
                    </div>
                </div>
            ` : ''}
        `;

        // Store converted workflow for import
        this.convertedWorkflow = converted;
        this.migrationData = { summary, migrationReport };

        // Show results and import button
        this.dialog.querySelector('#progressArea').style.display = 'none';
        resultsArea.style.display = 'block';
        this.dialog.querySelector('#importBtn').style.display = 'inline-flex';
    }

    /**
     * Finalize the import process
     */
    finalizeImport() {
        if (this.convertedWorkflow) {
            this.options.onSuccess({
                workflow: this.convertedWorkflow,
                migration: this.migrationData,
                timestamp: new Date().toISOString()
            });
            this.hideImportDialog();
        }
    }

    /**
     * Show progress state
     */
    showProgress() {
        this.dialog.querySelector('#uploadZone').style.display = 'none';
        this.dialog.querySelector('#progressArea').style.display = 'block';
        this.dialog.querySelector('#resultsArea').style.display = 'none';
        this.updateProgress(0, 'Starting conversion...');
    }

    /**
     * Update progress
     */
    updateProgress(percentage, text) {
        const progressFill = this.dialog.querySelector('#progressFill');
        const progressText = this.dialog.querySelector('#progressText');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = text;
        }

        this.options.onProgress(percentage, text);
    }

    /**
     * Show error state
     */
    showError(message) {
        const progressArea = this.dialog.querySelector('#progressArea');
        progressArea.innerHTML = `
            <div class="error-content">
                <div class="error-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/>
                        <line x1="16" y1="16" x2="32" y2="32" stroke="currentColor" stroke-width="2"/>
                        <line x1="32" y1="16" x2="16" y2="32" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <h3>Import Failed</h3>
                <p>${message}</p>
                <button class="btn-secondary" onclick="location.reload()">Try Again</button>
            </div>
        `;
        progressArea.style.display = 'block';
        
        this.options.onError(new Error(message));
    }

    /**
     * Read file content
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    /**
     * Add component styles
     */
    addStyles() {
        if (document.querySelector('#n8n-importer-styles')) return;

        const style = document.createElement('style');
        style.id = 'n8n-importer-styles';
        style.textContent = `
            .n8n-import-overlay {
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

            .n8n-import-dialog {
                background: white;
                border-radius: 16px;
                width: 100%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                display: flex;
                flex-direction: column;
            }

            .n8n-import-header {
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

            .import-icon {
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

            .n8n-import-body {
                padding: 0 24px;
                flex: 1;
                min-height: 200px;
            }

            .upload-zone {
                border: 2px dashed #d1d5db;
                border-radius: 12px;
                padding: 48px 24px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s;
                background: #fafafa;
            }

            .upload-zone:hover {
                border-color: #ff4757;
                background: #fef2f2;
            }

            .upload-zone.dragover {
                border-color: #ff4757;
                background: #fef2f2;
                transform: scale(1.02);
            }

            .upload-content .upload-icon {
                color: #9ca3af;
                margin-bottom: 16px;
            }

            .upload-content h3 {
                margin: 0 0 8px;
                font-size: 18px;
                font-weight: 500;
                color: #374151;
            }

            .upload-content p {
                margin: 0 0 16px;
                color: #6b7280;
            }

            .browse-btn {
                background: none;
                border: none;
                color: #ff4757;
                font-weight: 500;
                cursor: pointer;
                text-decoration: underline;
            }

            .browse-btn:hover {
                text-decoration: none;
            }

            .file-info small {
                color: #9ca3af;
                font-size: 12px;
            }

            .progress-area {
                padding: 48px 24px;
                text-align: center;
            }

            .progress-content .progress-icon {
                margin-bottom: 16px;
            }

            .spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #f3f4f6;
                border-top: 4px solid #ff4757;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .progress-content h3 {
                margin: 0 0 16px;
                font-size: 18px;
                font-weight: 500;
                color: #374151;
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

            .progress-content p {
                margin: 0;
                color: #6b7280;
                font-size: 14px;
            }

            .results-area {
                padding: 24px 0;
            }

            .conversion-success {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 16px;
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 12px;
                margin-bottom: 24px;
            }

            .success-icon {
                width: 40px;
                height: 40px;
                background: #10b981;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
            }

            .conversion-success h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                color: #065f46;
            }

            .conversion-success p {
                margin: 4px 0 0;
                font-size: 14px;
                color: #047857;
            }

            .conversion-stats {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
                margin-bottom: 24px;
            }

            .stat-card {
                padding: 16px;
                background: #f9fafb;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                text-align: center;
            }

            .stat-card.success {
                background: #f0fdf4;
                border-color: #bbf7d0;
            }

            .stat-card.warning {
                background: #fffbeb;
                border-color: #fed7aa;
            }

            .stat-card.info {
                background: #eff6ff;
                border-color: #bfdbfe;
            }

            .stat-number {
                font-size: 24px;
                font-weight: 700;
                color: #111827;
                margin-bottom: 4px;
            }

            .stat-label {
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }

            .node-categories {
                margin-bottom: 24px;
            }

            .node-categories h4 {
                margin: 0 0 12px;
                font-size: 14px;
                font-weight: 600;
                color: #374151;
            }

            .category-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
            }

            .category-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #f9fafb;
                border-radius: 6px;
                font-size: 13px;
            }

            .category-icon {
                font-size: 16px;
            }

            .category-count {
                font-weight: 600;
                color: #374151;
            }

            .category-name {
                color: #6b7280;
            }

            .auth-warning {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                padding: 16px;
                background: #fffbeb;
                border: 1px solid #fed7aa;
                border-radius: 8px;
                margin-bottom: 16px;
            }

            .warning-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .warning-content strong {
                display: block;
                margin-bottom: 4px;
                color: #92400e;
                font-size: 14px;
            }

            .warning-content p {
                margin: 0;
                color: #a16207;
                font-size: 13px;
            }

            .error-content {
                text-align: center;
                padding: 24px;
            }

            .error-icon {
                color: #ef4444;
                margin-bottom: 16px;
            }

            .error-content h3 {
                margin: 0 0 8px;
                font-size: 18px;
                font-weight: 500;
                color: #dc2626;
            }

            .error-content p {
                margin: 0 0 24px;
                color: #6b7280;
            }

            .n8n-import-footer {
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

            @media (max-width: 640px) {
                .n8n-import-dialog {
                    margin: 20px;
                    max-width: none;
                }

                .conversion-stats {
                    grid-template-columns: repeat(2, 1fr);
                }

                .category-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Cleanup - remove dialog and event listeners
     */
    destroy() {
        if (this.dialog) {
            this.dialog.remove();
            this.dialog = null;
        }
        
        const styles = document.querySelector('#n8n-importer-styles');
        if (styles) {
            styles.remove();
        }
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = N8nImporter;
}

// Global export for direct script inclusion
if (typeof window !== 'undefined') {
    window.N8nImporter = N8nImporter;
}
