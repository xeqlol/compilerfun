import { Scope, SymbolTableImpl } from './symboltable';
import { ASTNodes, Types } from '../ast';

const SymbolTable = new SymbolTableImpl();

export function check(ast, diagnostics = []) {
  if (!ast) {
    return {
      diagnostics
    };
  }
  switch (ast.type) {
    case ASTNodes.Literal:
      return checkLiteral(ast, diagnostics);
    case ASTNodes.Identifier:
      return checkIdentifier(ast, diagnostics);
    case ASTNodes.Condition:
      return checkCondition(ast, diagnostics);
    case ASTNodes.Abstraction:
      return checkAbstraction(ast, diagnostics);
    case ASTNodes.IsZero:
      return checkIsZero(ast, diagnostics);
    case ASTNodes.Arithmetic:
      return checkArithmetic(ast, diagnostics);
    case ASTNodes.Application:
      return checkApplication(ast, diagnostics);
    default:
      return { diagnostics };
  }
}

export function typeEq(left, right) {
  if (left instanceof Array && right instanceof Array) {
    if (left.length !== right.length) {
      return false;
    } else {
      for (let i = 0; i < left.length; i += 1) {
        if (!typeEq(left[i], right[i])) {
          return false;
        }
      }
      return true;
    }
    /* eslint no-else-return: off */
  } else if (typeof left === 'string' && typeof right === 'string') {
    return left === right;
  }
  return false;
}

export function checkLiteral(ast, diagnostics) {
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

export function checkIdentifier(ast, diagnostics) {
  return {
    diagnostics,
    type: SymbolTable.lookup(ast.name)
  };
}

export function checkCondition(ast, diagnostics) {
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
  }
  diagnostics.push('Incorrect type of then/else branches');
  return {
    diagnostics
  };
}

export function checkAbstraction(ast, diagnostics) {
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

export function checkIsZero(ast, diagnostics) {
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

export function checkArithmetic(ast, diagnostics) {
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

export function checkApplication(ast, diagnostics) {
  const l = check(ast.left);
  const leftType = l.type || [];
  diagnostics = diagnostics.concat(l.diagnostics);
  const r = check(ast.right);
  const rightType = r.type || [];
  diagnostics = diagnostics.concat(r.diagnostics);
  if (leftType.length) {
    if (
      !ast.right || leftType instanceof Array
        ? leftType.every(x => x === rightType)
        : leftType === rightType
    ) {
      return {
        diagnostics,
        type: leftType instanceof Array ? leftType[1] : leftType
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
