/* eslint-disable no-unused-vars */
/**
 * @fileoverview Prohibition of invalid imports (for FSD)
 * @author NK
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/layer-imports"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const aliasOptions = [
  {
    alias: '@'
  }
]

const ruleTester = new RuleTester();
ruleTester.run("layer-imports", rule, {
  valid: [

  ],

  invalid: [

  ],
});
