import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Markdown Word Count is now active!');

    // 1. CodeLens for section word counts
    const codeLensProvider = new WordCountCodeLensProvider();
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider({ language: 'markdown' }, codeLensProvider)
    );

    // 2. Status Bar for total word count
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    context.subscriptions.push(statusBarItem);

    // Function to update status bar
    const updateStatusBar = (doc: vscode.TextDocument | undefined) => {
        if (!doc || doc.languageId !== 'markdown') {
            statusBarItem.hide();
            return;
        }

        const text = doc.getText();

        // Exclude frontmatter
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
        let contentText = text;
        const match = text.match(frontmatterRegex);
        if (match) {
            contentText = text.substring(match[0].length);
        }

        const count = countWords(contentText);
        statusBarItem.text = `$(pencil) ${count} words`;
        statusBarItem.show();
    };

    // Events to update status bar
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            updateStatusBar(editor?.document);
        }),
        vscode.workspace.onDidChangeTextDocument(e => {
            if (vscode.window.activeTextEditor && e.document === vscode.window.activeTextEditor.document) {
                updateStatusBar(e.document);
            }
        })
    );

    // Initial update
    updateStatusBar(vscode.window.activeTextEditor?.document);

    vscode.workspace.onDidChangeTextDocument(e => {
        console.log('Document changed:', e.document.fileName);
    });
}


export function deactivate() { }

/**
 * Provides CodeLens for Markdown files to show word counts per section.
 */
class WordCountCodeLensProvider implements vscode.CodeLensProvider {

    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        // Debounce or trigger updates if needed, but usually VS Code handles the pull.
        vscode.workspace.onDidChangeTextDocument(_ => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        console.log('Providing CodeLenses for:', document.fileName);
        const lenses: vscode.CodeLens[] = [];
        const text = document.getText();

        // 1. Handle Frontmatter
        // If there is YAML frontmatter, we want to exclude it from the first section's count,
        // or just treat it as "outside" content.
        let contentStartIndex = 0;
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
        const frontmatterMatch = text.match(frontmatterRegex);

        if (frontmatterMatch) {
            contentStartIndex = frontmatterMatch[0].length;
        }

        // 2. Find all headers
        const headerRegex = /^#+\s+(.*)$/gm;
        let match;
        const matches = [];

        // Reset lastIndex because we are using 'g' flag
        headerRegex.lastIndex = 0;

        while ((match = headerRegex.exec(text)) !== null) {
            matches.push({
                match,
                index: match.index
            });
        }

        console.log(`Found ${matches.length} headers`);

        // 3. Calculate ranges and word counts
        for (let i = 0; i < matches.length; i++) {
            const current = matches[i];
            const next = matches[i + 1];

            // The content of this section starts after the current matching line
            const currentHeaderLine = document.lineAt(document.positionAt(current.index));
            const startOffset = document.offsetAt(currentHeaderLine.rangeIncludingLineBreak.end);

            // It ends at the start of the next header, or EOF
            const endOffset = next ? next.index : text.length;

            if (startOffset >= endOffset) {
                // Empty section
                lenses.push(this.createLens(currentHeaderLine.range, 0));
                continue;
            }

            const sectionContent = text.substring(startOffset, endOffset);
            const count = countWords(sectionContent);

            lenses.push(this.createLens(currentHeaderLine.range, count));
        }

        return lenses;
    }

    private createLens(range: vscode.Range, count: number): vscode.CodeLens {
        const command: vscode.Command = {
            title: `${count} words`,
            tooltip: "Word count for this section",
            command: "" // No action
        };
        return new vscode.CodeLens(range, command);
    }
}

function countWords(text: string): number {
    // Strip markdown syntax roughly if needed, or just count whitespace separated chunks.
    // For a writing aid, simple whitespace split is usually sufficient.
    // We trim to avoid counting leading/trailing empty strings.
    const clean = text.trim();
    if (clean.length === 0) {
        return 0;
    }
    return clean.split(/\s+/).length;
}

