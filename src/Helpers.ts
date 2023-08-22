import nerdamer from "nerdamer/all.min";

export function setNerdamerVariable(variable: string, value: string): string {
  nerdamer.setVar(variable, value);
  return `${variable} := ${value}`;
}

export function solveExpression(expression: string, variable: string): string {
  const result = nerdamer.solve(expression, variable);
  return `${expression} \\Rightarrow ${variable} = ${result.text("decimals", 5)}`;
}

export function evaluateExpression(content: string): string {
  const expression = content.replace("=?", "");
  // result as numeric value in scientific notation
  const result = nerdamer(expression).evaluate();

  return `${expression} \\Rightarrow ${result.text("decimals", 5)}`;
}

export function createFunction(name: string, variable: string, expression: string): string {
  nerdamer.setFunction(name, variable, expression);
  return `${name}(${variable}) = ${expression}`;
}
