const { SymbolTableImpl, Scope } = require('../types/symboltable');
const { ASTNodes } = require('../ast');
const prettier = require('prettier');
const SymbolTable = new SymbolTableImpl();

const compile = ast => {
  if (!ast) {
    return '';
  }

  switch (ast.type) {
    case ASTNodes.Literal:
      return ast.value;
    case ASTNodes.Identifier:
      return ast.name;
    case ASTNodes.Condition: {
      const targetCondition = compile(ast.condition);
      const targetThen = compile(ast.then);
      const targetElse = compile(ast.el);
      return `${targetCondition} ? ${targetThen} : ${targetElse}\n`;
    }
    case ASTNodes.Abstraction: {
      return `(${ast.arg.id.name} => {return ${compile(ast.body)}})`;
    }
    case ASTNodes.IsZero: {
      return `${compile(ast.expression)} === 0\n`;
    }
    case ASTNodes.Arithmetic: {
      const { operator } = ast;
      const value = compile(ast.expression);
      switch (operator) {
        case 'inc':
          return `${value} + 1\n`;
        case 'pred':
          return `(${val} - 1 >= 0) ? ${val} - 1 : 0\n`;
      }
    }
    case ASTNodes.Application: {
      const left = compile(ast.left);
      const right = compile(ast.right);
      return `${left}(${right})\n`;
    }
    default:
      return '';
  }
};

module.exports.compile = ast =>
  prettier.format(compile(ast), {
    printWidth: 80,
    tabWidth: 2,
    trailingComma: 'none',
    bracketSpacing: true,
    parser: 'babylon'
  });
