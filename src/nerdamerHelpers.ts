import nerdamer from "nerdamer/all.min";

export function setNerdamerVariable(variable: string, value: string): string {
  nerdamer.setVar(variable, value);
  return `${variable} := ${value}`;
}

export function solveExpression(expression: string, variable: string): string {
  const result = nerdamer.solve(expression, variable);
  return `${expression} \\Rightarrow ${variable} = ${result}`;
}

export function evaluateExpression(content: string): string {
  const expression = content.replace("=?", "");
  // result as numeric value in scientific notation
  let result = nerdamer(expression).evaluate();
  // if result is very small or large, convert to scientific notation
  if (result < 1e-3 || result > 1e3) result = result.text("scientific");
  else result = result.text("decimals", 5);

  return `${expression} \\Rightarrow ${result}`;
}

export function createFunction(name: string, variable: string, expression: string): string {
  nerdamer.setFunction(name, variable, expression);
  return `${name}(${variable}) = ${expression}`;
}
