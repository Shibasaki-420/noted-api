import * as vscode from 'vscode';
import * as fs from 'fs';

/**
 * doc根目录的名称。
 */
const rootName: string = 'api-notes';

/**
 * doc根目录的绝对路径。
 */
export var docDir: string = '';

/**
 * 当前选择的doc。
 */
export var selectedDoc: string = '';

/**
 * 更改当前选择的doc。
 */
export function setSelectedDoc(newSelectDoc: string) {
	selectedDoc = newSelectDoc;
}

/**
 * 从settings中加载doc根目录绝对路径。
 */
export function loadDocDir() {
	docDir = vscode.workspace.getConfiguration('noted-api').get('docDir') as string;

	if (docDir === '') {
		docDir = 'D:\\';
	} 

	if (docDir.endsWith('\\') === false) {
		docDir = docDir + '\\';
	}

	docDir = docDir + rootName + '\\';

	if (fs.existsSync(docDir) === false) {
		fs.mkdirSync(docDir);
		vscode.window.showInformationMessage('Noted API: 根目录已创建于 ' + docDir + ' 。');
	}
}

/**
 * 从settings中加载默认选择的文档。
*/
export function loadDefaultSelectDoc() {
	selectedDoc = vscode.workspace.getConfiguration('noted-api').get('defaultSelectedDoc') as string;

	if (selectedDoc === '') {
		return;
	} 

	let noteDir = docDir + selectedDoc + '\\';

	if (fs.existsSync(noteDir) === false) {
		fs.mkdirSync(noteDir);
		vscode.window.showInformationMessage('文档已创建：' + selectedDoc);
	}
}

/**
 * 为API创建新笔记。
 */
export async function createNewNote(API: string) {

	if (API === '') {
		return;
	}

	// 如果当前还没有选中doc，则不能创建笔记。
	if (selectedDoc === '') {
		vscode.commands.executeCommand('noted-api.chooseDoc');
	}

	if (selectedDoc === '') {
		return;
	}
	
	let noteDir = docDir + selectedDoc + '\\' + API + '.md';

	if (fs.existsSync(noteDir)) {
		vscode.window.showInformationMessage('笔记已存在：' + API);
		return;
	}

	fs.writeFileSync(noteDir, '**' + API + '**');

	vscode.window.showInformationMessage('笔记创建成功：' + API);
	const doc = await vscode.workspace.openTextDocument(noteDir);
	await vscode.window.showTextDocument(doc, { preview: false });
}

/**
 * 返回doc列表。
 * @return docs
 */
export function fetchDocs() {
	let docs: vscode.QuickPickItem[] = [];

	// 从根目录中读取doc文件夹
	let files = fs.readdirSync(docDir);
	
	// 开始收集doc
	files.forEach(fileName => {
		docs.push({label: fileName, description: fileName === selectedDoc ? '✔' : ''});			
	});
	
	return docs;
}

/**
 * 返回当前选择的doc的pick列表。
 * @return picks
 */
export function fetchPicks() {

	let picks: string[] = [];

	// 如果当前还没有选中doc，则不能查看API。
	if (selectedDoc.length === 0) {
		vscode.commands.executeCommand('noted-api.chooseDoc');
	}

	if (selectedDoc.length === 0) {
		return picks;
	}

	// API笔记文件夹的绝对路径。
	let notesDir: string = docDir + selectedDoc + '\\';

	// 打开API笔记文件夹
	let files: string[] = fs.readdirSync(notesDir);

	// 开始收集pick
	files.forEach(fileName => {

		// 每篇API笔记的绝对路径。
		let note: string = notesDir + fileName;

		let data = fs.readFileSync(note, 'utf-8');
			
		// 获取每一个文件的pick
		let lines: string[] = data.split('\n');
		
		let description: string = lines[2];
		let api: string = fileName.substring(0, fileName.length-3);
		let pick: string = api + ' ' + description;
		picks.push(pick);
	});

	return picks;
}

/**
 * 打开`API`的笔记。
 */
export async function openNoteOf(API: string) {
	
	// 如果当前还没有选中doc，则不能查看API。
	if (selectedDoc.length === 0) {
		vscode.commands.executeCommand('noted-api.chooseDoc');
	}

	if (selectedDoc.length === 0) {
		return;
	}

	let noteDir = docDir + selectedDoc + '\\' + API + '.md';

	if (fs.existsSync(noteDir) === false) {
		fs.writeFileSync(noteDir, '**' + API + '**');
		vscode.window.showInformationMessage('笔记创建成功：' + API);
	}

	const doc = await vscode.workspace.openTextDocument(noteDir);
	await vscode.window.showTextDocument(doc, { preview: false });
}

/**
 * 悬停提示函数。
 */
export function provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {

	// 获取指针范围的表达式
	let range = document.getWordRangeAtPosition(position, /[A-Za-z_][A-Za-z_.\-0-9]*/);
	let API: string = document.getText(range);
	
	if (API === '') { return; }

	let noteDir = docDir + selectedDoc + '\\' + API + '.md';

	if (fs.existsSync(noteDir)) {
		let data = fs.readFileSync(noteDir, 'utf-8');

		return new vscode.Hover(data);
	}
}

/**
 * 创建新doc。
 */
export function createNewDoc(doc: string) {

	let newDocDir = docDir + doc + '\\';

	if (fs.existsSync(newDocDir) === false) {
		fs.mkdirSync(newDocDir);
		selectedDoc = doc;
		vscode.window.showInformationMessage('文档创建成功：' + doc);
	}	
	else {
		vscode.window.showInformationMessage('文档已存在：' + doc);
	}
}