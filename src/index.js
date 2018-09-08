const { parse } = require('./parser');
const { check } = require('./types');
const { compile } = require('./codegen');

const getAst = program => {
  const ast = parse(program);
  const { diagnostics } = check(ast);

  if (diagnostics.length) {
    console.error(diagnostics.join('\n'));
    process.exit(1);
  }

  return ast;
};

module.exports.run = source => {
  const ast = getAst(source);
  return compile(ast);
};
