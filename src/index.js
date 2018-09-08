const { parse } = require('./parser');
const { check } = require('./types');
const { compile } = require('./codegen');
const { readFileSync, existsSync } = require('fs');

const getAst = program => {
  const ast = parse(program);
  const diagnostics = check(ast).diagnostics;

  if (diagnostics.length) {
    console.error(diagnostics.join('\n'));
    process.exit(1);
  }

  return ast;
};

const filename = process.argv.pop();

if (!existsSync(filename)) {
  console.error(`"${fileName}" does not exist.`);
  process.exit(1);
}

const program = readFileSync(filename, { encoding: 'utf-8' });
const ast = getAst(program);
const compiled = compile(ast);

console.log(compiled);
