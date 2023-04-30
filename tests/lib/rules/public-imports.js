/**
 * @fileoverview Port isolation (public api)
 * @author NK
 */
"use strict";

const rule = require("../../../lib/rules/public-imports"),
	RuleTester = require("eslint").RuleTester;


const ruleTester = new RuleTester({
	parserOptions: {ecmaVersion: 6, sourceType: 'module'}
});

const aliasOptions = [{
	alias: '@'
}];

ruleTester.run("public-imports", rule, {
  valid: [
	{
		code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
		errors: [],
	},
	{
		code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article'",
		errors: [],
		options: aliasOptions,
	},
	{
		filename: 'C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\shared\\ui\\file.test.ts',
		code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
		errors: [],
		options: [{
			alias: '@',
			testFiles: ['**/*.test.ts', '**/*.test.ts', '**/StoreDecorator.tsx']
		}],
	},
	{
		filename: 'C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\shared\\ui\\StoreDecorator.tsx',
		code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
		errors: [],
		options: [{
			alias: '@',
			testFiles: ['**/*.test.ts', '**/*.test.ts', '**/StoreDecorator.tsx']
		}],
	}
  ],

  invalid: [
	{
		code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/file.ts'",
		errors: [{ message: "Импорт выполнен не из Public API (public.ts)"}],
		options: aliasOptions,
	},
	{
		filename: 'C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\entities\\StoreDecorator.tsx',
		code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing/file.tsx'",
		errors: [{message: 'Импорт выполнен не из Public API (public.ts)'}],
		options: [{
			alias: '@',
			testFiles: ['**/*.test.ts', '**/*.test.ts', '**/StoreDecorator.tsx']
		}],
	},
	{
		filename: 'C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\entities\\forbidden.ts',
		code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
		errors: [{message: 'Импорт {тестовых данных} выполнен не из Public API (testing.ts)'}],
		options: [{
		alias: '@',
			testFiles: ['**/*.test.ts', '**/*.test.ts', '**/StoreDecorator.tsx']
		}],
	}
  ],
});
