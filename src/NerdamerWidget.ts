// External Libraries
import { syntaxTree } from "@codemirror/language";
import { Extension, RangeSetBuilder, StateField, Transaction } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";
import nerdamer from "nerdamer/all.min";

// Internal Modules
import { LatexWidget } from "./NerdamerDOM";

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

// Helper function to check if cursor is inside a node
function isCursorInsideNode(cursorPos: number, node: any): boolean {
  return cursorPos >= node.from - 1 && cursorPos <= node.to + 1;
}

// Handles inline code nodes
function handleInlineCodeNode(
  node: any,
  cursorPos: number,
  transaction: Transaction,
  builder: RangeSetBuilder<Decoration>
): void {
  let content = transaction.state.sliceDoc(node.from, node.to);

  const variableDeclaration: string[] | null = /^([a-z_][a-z\d\_]*):=(.+)$/gi.exec(content);
  if (variableDeclaration) {
    content = setNerdamerVariable(variableDeclaration[1], variableDeclaration[2]);
  }
  // Check for solve string
  else {
    const solveString: string[] | null = /^solve\(([^,]+),\s*([^)]+)\)$/gi.exec(content);
    if (solveString) {
      content = solveExpression(solveString[1], solveString[2]);
    }
    // Check for evaluate string
    else {
      const evaluateString: string[] | null = /^([^=]+)=\?$/gi.exec(content);
      if (evaluateString) {
        content = evaluateExpression(evaluateString[1]);
      } else {
        const functionString: string[] | null = /^([a-zA-Z_][a-zA-Z_0-9]*)\s*\(\s*([^)]+)\s*\)\s*:=\s*([^$]+)$/gi.exec(
          content
        );
        if (functionString) {
          createFunction(functionString[1], functionString[2], functionString[3]);
        } else {
          // console.log("No match", content);
          return; // Dont render anything
        }
      }
    }
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

// Set Nerdamer variable and return its string representation
function setNerdamerVariable(variable: string, value: string): string {
  nerdamer.setVar(variable, value);
  return `${variable} := ${value}`;
}

// Solve an expression and return its result
function solveExpression(expression: string, variable: string): string {
  const result = nerdamer.solve(expression, variable);
  // console.log("Expr", expression, "Var", variable, "Res", result.text());
  return `${expression} => ${variable} = ${result}`;
}

// Evaluate an expression and return its result
function evaluateExpression(content: string): string {
  const expression = content.replace("=?", "");
  const result = nerdamer(expression).evaluate();
  return `${expression} => ${result}`;
}

function createFunction(name: string, variable: string, expression: string): string {
  nerdamer.setFunction(name, variable, expression);
  return `${name}(${variable}) = ${expression}`;
}
