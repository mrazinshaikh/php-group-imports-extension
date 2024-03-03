// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "php-short-imports" is now active!');

	function optimizeImports() {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No open text editor');
			return;
		}

		const activeDocument = vscode.window.activeTextEditor?.document;
		if (activeDocument && activeDocument.languageId !== 'php') {
			vscode.window.showInformationMessage('This command only works on PHP files.');
			return;
		}

		const text = editor.document.getText();
		const importLines = text.match(/^use [^;]+;/gm);
		if (!importLines) {
			vscode.window.showInformationMessage('No imports found');
			return;
		}

		const organizedImports = organizeImports(importLines);
		const newText = text.replace(/^(use [^;]+;\n)+/gm, organizedImports.join("\n") + "\n");

		editor.edit(editBuilder => {
			const entireRange = new vscode.Range(
				editor.document.positionAt(0),
				editor.document.positionAt(text.length)
			);
			editBuilder.replace(entireRange, newText);
		});
	}
	
	function organizeImports(importLines: string[]) {
		type ImportGroupsType = {
			[key: string]: Array<any>;
		};

		const importGroups: ImportGroupsType = {};
		importLines.forEach(line => {
			type PATH = string | RegExpMatchArray | null;
			let path: PATH = line.match(/^use (.*);$/);
			path = path ? path[1] : '';
			const [base, ...rest] = path.split('\\').reverse();
			const namespace: string = rest.reverse().join('\\');
			if (!importGroups[namespace]) {
				importGroups[namespace] = [];
			}
			importGroups[namespace].push(base);
		});

		return Object.entries(importGroups).map(([namespace, bases]) => {
			if (bases.length === 1) {
				return `use ${namespace}\\${bases[0]};`;
			} else {
				return `use ${namespace}\\{${bases.join(', ')}};`;
			}
		});
	}


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('php-short-imports.sortImports', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		optimizeImports();
		vscode.window.showInformationMessage('Hello World from PHP Short Imports!');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
