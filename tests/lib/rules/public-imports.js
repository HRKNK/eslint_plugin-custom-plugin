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
  ],

  invalid: [
	{
		code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/file.ts'",
		errors: [{ message: "Импорт выполнен не из Public API (public.ts)"}],
		options: aliasOptions,
	},
  ],
});
