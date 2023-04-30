/**
 * @fileoverview FSD
 * @author NK
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
	parserOptions: { ecmaVersion: 6, sourceType: 'module' }, // опции парсинга (под ES)
});
ruleTester.run("path-checker", rule, {
  valid: [
	{
		filename: 'C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\shared\\ui',
		code: "import { Icon } from '../Icon/Icon'",
		errors: [],
	},
  ],

  invalid: [
	{
		filename: 'C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\shared\\ui',
		code: "import { Icon } from 'shared/ui/Icon/Icon'",
		errors: [{ message: "В рамках слоя пути должны быть относительными" }], // , type: "Me too"
	},
	{
		filename: 'C:\\Users\\User\\Desktop\\JS\\Project_Folder\\src\\shared\\ui',
		code: "import { Icon } from '@/shared/ui/Icon/Icon'",
		errors: [{ message: "В рамках слоя пути должны быть относительными" }], // , type: "Me too"
		options: [{
			alias: '@'
		}]
	},
  ],
});
