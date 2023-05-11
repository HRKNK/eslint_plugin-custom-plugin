/* eslint-disable eslint-plugin/require-meta-type */
/* eslint-disable eslint-plugin/prefer-message-ids */
/* eslint-disable no-unused-vars */
/**
 * @fileoverview FSD
 * @author NK
 */
"use strict";

const path = require('node:path');
const OS = require('os');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
	meta: {
		type: null, // `problem`, `suggestion`, or `layout`
		docs: {
			description: "FSD",
			recommended: false,
			url: null, // URL to the documentation page for this rule
		},
		fixable: 'code', // Or `code` or `whitespace`
		schema: [{ // опции правила извне
			type: 'object',
			properties: {
				alias: {
					type: 'string',
				},
			},
		}], // Add a schema if the rule has options
	},

	create(context) {
		// Достаём alias
		const alias = context.options[0]?.alias || '';

		return {
			ImportDeclaration(ast_node) {
				// Пример: app/shared/ui
				const value = ast_node.source.value; // ast схема: https://astexplorer.net/
				// если есть алиас, то удалим его из путей (для понимания линтером) : оставляем как есть
				const importTo = alias ? value.replace(`${alias}/`, '') : value;

				// абсолютный путь до текущего файла
				const fileName = context.getFilename();

				if(shouldBeRelative(fileName, importTo))
					context.report({node: ast_node, message: 'В рамках слоя пути должны быть относительными',
							fix: (fixer) => {
								// Пример: app/shared/ui (с отсечением имени файла)
								const normalizedPath = normalizePath(fileName).split('src')[1].split('/').slice(0, -1).join('/');

								// Получаем относительный путь (файл | папка): // https://nodejs.org/api/path.html#pathrelativefrom-to
								let relativePath = normalizePath(path.relative(normalizedPath, `/${importTo}`));

								if(!relativePath.startsWith('.')) // Относительно файла пути устанавливаются без ./
									relativePath = './' + relativePath;

								return fixer.replaceText(ast_node.source, `'${relativePath}'`);
							}
						});
			}
		};
	},
};

function isPathRelative(inputPath) {
	// return pipe(inputPath, path.normalize, path.isAbsolute)
	return inputPath === '.' || inputPath.startsWith('./') || inputPath.startsWith('../');
}
const pipe = (...args) => args.reduce((acc, el) => el(acc));

const layers = { // FSD 'слои'
	'entities': 'entities',
	'features': 'features',
	'shared': 'shared',
	'pages': 'pages',
	'widgets': 'widgets',
}

function shouldBeRelative(from, to) {
	if(isPathRelative(to)) {
		return false;
	}

	// Например: entities/article
	const toArray = to.split('/');
	const toLayer = toArray[0]; // entities
	const toSlice = toArray[1]; // article

	if(!toLayer || !toSlice || !layers[toLayer]) { // Ищем в слоях текущий слой: layers[entities]
		return false; // в НЕ случае: false
	}

	const fromNormalizedPath = normalizePath(from); // проверяем/исправляем системные пути
	const fromPath = fromNormalizedPath.split('src')[1]; // получаем строку пути после src: src/entities/article
	const fromArray = fromPath.split('/'); // [ 'src', 'entities', 'article' ]

	const fromLayer = fromArray[1]; // entities
	const fromSlice = fromArray[2]; // Article

	if(!fromLayer || !fromSlice || !layers[fromLayer]) { // Ищем в слоях текущий слой: layers[entities]
		return false; // в НЕ случае: false
	}
	
	// Сравнение путей: from и to
	return fromSlice === toSlice && toLayer === fromLayer;
}

function normalizePath(execPath) {
	let splitter = (OS.type() === "Windows_NT") ? "\\" : "/";
	const normalizedPath = path.normalize(execPath)
	let nameSpacedPath = normalizedPath.split(splitter);
	return (nameSpacedPath.join('/'));
}


// Консоль для отладки путей

// console.log(shouldBeRelative('C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\entities\\Article', 'entities/Article/Folder'));
// console.log(shouldBeRelative('C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\entities\\Article', 'entities/Folder/Folder'));
// console.log(shouldBeRelative('C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\entities\\Article', 'app/index.tsx'));
// console.log(shouldBeRelative('C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\entities\\Article', '../../model/Folder/Component'));
// console.log(shouldBeRelative('C:/Users/User/Desktop/JS/Project_Folder/src/entities/Article', 'entities/Article/Folder/Component'));