Program = _'('*_ a:Application _')'?_ {
  return a;
}

Application = l:ExprAbs r:Application* {
  if (!r || !r.length) {
    return l;
  } else {
    r = r.pop();
    return { type: 'application', left: l, right: r};
  }
};

ExprAbs = Expr / Abstraction;

Abstraction = _ '('* _ Fn _ id:Identifier ':' t:Type '->' f:Application _ ')'? _ {
  return { type: 'abstraction', arg: { type: t, id: id }, body: f };
}

Expr = IfThen / IsZeroCheck / ArithmeticOperation / NumberLiteral / True / False / Identifier / ParanExpression

ArithmeticOperation = o:Operator e:Application {
  return { type: 'arithmetic', operator: o, expression: e };
};

IsZeroCheck = IsZero e:Application {
  return { type: 'is_zero', expression: e };
}

Operator = _ op:('inc' / 'dec' / 'mul' / 'div' / 'sum' / 'sub' / 'pred') _ {
	return op;
}

IfThen = If expr:Application Then then:Application Else el:Application {
  return { type: 'conditional_expression', condition: expr, then: then, el: el };
}

Type =  Num / Bool

_  = [ \t\r\n]*

__ = [ \t\r\n]+

Identifier = !ReservedWord _ id:[a-z]+ _ {
  return { name: id.join(''), type: 'identifier' };
}

ParanExpression = _'('_ expr:Expr _')'_ {
  return expr;
}

True = _ 'true' _ {
  return { type: 'literal', value: true };
}

False = _ 'false' _ {
  return { type: 'literal', value: false };
}

NumberLiteral = _ id:(('+' / '-')? [0-9]+ ('.' [0-9]+)*) _ {
  return { type: 'literal', value: parseFloat((function flatten(array) {
    return array.reduce((arr, item) => arr.concat(item instanceof Array ? flatten(item) : item), [])
    })(id).join(''))};
}

ReservedWord = If / Then / Else / Num / Bool / IsZero / False / Fn

If = _'if'_

Then = _'then'_

Else = _'else'_

Num = _'number'_ {
  return 'number';
}

Bool = _'boolean'_ {
  return 'boolean';
}

IsZero = _'iszero'_ {
  return 'iszero';
}

Fn = _'fn'_ {
	return 'fn';
}

