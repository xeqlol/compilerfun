import { parse } from './parser';
import { check } from './types';
import { compile } from './codegen';

const getAst = program => {
  const ast = parse(program);
  const { diagnostics } = check(ast);

  if (diagnostics.length) {
    console.error(diagnostics.join('\n'));
    process.exit(1);
  }

  return ast;
};

export default source => {
  const ast = getAst(source);
  return compile(ast);
};
