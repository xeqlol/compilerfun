import * as prettier from 'prettier';
import { ASTNodes } from '../ast';

export function generateCode(ast) {
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
      return `(${ast.arg.id.name} => ${generateCode(ast.body)})`;
    }
    case ASTNodes.IsZero: {
      return `${generateCode(ast.expression)} === 0\n`;
    }
    case ASTNodes.Arithmetic:
      return generateArithmetic(ast);
    case ASTNodes.Application: {
      const left = generateCode(ast.left);
      const right = generateCode(ast.right);
      return `${left}(${right})\n`;
    }
    default:
      return '';
  }
}

export function generateCondition(ast) {
  const targetCondition = generateCode(ast.condition);
  const targetThen = generateCode(ast.then);
  const targetElse = generateCode(ast.el);
  return `${targetCondition} ? ${targetThen} : ${targetElse}\n`;
}

export function generateArithmetic(ast) {
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

export function generateDefaultArithmetic(ast) {
  const { operator } = ast;
  const value = generateCode(ast.expression);
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

export function generateBinaryArithmetic(ast) {
  const { expression, operator } = ast;
  const left = generateCode(expression.left);
  const right = generateCode(expression.right);
  switch (operator) {
    case 'mul':
      return `(${left} * ${right}\n)`;
    case 'div':
      return `(${left} / ${right}\n)`;
    case 'sum':
      return `(${left} + ${right}\n)`;
    case 'sub':
      return `(${left} - ${right}\n)`;
    default:
      return '';
  }
}

export function compile(ast) {
  return prettier.format(generateCode(ast), {
    printWidth: 80,
    tabWidth: 2,
    trailingComma: 'none',
    bracketSpacing: true,
    parser: 'babylon'
  });
}
