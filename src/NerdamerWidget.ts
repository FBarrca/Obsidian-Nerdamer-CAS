// External Libraries
import { syntaxTree } from "@codemirror/language";
import { Extension, RangeSetBuilder, StateField, Transaction } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";
import nerdamer from "nerdamer/all.min";

// Internal Modules
import { LatexWidget } from "./NerdamerDOM";
import { SyntaxNodeRef } from "@lezer/common";

// Patterns for various string matches
const PATTERNS = {
  VARIABLE_DECLARATION: /^([a-z_][a-z\d\_]*):=(.+)$/i,
  SOLVE_STRING: /^solve\(([^,]+),\s*([^)]+)\)$/i,
  EVALUATE_STRING: /^([^=]+)=\?$/i,
  FUNCTION_STRING: /^([a-zA-Z_][a-zA-Z_0-9]*)\s*\(\s*([^)]+)\s*\)\s*:=\s*([^$]+)$/i,
};

// State Field for Nerdamer List
export const NerdamerListField = StateField.define<Decoration>({
  create(): Decoration {
    return Decoration.none;
  },
  update(oldState: Decoration, transaction: Transaction): Decoration {
    const cursorPos = transaction.selection?.main.head;
    if (!cursorPos) return oldState;

    const builder = new RangeSetBuilder<Decoration>();
    syntaxTree(transaction.state).iterate({
      enter(node) {
        if (node.type.name === "inline-code") {
          handleInlineCodeNode(node, cursorPos, transaction, builder);
        }
      },
    });

    return builder.finish();
  },
  provide(field: StateField<Decoration>): Extension {
    return EditorView.decorations.from(field);
  },
});

// ----- Helper Functions -----

// Check if cursor is inside a node
function isCursorInsideNode(cursorPos: number, node: SyntaxNodeRef): boolean {
  return cursorPos >= node.from - 1 && cursorPos <= node.to + 1;
}

function setNerdamerVariable(variable: string, value: string): string {
  nerdamer.setVar(variable, value);
  return `${variable} := ${value}`;
}

function solveExpression(expression: string, variable: string): string {
  const result = nerdamer.solve(expression, variable);
  return `${expression} => ${variable} = ${result}`;
}

function evaluateExpression(content: string): string {
  const expression = content.replace("=?", "");
  const result = nerdamer(expression).evaluate();
  return `${expression} => ${result}`;
}

function createFunction(name: string, variable: string, expression: string): string {
  nerdamer.setFunction(name, variable, expression);
  return `${name}(${variable}) = ${expression}`;
}

function handleInlineCodeNode(
  node: SyntaxNodeRef,
  cursorPos: number,
  transaction: Transaction,
  builder: RangeSetBuilder<Decoration>
): void {
  let content = transaction.state.sliceDoc(node.from, node.to);

  const varMatch = PATTERNS.VARIABLE_DECLARATION.exec(content);
  const solveMatch = PATTERNS.SOLVE_STRING.exec(content);
  const evalMatch = PATTERNS.EVALUATE_STRING.exec(content);
  const funcMatch = PATTERNS.FUNCTION_STRING.exec(content);

  if (varMatch) {
    content = setNerdamerVariable(varMatch[1], varMatch[2]);
  } else if (solveMatch) {
    content = solveExpression(solveMatch[1], solveMatch[2]);
  } else if (evalMatch) {
    content = evaluateExpression(evalMatch[1]);
  } else if (funcMatch) {
    content = createFunction(funcMatch[1], funcMatch[2], funcMatch[3]);
  } else {
    return; // was a normal inline code block
  }

  if (isCursorInsideNode(cursorPos, node)) return;
  builder.add(
    node.from,
    node.to,
    Decoration.replace({
      widget: new LatexWidget(content),
    })
  );
}
