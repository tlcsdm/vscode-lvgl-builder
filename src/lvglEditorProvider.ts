/**
 * LVGL Builder Editor Provider
 * Custom editor for LVGL XML files
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { lvglComponents, getCategories, getComponentsByCategory } from './components/lvglComponents';
import { generateCode, parseXmlToNodes } from './codeGenerator';

export class LvglEditorProvider implements vscode.CustomTextEditorProvider {
    public static readonly viewType = 'tlcsdm.lvglBuilder.editor';

    private activeEditor: vscode.WebviewPanel | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {}

    /**
     * Called when our custom editor is opened
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel
    ): Promise<void> {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'out'),
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
            ],
        };

        this.activeEditor = webviewPanel;

        // Set the initial html content
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

        // Handle messages from the webview
        const messageDisposable = webviewPanel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'update':
                    this.updateDocument(document, message.content);
                    break;
                case 'generateCode':
                    await this.handleGenerateCode(document);
                    break;
                case 'ready':
                    // Send initial data to webview
                    webviewPanel.webview.postMessage({
                        type: 'init',
                        content: document.getText(),
                        components: lvglComponents,
                        categories: getCategories(),
                    });
                    break;
            }
        });

        // Handle document changes
        const changeDocumentDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                webviewPanel.webview.postMessage({
                    type: 'update',
                    content: document.getText(),
                });
            }
        });

        // Clean up on close
        webviewPanel.onDidDispose(() => {
            messageDisposable.dispose();
            changeDocumentDisposable.dispose();
            if (this.activeEditor === webviewPanel) {
                this.activeEditor = undefined;
            }
        });
    }

    /**
     * Generate C/H code from the current document
     */
    public async handleGenerateCode(document: vscode.TextDocument): Promise<void> {
        try {
            const xmlContent = document.getText();
            const nodes = parseXmlToNodes(xmlContent);

            // Get screen name from file name
            const fileName = path.basename(document.uri.fsPath, '.lvgl.xml');
            const screenName = fileName.replace(/[^a-zA-Z0-9_]/g, '_');

            // Get configuration
            const config = vscode.workspace.getConfiguration('tlcsdm.lvglBuilder');
            const generateComments = config.get<boolean>('generateComments', true);

            // Generate code
            const { headerContent, sourceContent } = generateCode(nodes, screenName, generateComments);

            // Get output directory (same as XML file)
            const outputDir = path.dirname(document.uri.fsPath);
            const headerPath = path.join(outputDir, `${screenName.toLowerCase()}.h`);
            const sourcePath = path.join(outputDir, `${screenName.toLowerCase()}.c`);

            // Write files
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(headerPath),
                Buffer.from(headerContent, 'utf8')
            );
            await vscode.workspace.fs.writeFile(
                vscode.Uri.file(sourcePath),
                Buffer.from(sourceContent, 'utf8')
            );

            vscode.window.showInformationMessage(`Generated: ${screenName.toLowerCase()}.c and ${screenName.toLowerCase()}.h`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate code: ${error}`);
        }
    }

    /**
     * Update the text document with new content
     */
    private updateDocument(document: vscode.TextDocument, content: string): void {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            content
        );
        vscode.workspace.applyEdit(edit);
    }

    /**
     * Get the HTML for the webview
     */
    private getHtmlForWebview(webview: vscode.Webview): string {
        // Get component data for the palette
        const categories = getCategories();
        const componentsByCategory: Record<string, typeof lvglComponents> = {};
        for (const category of categories) {
            componentsByCategory[category] = getComponentsByCategory(category);
        }

        return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline';">
    <title>LVGL Builder</title>
    <style>
        :root {
            --vscode-font: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
            --panel-bg: var(--vscode-sideBar-background, #252526);
            --panel-fg: var(--vscode-sideBar-foreground, #cccccc);
            --canvas-bg: var(--vscode-editor-background, #1e1e1e);
            --border-color: var(--vscode-panel-border, #3c3c3c);
            --highlight-bg: var(--vscode-list-activeSelectionBackground, #094771);
            --highlight-fg: var(--vscode-list-activeSelectionForeground, #ffffff);
            --button-bg: var(--vscode-button-background, #0e639c);
            --button-fg: var(--vscode-button-foreground, #ffffff);
            --input-bg: var(--vscode-input-background, #3c3c3c);
            --input-fg: var(--vscode-input-foreground, #cccccc);
            --input-border: var(--vscode-input-border, #3c3c3c);
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: var(--vscode-font);
            background: var(--canvas-bg);
            color: var(--panel-fg);
            height: 100vh;
            overflow: hidden;
        }

        .container {
            display: flex;
            height: 100vh;
        }

        /* Component Palette */
        .palette {
            width: 220px;
            background: var(--panel-bg);
            border-right: 1px solid var(--border-color);
            overflow-y: auto;
            flex-shrink: 0;
        }

        .palette-header {
            padding: 12px;
            font-weight: 600;
            font-size: 13px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .category {
            border-bottom: 1px solid var(--border-color);
        }

        .category-header {
            padding: 8px 12px;
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255, 255, 255, 0.03);
        }

        .category-header:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .category-items {
            padding: 4px 8px;
        }

        .component-item {
            padding: 6px 8px;
            cursor: grab;
            display: flex;
            align-items: center;
            gap: 8px;
            border-radius: 4px;
            font-size: 12px;
        }

        .component-item:hover {
            background: var(--highlight-bg);
            color: var(--highlight-fg);
        }

        .component-icon {
            width: 20px;
            text-align: center;
            font-size: 14px;
        }

        /* Canvas Area */
        .canvas-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .toolbar {
            padding: 8px 12px;
            background: var(--panel-bg);
            border-bottom: 1px solid var(--border-color);
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .toolbar button {
            padding: 6px 12px;
            background: var(--button-bg);
            color: var(--button-fg);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .toolbar button:hover {
            opacity: 0.9;
        }

        .toolbar button.secondary {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--panel-fg);
        }

        .canvas-wrapper {
            flex: 1;
            overflow: auto;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }

        .canvas {
            width: 480px;
            height: 320px;
            background: #333;
            border: 2px solid var(--border-color);
            position: relative;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .canvas.drag-over {
            border-color: var(--button-bg);
            background: rgba(14, 99, 156, 0.1);
        }

        /* Canvas elements */
        .lv-element {
            position: absolute;
            background: #444;
            border: 1px solid #555;
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            color: #aaa;
            user-select: none;
        }

        .lv-element.selected {
            border: 2px solid var(--button-bg);
            box-shadow: 0 0 0 2px rgba(14, 99, 156, 0.3);
        }

        .lv-element:hover {
            border-color: var(--button-bg);
        }

        .resize-handle {
            position: absolute;
            width: 8px;
            height: 8px;
            background: var(--button-bg);
            border-radius: 2px;
        }

        .resize-handle.se {
            bottom: -4px;
            right: -4px;
            cursor: se-resize;
        }

        /* Properties Panel */
        .properties {
            width: 280px;
            background: var(--panel-bg);
            border-left: 1px solid var(--border-color);
            overflow-y: auto;
            flex-shrink: 0;
        }

        .properties-header {
            padding: 12px;
            font-weight: 600;
            font-size: 13px;
            border-bottom: 1px solid var(--border-color);
        }

        .properties-content {
            padding: 12px;
        }

        .property-group {
            margin-bottom: 16px;
        }

        .property-group-title {
            font-size: 11px;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 8px;
            color: #888;
        }

        .property-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            gap: 8px;
        }

        .property-label {
            width: 80px;
            font-size: 12px;
            flex-shrink: 0;
        }

        .property-input {
            flex: 1;
            padding: 4px 8px;
            background: var(--input-bg);
            color: var(--input-fg);
            border: 1px solid var(--input-border);
            border-radius: 3px;
            font-size: 12px;
        }

        .property-input:focus {
            outline: none;
            border-color: var(--button-bg);
        }

        select.property-input {
            cursor: pointer;
        }

        .color-input-wrapper {
            display: flex;
            gap: 4px;
            flex: 1;
        }

        .color-picker {
            width: 30px;
            height: 24px;
            padding: 0;
            border: 1px solid var(--input-border);
            border-radius: 3px;
            cursor: pointer;
        }

        .no-selection {
            padding: 20px;
            text-align: center;
            color: #888;
            font-size: 12px;
        }

        /* Hierarchy tree */
        .hierarchy {
            border-bottom: 1px solid var(--border-color);
            max-height: 200px;
            overflow-y: auto;
        }

        .hierarchy-item {
            padding: 4px 8px 4px 16px;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .hierarchy-item:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .hierarchy-item.selected {
            background: var(--highlight-bg);
            color: var(--highlight-fg);
        }

        .hierarchy-indent {
            padding-left: 16px;
        }

        /* Empty state */
        .empty-canvas {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #666;
        }

        .empty-canvas-icon {
            font-size: 48px;
            margin-bottom: 12px;
        }

        .empty-canvas-text {
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Component Palette -->
        <div class="palette">
            <div class="palette-header">
                <span>📦</span>
                <span>Components</span>
            </div>
            <div id="componentPalette"></div>
        </div>

        <!-- Canvas Area -->
        <div class="canvas-container">
            <div class="toolbar">
                <button id="generateBtn" title="Generate C/H Code">
                    <span>⚙️</span>
                    <span>Generate Code</span>
                </button>
                <button class="secondary" id="deleteBtn" title="Delete Selected">
                    <span>🗑️</span>
                    <span>Delete</span>
                </button>
                <button class="secondary" id="duplicateBtn" title="Duplicate Selected">
                    <span>📋</span>
                    <span>Duplicate</span>
                </button>
            </div>
            <div class="canvas-wrapper">
                <div class="canvas" id="canvas">
                    <div class="empty-canvas" id="emptyState">
                        <div class="empty-canvas-icon">📐</div>
                        <div class="empty-canvas-text">Drag components here</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Properties Panel -->
        <div class="properties">
            <div class="properties-header">Properties</div>
            <div class="hierarchy" id="hierarchy">
                <div class="no-selection">No components</div>
            </div>
            <div class="properties-content" id="propertiesContent">
                <div class="no-selection">Select a component to edit properties</div>
            </div>
        </div>
    </div>

    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            
            // State
            let components = [];
            let categories = [];
            let nodes = [];
            let selectedNodeId = null;
            let draggedComponent = null;
            let isDragging = false;
            let dragOffset = { x: 0, y: 0 };

            // DOM elements
            const canvas = document.getElementById('canvas');
            const componentPalette = document.getElementById('componentPalette');
            const propertiesContent = document.getElementById('propertiesContent');
            const hierarchy = document.getElementById('hierarchy');
            const emptyState = document.getElementById('emptyState');
            const generateBtn = document.getElementById('generateBtn');
            const deleteBtn = document.getElementById('deleteBtn');
            const duplicateBtn = document.getElementById('duplicateBtn');

            // Initialize
            vscode.postMessage({ command: 'ready' });

            // Handle messages from extension
            window.addEventListener('message', (event) => {
                const message = event.data;
                switch (message.type) {
                    case 'init':
                        components = message.components;
                        categories = message.categories;
                        nodes = parseXml(message.content);
                        renderPalette();
                        renderCanvas();
                        renderHierarchy();
                        break;
                    case 'update':
                        nodes = parseXml(message.content);
                        renderCanvas();
                        renderHierarchy();
                        break;
                }
            });

            // Parse XML content
            function parseXml(content) {
                if (!content || content.trim() === '') {
                    return [];
                }
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(content, 'text/xml');
                    const root = doc.documentElement;
                    if (root.tagName === 'parsererror' || !root) {
                        return [];
                    }
                    return parseXmlChildren(root);
                } catch (e) {
                    return [];
                }
            }

            function parseXmlChildren(parent) {
                const result = [];
                for (const child of parent.children) {
                    const node = {
                        id: child.getAttribute('id') || generateId(),
                        type: 'lv_' + child.tagName,
                        name: child.getAttribute('name') || child.tagName,
                        properties: {},
                        children: []
                    };

                    for (const attr of child.attributes) {
                        if (attr.name !== 'id' && attr.name !== 'name') {
                            let value = attr.value;
                            if (value === 'true') value = true;
                            else if (value === 'false') value = false;
                            else if (!isNaN(Number(value)) && value !== '') value = Number(value);
                            node.properties[attr.name] = value;
                        }
                    }

                    node.children = parseXmlChildren(child);
                    result.push(node);
                }
                return result;
            }

            function generateId() {
                return 'node_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
            }

            // Render component palette
            function renderPalette() {
                componentPalette.innerHTML = '';
                
                for (const category of categories) {
                    const categoryEl = document.createElement('div');
                    categoryEl.className = 'category';
                    
                    const headerEl = document.createElement('div');
                    headerEl.className = 'category-header';
                    headerEl.innerHTML = '<span>' + category.charAt(0).toUpperCase() + category.slice(1) + '</span><span>▼</span>';
                    
                    const itemsEl = document.createElement('div');
                    itemsEl.className = 'category-items';
                    
                    const categoryComponents = components.filter(c => c.category === category);
                    for (const comp of categoryComponents) {
                        const itemEl = document.createElement('div');
                        itemEl.className = 'component-item';
                        itemEl.draggable = true;
                        itemEl.dataset.type = comp.type;
                        itemEl.innerHTML = '<span class="component-icon">' + comp.icon + '</span><span>' + comp.displayName + '</span>';
                        
                        itemEl.addEventListener('dragstart', (e) => {
                            draggedComponent = comp;
                            e.dataTransfer.effectAllowed = 'copy';
                        });
                        
                        itemsEl.appendChild(itemEl);
                    }
                    
                    headerEl.addEventListener('click', () => {
                        itemsEl.style.display = itemsEl.style.display === 'none' ? 'block' : 'none';
                        headerEl.querySelector('span:last-child').textContent = itemsEl.style.display === 'none' ? '▶' : '▼';
                    });
                    
                    categoryEl.appendChild(headerEl);
                    categoryEl.appendChild(itemsEl);
                    componentPalette.appendChild(categoryEl);
                }
            }

            // Render canvas
            function renderCanvas() {
                // Clear existing elements
                const existingElements = canvas.querySelectorAll('.lv-element');
                existingElements.forEach(el => el.remove());
                
                // Show/hide empty state
                emptyState.style.display = nodes.length === 0 ? 'block' : 'none';
                
                // Render nodes
                for (const node of nodes) {
                    renderNode(node, canvas);
                }
            }

            function renderNode(node, parent) {
                const comp = components.find(c => c.type === node.type);
                if (!comp) return;

                const el = document.createElement('div');
                el.className = 'lv-element' + (node.id === selectedNodeId ? ' selected' : '');
                el.dataset.id = node.id;
                
                const x = node.properties.x || 0;
                const y = node.properties.y || 0;
                const width = node.properties.width || 100;
                const height = node.properties.height || 50;
                
                el.style.left = x + 'px';
                el.style.top = y + 'px';
                el.style.width = width + 'px';
                el.style.height = height + 'px';
                
                // Apply visual styles
                if (node.properties.bg_color) {
                    el.style.backgroundColor = node.properties.bg_color;
                }
                if (node.properties.border_width) {
                    el.style.borderWidth = node.properties.border_width + 'px';
                }
                if (node.properties.border_color) {
                    el.style.borderColor = node.properties.border_color;
                }
                if (node.properties.radius) {
                    el.style.borderRadius = node.properties.radius + 'px';
                }
                
                // Display component info
                let displayText = node.name;
                if (node.type === 'lv_label' && node.properties.text) {
                    displayText = node.properties.text;
                } else if (node.type === 'lv_btn') {
                    displayText = node.name;
                }
                el.textContent = displayText;
                
                // Add resize handle
                if (node.id === selectedNodeId) {
                    const handle = document.createElement('div');
                    handle.className = 'resize-handle se';
                    handle.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        startResize(node, e);
                    });
                    el.appendChild(handle);
                }
                
                // Click to select
                el.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    selectNode(node.id);
                    startDrag(node, el, e);
                });
                
                parent.appendChild(el);
                
                // Render children
                for (const child of node.children) {
                    renderNode(child, el);
                }
            }

            function selectNode(nodeId) {
                selectedNodeId = nodeId;
                renderCanvas();
                renderHierarchy();
                renderProperties();
            }

            function findNode(nodeId, nodeList = nodes) {
                for (const node of nodeList) {
                    if (node.id === nodeId) return node;
                    const found = findNode(nodeId, node.children);
                    if (found) return found;
                }
                return null;
            }

            // Drag and drop for moving
            function startDrag(node, el, e) {
                isDragging = true;
                const rect = el.getBoundingClientRect();
                dragOffset = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
                
                const moveHandler = (e) => {
                    if (!isDragging) return;
                    const canvasRect = canvas.getBoundingClientRect();
                    const x = Math.max(0, Math.min(e.clientX - canvasRect.left - dragOffset.x, canvas.offsetWidth - el.offsetWidth));
                    const y = Math.max(0, Math.min(e.clientY - canvasRect.top - dragOffset.y, canvas.offsetHeight - el.offsetHeight));
                    el.style.left = x + 'px';
                    el.style.top = y + 'px';
                    node.properties.x = Math.round(x);
                    node.properties.y = Math.round(y);
                };
                
                const upHandler = () => {
                    isDragging = false;
                    document.removeEventListener('mousemove', moveHandler);
                    document.removeEventListener('mouseup', upHandler);
                    updateXml();
                    renderProperties();
                };
                
                document.addEventListener('mousemove', moveHandler);
                document.addEventListener('mouseup', upHandler);
            }

            // Resize
            function startResize(node, e) {
                const el = canvas.querySelector('[data-id="' + node.id + '"]');
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = el.offsetWidth;
                const startHeight = el.offsetHeight;
                
                const moveHandler = (e) => {
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    const newWidth = Math.max(20, startWidth + dx);
                    const newHeight = Math.max(20, startHeight + dy);
                    el.style.width = newWidth + 'px';
                    el.style.height = newHeight + 'px';
                    node.properties.width = Math.round(newWidth);
                    node.properties.height = Math.round(newHeight);
                };
                
                const upHandler = () => {
                    document.removeEventListener('mousemove', moveHandler);
                    document.removeEventListener('mouseup', upHandler);
                    updateXml();
                    renderProperties();
                };
                
                document.addEventListener('mousemove', moveHandler);
                document.addEventListener('mouseup', upHandler);
            }

            // Canvas drop handling
            canvas.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                canvas.classList.add('drag-over');
            });

            canvas.addEventListener('dragleave', () => {
                canvas.classList.remove('drag-over');
            });

            canvas.addEventListener('drop', (e) => {
                e.preventDefault();
                canvas.classList.remove('drag-over');
                
                if (!draggedComponent) return;
                
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const newNode = {
                    id: generateId(),
                    type: draggedComponent.type,
                    name: draggedComponent.type.replace('lv_', '') + '_' + (nodes.length + 1),
                    properties: {
                        x: Math.round(x),
                        y: Math.round(y),
                        width: 100,
                        height: 50
                    },
                    children: []
                };
                
                // Copy default properties
                for (const prop of draggedComponent.properties) {
                    if (prop.default !== undefined && prop.name !== 'name') {
                        newNode.properties[prop.name] = prop.default;
                    }
                }
                
                nodes.push(newNode);
                selectedNodeId = newNode.id;
                draggedComponent = null;
                
                updateXml();
                renderCanvas();
                renderHierarchy();
                renderProperties();
            });

            canvas.addEventListener('click', (e) => {
                if (e.target === canvas || e.target === emptyState) {
                    selectedNodeId = null;
                    renderCanvas();
                    renderHierarchy();
                    renderProperties();
                }
            });

            // Render hierarchy
            function renderHierarchy() {
                if (nodes.length === 0) {
                    hierarchy.innerHTML = '<div class="no-selection">No components</div>';
                    return;
                }
                
                hierarchy.innerHTML = '';
                for (const node of nodes) {
                    renderHierarchyItem(node, hierarchy, 0);
                }
            }

            function renderHierarchyItem(node, parent, depth) {
                const comp = components.find(c => c.type === node.type);
                const el = document.createElement('div');
                el.className = 'hierarchy-item' + (node.id === selectedNodeId ? ' selected' : '');
                el.style.paddingLeft = (8 + depth * 16) + 'px';
                el.innerHTML = '<span>' + (comp ? comp.icon : '□') + '</span><span>' + node.name + '</span>';
                el.addEventListener('click', () => selectNode(node.id));
                parent.appendChild(el);
                
                for (const child of node.children) {
                    renderHierarchyItem(child, parent, depth + 1);
                }
            }

            // Render properties panel
            function renderProperties() {
                if (!selectedNodeId) {
                    propertiesContent.innerHTML = '<div class="no-selection">Select a component to edit properties</div>';
                    return;
                }
                
                const node = findNode(selectedNodeId);
                if (!node) return;
                
                const comp = components.find(c => c.type === node.type);
                if (!comp) return;
                
                // Group properties by category
                const groupedProps = {};
                for (const prop of comp.properties) {
                    if (!groupedProps[prop.category]) {
                        groupedProps[prop.category] = [];
                    }
                    groupedProps[prop.category].push(prop);
                }
                
                let html = '';
                for (const [category, props] of Object.entries(groupedProps)) {
                    html += '<div class="property-group">';
                    html += '<div class="property-group-title">' + category + '</div>';
                    
                    for (const prop of props) {
                        const value = prop.name === 'name' ? node.name : (node.properties[prop.name] !== undefined ? node.properties[prop.name] : prop.default || '');
                        
                        html += '<div class="property-row">';
                        html += '<label class="property-label">' + prop.name + '</label>';
                        
                        if (prop.type === 'select' && prop.options) {
                            html += '<select class="property-input" data-prop="' + prop.name + '">';
                            for (const opt of prop.options) {
                                html += '<option value="' + opt + '"' + (value === opt ? ' selected' : '') + '>' + opt + '</option>';
                            }
                            html += '</select>';
                        } else if (prop.type === 'boolean') {
                            html += '<input type="checkbox" class="property-input" data-prop="' + prop.name + '"' + (value ? ' checked' : '') + '>';
                        } else if (prop.type === 'color') {
                            html += '<div class="color-input-wrapper">';
                            html += '<input type="color" class="color-picker" data-prop="' + prop.name + '" value="' + (value || '#ffffff') + '">';
                            html += '<input type="text" class="property-input" data-prop="' + prop.name + '" value="' + (value || '#ffffff') + '">';
                            html += '</div>';
                        } else if (prop.type === 'number') {
                            html += '<input type="number" class="property-input" data-prop="' + prop.name + '" value="' + value + '"' + 
                                (prop.min !== undefined ? ' min="' + prop.min + '"' : '') +
                                (prop.max !== undefined ? ' max="' + prop.max + '"' : '') + '>';
                        } else {
                            html += '<input type="text" class="property-input" data-prop="' + prop.name + '" value="' + (value + '').replace(/"/g, '&quot;') + '">';
                        }
                        
                        html += '</div>';
                    }
                    
                    html += '</div>';
                }
                
                propertiesContent.innerHTML = html;
                
                // Add event listeners
                propertiesContent.querySelectorAll('.property-input, .color-picker').forEach(input => {
                    input.addEventListener('change', (e) => {
                        const propName = e.target.dataset.prop;
                        let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                        
                        if (e.target.type === 'number') {
                            value = Number(value);
                        }
                        
                        if (propName === 'name') {
                            node.name = value;
                        } else {
                            node.properties[propName] = value;
                        }
                        
                        // Sync color inputs
                        if (e.target.classList.contains('color-picker')) {
                            const textInput = propertiesContent.querySelector('input[type="text"][data-prop="' + propName + '"]');
                            if (textInput) textInput.value = value;
                        } else if (e.target.type === 'text' && e.target.parentElement.classList.contains('color-input-wrapper')) {
                            const colorPicker = propertiesContent.querySelector('input[type="color"][data-prop="' + propName + '"]');
                            if (colorPicker && /^#[0-9A-Fa-f]{6}$/.test(value)) colorPicker.value = value;
                        }
                        
                        updateXml();
                        renderCanvas();
                        renderHierarchy();
                    });
                });
            }

            // Convert nodes to XML
            function nodesToXml() {
                let xml = '<?xml version="1.0" encoding="UTF-8"?>\\n<lvgl version="1.0">\\n';
                for (const node of nodes) {
                    xml += nodeToXml(node, '  ');
                }
                xml += '</lvgl>\\n';
                return xml;
            }

            function nodeToXml(node, indent) {
                const tagName = node.type.replace('lv_', '');
                let xml = indent + '<' + tagName + ' id="' + node.id + '" name="' + node.name + '"';
                
                for (const [key, value] of Object.entries(node.properties)) {
                    if (typeof value === 'string') {
                        xml += ' ' + key + '="' + value.replace(/"/g, '&quot;') + '"';
                    } else {
                        xml += ' ' + key + '="' + value + '"';
                    }
                }
                
                if (node.children.length > 0) {
                    xml += '>\\n';
                    for (const child of node.children) {
                        xml += nodeToXml(child, indent + '  ');
                    }
                    xml += indent + '</' + tagName + '>\\n';
                } else {
                    xml += '/>\\n';
                }
                
                return xml;
            }

            function updateXml() {
                const xml = nodesToXml();
                vscode.postMessage({ command: 'update', content: xml });
            }

            // Toolbar buttons
            generateBtn.addEventListener('click', () => {
                vscode.postMessage({ command: 'generateCode' });
            });

            deleteBtn.addEventListener('click', () => {
                if (!selectedNodeId) return;
                deleteNode(selectedNodeId);
                selectedNodeId = null;
                updateXml();
                renderCanvas();
                renderHierarchy();
                renderProperties();
            });

            function deleteNode(nodeId, nodeList = nodes) {
                for (let i = 0; i < nodeList.length; i++) {
                    if (nodeList[i].id === nodeId) {
                        nodeList.splice(i, 1);
                        return true;
                    }
                    if (deleteNode(nodeId, nodeList[i].children)) {
                        return true;
                    }
                }
                return false;
            }

            duplicateBtn.addEventListener('click', () => {
                if (!selectedNodeId) return;
                const node = findNode(selectedNodeId);
                if (!node) return;
                
                const newNode = JSON.parse(JSON.stringify(node));
                newNode.id = generateId();
                newNode.name = node.name + '_copy';
                newNode.properties.x = (node.properties.x || 0) + 20;
                newNode.properties.y = (node.properties.y || 0) + 20;
                
                // Update children IDs
                updateChildIds(newNode);
                
                nodes.push(newNode);
                selectedNodeId = newNode.id;
                
                updateXml();
                renderCanvas();
                renderHierarchy();
                renderProperties();
            });

            function updateChildIds(node) {
                for (const child of node.children) {
                    child.id = generateId();
                    updateChildIds(child);
                }
            }

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                        deleteBtn.click();
                    }
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                    e.preventDefault();
                    duplicateBtn.click();
                }
            });
        })();
    </script>
</body>
</html>
        `;
    }
}
