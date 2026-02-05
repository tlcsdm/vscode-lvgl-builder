import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('unknowIfGuestInDream.tlcsdm-lvgl-builder'));
    });

    test('Should activate extension', async () => {
        const extension = vscode.extensions.getExtension('unknowIfGuestInDream.tlcsdm-lvgl-builder');
        if (extension) {
            await extension.activate();
            assert.ok(extension.isActive);
        }
    });

    test('Should register custom editor', () => {
        // Check that the commands are registered
        return vscode.commands.getCommands(true).then(commands => {
            assert.ok(commands.includes('tlcsdm.lvglBuilder.openEditor'));
            assert.ok(commands.includes('tlcsdm.lvglBuilder.generateCode'));
        });
    });
});
