import * as vscode from 'vscode';
import * as pickFetcher from './picksFetcher';

export function activate(context: vscode.ExtensionContext) {

	pickFetcher.loadDocDir();
	console.log('✔️ docDir loaded');

	pickFetcher.loadDefaultSelectDoc();
	console.log('✔️ default selection loaded.');

	let docs = pickFetcher.fetchDocs();
	console.log('✔️ doc loaded.');

	let picks = pickFetcher.fetchPicks();
	console.log('✔️ pick loaded.');
	
	console.log('Congratulations, your extension "noted-api" is now active!');

	// 搜索API命令。
	let searchAPICommand = vscode.commands.registerCommand('noted-api.searchAPI', async () => {
		//打开quickPick等待输入
		const pick = await vscode.window.showQuickPick(picks, { placeHolder: 'search API'});
		if (pick) {

			// 提取选择的api
			let api: string = pick.split(' ')[0];

			// 打开API的笔记
			pickFetcher.openNoteOf(api);
		}
	});

	// 搜索Doc命令
	let chooseDocCommand = vscode.commands.registerCommand('noted-api.chooseDoc', async () => {

		// 打开quickPick等待输入
		const doc = await vscode.window.showQuickPick(docs, { placeHolder: 'choose doc'});
		if (doc) {
			pickFetcher.setSelectedDoc(doc.label);

			// 更新picks
			picks = pickFetcher.fetchPicks();
			docs = pickFetcher.fetchDocs();
		}
	});

	// 添加笔记
	let createNewNoteCommand = vscode.commands.registerCommand('noted-api.createNewNote', async () => {
		
		// 打开Input
		let API = await vscode.window.showInputBox({ 'placeHolder': 'Enter API as title of the new note.'});

		if (API) {
			pickFetcher.createNewNote(API);	
		}

		picks = pickFetcher.fetchPicks();
	});

	// 刷新picks列表
	let refreshNoteListCommand = vscode.commands.registerCommand('noted-api.refreshNoteList', async () => {

		picks = pickFetcher.fetchPicks();
	});

	// 打开笔记
	let openNoteAtCursorCommand = vscode.commands.registerCommand('noted-api.openNoteAtCursor', async () => {

		let editor = vscode.window.activeTextEditor;	

		if (editor) {
			// 获取指针范围的表达式
			let range = editor.document.getWordRangeAtPosition(editor.selection.active, /[A-Za-z_][A-Za-z_.\-0-9]*/);
			let API: string = editor.document.getText(range);
			
			if (API === '') { return; }

			pickFetcher.openNoteOf(API);
		}
	});

	// 悬停提示
	let provideHover = pickFetcher.provideHover;
	let hoverProvider = vscode.languages.registerHoverProvider(
		['c', 'cpp', 'java', 'python', 'php', 'rust', 'typescript', 'javascript', 'css', 'html', 'sql', 'markdown', 'bash', 'powershell'],
		{provideHover}
	);

	// 创建新doc
	let createNewDocCommand = vscode.commands.registerCommand('noted-api.createNewDoc', async () => {
	
		// 打开Input
	let doc = await vscode.window.showInputBox({ 'placeHolder': 'Enter the name of your new doc.'});

		if (doc) {
			pickFetcher.createNewDoc(doc);	
			docs = pickFetcher.fetchDocs();	
		}
	});


	context.subscriptions.push(searchAPICommand);
	context.subscriptions.push(chooseDocCommand);
	context.subscriptions.push(createNewNoteCommand);
	context.subscriptions.push(refreshNoteListCommand);
	context.subscriptions.push(openNoteAtCursorCommand);
	context.subscriptions.push(hoverProvider);
	context.subscriptions.push(createNewDocCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {}
