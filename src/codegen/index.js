const prettier = require('prettier');
const { SymbolTableImpl, Scope } = require('../types/symboltable');
const { ASTNodes } = require('../ast');

function generateCondition(ast) {
  const targetCondition = compile(ast.condition);
  const targetThen = compile(ast.then);
  const targetElse = compile(ast.el);
  return `${targetCondition} ? ${targetThen} : ${targetElse}\n`;
}

function compile(ast) {
  if (!ast) {
    return '';
  }
  switch (ast.type) {
    case ASTNodes.Literal:
      return ast.value;
    case ASTNodes.Identifier:
      return ast.name;
    case ASTNodes.Condition:
      return generateCondition(ast);
    case ASTNodes.Abstraction: {
      return `(${ast.arg.id.name} => ${compile(ast.body)})`;
    }
    case ASTNodes.IsZero: {
      return `${compile(ast.expression)} === 0\n`;
    }
    case ASTNodes.Arithmetic:
      return generateArithmetic(ast);
    case ASTNodes.Application: {
      const left = compile(ast.left);
      const right = compile(ast.right);
      return `${left}(${right})\n`;
    }
    default:
      return '';
  }
}

function generateArithmetic(ast) {
  const {
    expression: { type }
  } = ast;

  switch (type) {
    case ASTNodes.Application:
      return generateBinaryArithmetic(ast);
    default:
      return generateDefaultArithmetic(ast);
  }
}

function generateDefaultArithmetic(ast) {
  const { operator } = ast;
  const value = compile(ast.expression);
  switch (operator) {
    case 'inc':
      return `(${value} + 1\n)`;
    case 'dec':
      return `(${value} - 1\n)`;
    case 'pred':
      return `((${value} - 1 >= 0) ? ${value} - 1 : 0\n)`;
    default:
      return '';
  }
}

function generateBinaryArithmetic(ast) {
  const { expression, operator } = ast;
  const left = compile(expression.left);
  const right = compile(expression.right);
  switch (operator) {
    case 'mul':
      return `${left} * ${right}\n`;
    case 'div':
      return `${left} / ${right}\n`;
    case 'sum':
      return `(${left} + ${right}\n)`;
    case 'sub':
      return `(${left} - ${right}\n)`;
    default:
      return '';
  }
}

module.exports.compile = ast =>
  prettier.format(compile(ast), {
    printWidth: 80,
    tabWidth: 2,
    trailingComma: 'none',
    bracketSpacing: true,
    parser: 'babylon'
  });
