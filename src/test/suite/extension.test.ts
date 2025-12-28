import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { countWords } from '../../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });

    test('countWords should return 0 for empty string', () => {
        assert.strictEqual(countWords(''), 0);
        assert.strictEqual(countWords('   '), 0);
    });

    test('countWords should count words correctly', () => {
        assert.strictEqual(countWords('Hello world'), 2);
        assert.strictEqual(countWords('Hello   world'), 2);
        assert.strictEqual(countWords('One two three four'), 4);
    });

    test('countWords should handle newlines', () => {
        assert.strictEqual(countWords('Hello\nworld'), 2);
        assert.strictEqual(countWords('Hello\n\nworld'), 2);
    });
});
