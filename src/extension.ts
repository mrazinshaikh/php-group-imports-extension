// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "php-group-imports" is now active!');

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
		const importLines = text.match(/^((\#(.*))|((\/\/(\s+)?)|((\/(\*+))(\s+)?))?use [^;]+;)?(.*\*\/.*$)?/gm);
		// const importLines = text.match(/^((\/\*\*?[^*]*\*+(?:[^\/*][^*]*\*+)*\/\s*)?use [^;]+;\s*)|(\/\/\s*use [^;]+;\s*)$/gm);
		if (!importLines) {
			vscode.window.showInformationMessage('No imports found');
			return;
		}

		const organizedImports = organizeImports(importLines.filter(n => n));
		const organizedImportString = organizedImports.join("\n");

		// Split text into lines
		let lines = text.split("\n");

		/**
		 * Find the block of import statements
		 * 
		 * A line-by-line processing approach, while seemingly more verbose,
		 * often gives us more control and clarity,
		 * especially when dealing with nuanced patterns like comments among import statements.
		 */
		let start = -1, end = -1;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].match(/^((\#(\s+)?)|(\/(\*)+(\s+)?)?use [^;]+;\s*)|(\/\/\s*use [^;]+;\s*)$/g)) { // Working for # and //
				if (start === -1) {start = i;}
				end = i;
			}
		}

		let newText = '';
		// Check if we found an imports block
		if (start !== -1 && end !== -1) {
			// Replace the block with organized imports
			let before = lines.slice(0, start).join("\n");
			let after = lines.slice(end + 1).join("\n");
			newText = `${before}\n${organizedImportString}\n${after}`;
		}

		editor.edit(editBuilder => {
			// TODO: instead of whole file re-write, only replace imports for performance.
			const entireRange = new vscode.Range(
				editor.document.positionAt(0),
				editor.document.positionAt(text.length)
			);
			editBuilder.replace(entireRange, newText);
		});
	}
	
	function organizeImports(importLines: string[]) {
		type ImportGroupsType = {
			[key: string]: Set<string>;
		};

		const importGroups: ImportGroupsType = {};
		const commentedImports: Set<string> = new Set();

		let blockCommentStarted = false;
		importLines.forEach(line => {
			line = line.trim();

			type PATH = string | RegExpMatchArray | null;

			// Commented import should be skipped
			let isCommented: PATH = line.match(/^((\#(.*))|(\/\/(\s+)?))use (.*);$/);
			let isBlockCommentedStart: PATH = line.match(/^(\/\*+?\s*use\s+(.*?);)|(use\s*\*\/.*$)/);
			let isBlockCommentedEnd: PATH = line.match(/^.*\*\/.*$/);

			if (isCommented) {
				commentedImports.add(line);
				return;
			}

			if (isBlockCommentedStart) {
				blockCommentStarted = true;
			}

			if (isBlockCommentedStart || blockCommentStarted) {
				if (isBlockCommentedEnd) {
					blockCommentStarted = false;
				}
				commentedImports.add(line);
				return;
			}
			
			let path: PATH = line.match(/^use (.*);$/);
			path = path ? path[1] : '';
			const [base, ...rest] = path.split('\\').reverse();
			const namespace: string = rest.reverse().join('\\');

			if (!base) {
				// Skip if base is undefined or an empty string
				return;
			}
			
			if (!importGroups[namespace]) {
				importGroups[namespace] = new Set();
			}
			importGroups[namespace].add(base);
		});

		const organizedImports = Object.entries(importGroups).map(([namespace, basesSet]) => {

			let bases = Array.from(basesSet); // Convert Set to Array for sorting or further manipulation
			// Check and split if one of the bases is already a grouped import
			bases = bases.reduce((acc: Array<string>, base) => {
				if (base.startsWith('{') && base.endsWith('}')) {
					// Split the grouped base and add individual parts
					const splitBases = base.slice(1, -1).split(', ');
					acc.push(...splitBases);
				} else {
					acc.push(base);
				}
				return acc;
			}, []);

			if (bases.length === 1) {
				return `use ${namespace}\\${bases[0]};`;
			} else {
				const basesSorted = getSortedStatements(bases);

				return `use ${namespace}\\{${basesSorted.join(', ')}};`;
			}
		});

		// TODO: sort if enable via extension setting.
		const organizedImportsSorted = organizedImports.sort((a, b) => a.length - b.length);
		organizedImportsSorted.push(...Array.from(commentedImports));

		return organizedImports;
	}

	function getSortedStatements(bases: Array<string>): Array<string> {
		type SortAlgorithm =  'alpha' | 'length' | 'none';

		const config = vscode.workspace.getConfiguration("phpGroupImports");
		const sortAlgo = config.get('sortAlgorithm') as SortAlgorithm | undefined;

		if (sortAlgo === 'alpha') {
			return bases.sort();
		}

		if (sortAlgo === 'length') {
			return bases.sort((a, b) => a.length - b.length);
		}

		return bases; // sortAlgo === 'none'
	}


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('php-group-imports.groupImports', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		optimizeImports();

		const phpGroupImportsConfig = vscode.workspace.getConfiguration('phpGroupImports');
		const notifyOnComplete = phpGroupImportsConfig.get('notifyOnComplete') as boolean | undefined;
		if (notifyOnComplete) {
			vscode.window.showInformationMessage('PHP Group Imports Completed.');
		}
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
