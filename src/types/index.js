const { Scope, SymbolTableImpl } = require('./symboltable');
const { ASTNodes, Types } = require('../ast');

const SymbolTable = new SymbolTableImpl();

const typeEq = (a, b) => {
  if (a instanceof Array && b instanceof Array) {
    if (a.length !== b.length) {
      return false;
    } else {
      for (let i = 0; i < a.length; i += 1) {
        if (!typeEq(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
  } else {
    if (typeof a === 'string' && typeof b === 'string') {
      return a === b;
    }
  }
  return false;
};

const check = (ast, diagnostics) => {
  diagnostics = diagnostics || [];

  if (!ast) {
    return {
      diagnostics
    };
  }
  switch (ast.type) {
    case ASTNodes.Literal: {
      if (typeof ast.value === 'number') {
        return {
          diagnostics,
          type: Types.Number
        };
      } else if (ast.value === false || ast.value === true) {
        return {
          diagnostics,
          type: Types.Boolean
        };
      } else {
        diagnostics.push('Unknown type literal');
        return {
          diagnostics
        };
      }
    }
    case ASTNodes.Identifier: {
      return {
        diagnostics,
        type: SymbolTable.lookup(ast.name)
      };
    }
    case ASTNodes.Condition: {
      if (!ast.then || !ast.el || !ast.condition) {
        diagnostics.push('No condition for a conditional expression');
        return {
          diagnostics
        };
      }
      const c = check(ast.condition);
      diagnostics = diagnostics.concat(c.diagnostics);
      const conditionType = c.type;
      if (!typeEq(conditionType, Types.Boolean)) {
        diagnostics.push('Incorrect type of condition of condition');
        return {
          diagnostics
        };
      }
      const thenBranch = check(ast.then);
      diagnostics = diagnostics.concat(thenBranch.diagnostics);
      const thenBranchType = thenBranch.type;
      const elseBranch = check(ast.el);
      diagnostics = diagnostics.concat(elseBranch.diagnostics);
      const elseBranchType = elseBranch.type;
      if (typeEq(thenBranchType, elseBranchType)) {
        return thenBranch;
      } else {
        diagnostics.push('Incorrect type of then/else branches');
        return {
          diagnostics
        };
      }
    }
    case ASTNodes.Abstraction: {
      const scope = new Scope();
      scope.set(ast.arg.id.name, ast.arg.type);
      SymbolTable.push(scope);
      if (!ast.body) {
        diagnostics.push('No body of a function');
        return {
          diagnostics
        };
      }
      const body = check(ast.body);
      const bodyType = body.type;
      diagnostics = diagnostics.concat(body.diagnostics);
      if (!bodyType) {
        diagnostics.push('Incorrect type of the body');
        return {
          diagnostics
        };
      }
      return {
        diagnostics,
        type: [ast.arg.type, bodyType]
      };
    }
    case ASTNodes.IsZero: {
      const body = check(ast.expression);
      diagnostics = diagnostics.concat(body.diagnostics);
      const bodyType = body.type;
      if (!typeEq(bodyType, Types.Number)) {
        diagnostics.push('Incorrect type of IsZero');
        return {
          diagnostics
        };
      }
      return {
        diagnostics,
        type: Types.Boolean
      };
    }
    case ASTNodes.Arithmetic: {
      const body = check(ast.expression);
      diagnostics = diagnostics.concat(body.diagnostics);
      const bodyType = body.type;
      if (!typeEq(bodyType, Types.Number)) {
        diagnostics.push(`Incorrect type of ${ast.operation}`);
        return {
          diagnostics
        };
      }
      return {
        diagnostics,
        type: Types.Number
      };
    }
    case ASTNodes.Application: {
      const l = check(ast.left);
      const leftType = l.type || [];
      diagnostics = diagnostics.concat(l.diagnostics);
      const r = check(ast.right);
      const rightType = r.type || [];
      diagnostics = diagnostics.concat(r.diagnostics);
      if (leftType.length) {
        if (!ast.right || leftType[0] === rightType) {
          return {
            diagnostics,
            type: leftType[1]
          };
        } else {
          diagnostics.push('Incorrect type of application');
          return {
            diagnostics
          };
        }
      } else {
        return { diagnostics };
      }
    }
    default:
      return { diagnostics };
  }
};

module.exports.check = ast => check(ast);
