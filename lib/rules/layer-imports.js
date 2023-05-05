/* eslint-disable eslint-plugin/require-meta-type */
/* eslint-disable eslint-plugin/prefer-message-ids */
/* eslint-disable no-unused-vars */

/**
 * @fileoverview Prohibition of invalid imports (for FSD)
 * @author NK
 */
"use strict";

const micromatch = require('micromatch');
const path = require('node:path');
const OS = require('node:os');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
	type: null, // `problem`, `suggestion`, or `layout`
	docs: {
		description: "Prohibition of invalid imports (for FSD)",
		recommended: false,
		url: null, // URL to the documentation page for this rule
	},
	fixable: null, // Or `code` or `whitespace`
	schema: [{
		type: 'object',
		properties: {
			alias: {
				type: 'string',
			},
			ignoreImportPatterns: {
				type: 'array',
			}
		},
	}], // Add a schema if the rule has options
  },

  create(context) {
	// Правила вложенности (переиспользуемость арх-рой)
	const layersRule = {
		'app': ['pages', 'widgets', 'features', 'shared', 'entities'], // доступны нижестоящие слои
		'pages': ['widgets', 'features', 'shared', 'entities'],
		'widgets': ['features', 'shared', 'entities'],
		'features': ['shared', 'entities'], // исключение
		'entities': ['shared', 'entities'], // исключение
		'shared': ['shared'],
	}
	const layers = { // FSD 'слои'
		'app': 'app',
		'entities': 'entities',
		'features': 'features',
		'shared': 'shared',
		'pages': 'pages',
		'widgets': 'widgets',
	}

	// Достаём alias
	const {alias = '', ignoreImportPatterns = []} = context.options[0] ?? {};

	const getCurrentFileLayer = () => {
		const currentFilePath = context.getFilename(); // абсолютный путь до текущего файла
		const fromNormalizedPath = normalizePath(currentFilePath); // проверяем/исправляем системные пути
		const projectPath = fromNormalizedPath?.split('src')[1]; // получаем строку пути после src: src/entities/article
		const segments = projectPath?.split('/'); // [ 'src', 'entities', 'article' ]
		return segments?.[1]; // ['entities']
	}

	const getImportLayer = (value) => {
		// если есть алиас, то удалим его из путей (для понимания линтером) : оставляем как есть
		const importPath = alias ? value.replace(`${alias}/`, '') : value;
		const segments = importPath?.split('/');
		return segments?.[0]; // ['entities']
	}

	return {
		ImportDeclaration(node) {
				// Пример: app/shared/ui
				const importPath = node.source.value; // ast схема: https://astexplorer.net/
				const currentFileLayer = getCurrentFileLayer();
				const importLayer = getImportLayer(importPath);

				// Проверка на относительный путь
				if(isPathRelative(importPath))
					return;

				// если текущий слой не совпадает со списком доступных
				if(!layers[importLayer] || !layers[currentFileLayer])
					return;

				// Список игнорируемых
				const isIgnored = ignoreImportPatterns.some(pattern => {
					return micromatch.isMatch(importPath, pattern);
				});
				if(isIgnored)
					return;

				// НЕ(если в массиве layersRule[entities] находится entities)
				if(!layersRule[currentFileLayer]?.includes(importLayer)) {
					context.report({node: node, message: "Нарушено архитектурное правило переиспользуемости слоёв: [ 'shared', 'entities', 'features', 'widgets', 'pages', 'app' ]"});
				}
			}
		};
	},
};

function isPathRelative(inputPath) {
	// return pipe(inputPath, path.normalize, path.isAbsolute)
	return inputPath === '.' || inputPath.startsWith('./') || inputPath.startsWith('../');
}

function normalizePath(execPath) {
	let splitter = (OS.type() === "Windows_NT") ? "\\" : "/";
	const normalizedPath = path.normalize(execPath)
	let nameSpacedPath = normalizedPath.split(splitter);
	return (nameSpacedPath.join('/'));
}