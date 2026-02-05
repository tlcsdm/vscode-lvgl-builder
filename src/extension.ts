/**
 * LVGL Builder Extension
 * VS Code extension for visual LVGL UI building
 */

import * as vscode from 'vscode';
import { LvglEditorProvider } from './lvglEditorProvider';

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext): void {
    // Register the custom editor provider
    const provider = new LvglEditorProvider(context);
    
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider(
            LvglEditorProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                },
                supportsMultipleEditorsPerDocument: false
            }
        )
    );

    // Register open editor command
    context.subscriptions.push(
        vscode.commands.registerCommand('tlcsdm.lvglBuilder.openEditor', async (uri: vscode.Uri) => {
            if (!uri) {
                // Try to get from active editor
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor && activeEditor.document.fileName.endsWith('.xml')) {
                    uri = activeEditor.document.uri;
                } else {
                    vscode.window.showWarningMessage('Please select an XML file to open with LVGL Builder.');
                    return;
                }
            }
            
            // Open with custom editor
            await vscode.commands.executeCommand(
                'vscode.openWith',
                uri,
                LvglEditorProvider.viewType
            );
        })
    );

    // Register generate code command
    context.subscriptions.push(
        vscode.commands.registerCommand('tlcsdm.lvglBuilder.generateCode', async () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                vscode.window.showWarningMessage('Please open an LVGL XML file first.');
                return;
            }
            
            // The actual code generation is handled by the editor provider
            // This command is for when called from command palette
            vscode.window.showInformationMessage('Use the Generate Code button in the LVGL Builder editor.');
        })
    );
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
    // Clean up resources if needed
}
