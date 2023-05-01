/* eslint-disable eslint-plugin/require-meta-type */
/* eslint-disable eslint-plugin/prefer-message-ids */
/* eslint-disable no-unused-vars */
/**
 * @fileoverview Port isolation (public api)
 * @author NK
 */
"use strict";

const micromatch = require('micromatch');

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
	type: null, // `problem`, `suggestion`, or `layout`
	docs: {
		description: "Port isolation (public api)",
		recommended: false,
		url: null, // URL to the documentation page for this rule
	},
	fixable: null, // Or `code` or `whitespace`
		schema: [{ // опции правила извне
			type: 'object',
			properties: {
				alias: {
					type: 'string',
				},
				testFiles: {
					type: 'array'
				},
				publicFile: {
					type: 'string'
				}
			},
		}], // Add a schema if the rule has options
  },

	create(context) {
		// Достаём alias
		const { alias = '', testFiles = [], publicFile = 'public'} = context.options[0] ?? {};

		const layers = { // FSD 'слои'
			'entities': 'entities',
			'features': 'features',
			'pages': 'pages',
			'widgets': 'widgets',
		}

		return {
			ImportDeclaration(ast_node) {
				// Пример: app/shared/ui
				const value = ast_node.source.value; // ast схема: https://astexplorer.net/
				// если есть алиас, то удалим его из путей (для понимания линтером) : оставляем как есть
				const importTo = alias ? value.replace(`${alias}/`, '') : value;

				if (isPathRelative(importTo))
					return;

				// [ 'entities', 'article', 'model' ]
				const segments = importTo.split('/');
				const isImportNotFromPublicApi = segments.length > 3;

				// Проверим наличие кастомного паблика (своё имя: public.ts)
				const myPublicApi = segments.some(segment => segment.toLowerCase().includes(publicFile));

				// если текущий слой не совпадает со списком доступных
				const layer = segments[0];
				if(!layers[layer])
					return;

				// [ 'entities', 'article', 'testing.ts' ]
				const isTestingPublicApi = segments[2] === 'testing' && segments.length < 4

				if(isImportNotFromPublicApi && myPublicApi && !isTestingPublicApi) {
					context.report({node: ast_node, message: 'Импорт выполнен не из Public API (public.ts)'});
				}

				if(isTestingPublicApi) {
					// абсолютный путь до текущего файла
					const currentFilePath = context.getFilename();
					const isCurrentFileTesting = testFiles.some( 
						// вернет boolean если pattern соответствует currentFilePath
						pattern => micromatch.isMatch(currentFilePath, pattern)
					)

					if(!isCurrentFileTesting) {
						context.report({node: ast_node, message: 'Импорт выполнен не из Public API (testing.ts)'});
					}
				}
			}
		};
	},
};

function isPathRelative(inputPath) {
	// return pipe(inputPath, path.normalize, path.isAbsolute)
	return inputPath === '.' || inputPath.startsWith('./') || inputPath.startsWith('../');
}