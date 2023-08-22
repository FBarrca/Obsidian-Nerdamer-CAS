import { RangeSetBuilder } from "@codemirror/state";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";
import { finishRenderMath, renderMath } from "obsidian";

export class LatexWidget extends WidgetType {
  private text: string;

  constructor(text: string) {
    super();
    this.text = text;
  }

  toDOM(_view: EditorView): HTMLElement {
    // create a span element to hold the math
    const span = document.createElement("span");
    span.classList.add("math");
    // contentEditable is set to false to prevent the cursor from moving inside the math
    span.contentEditable = "false";

    const mathContainer = renderMath(this.getFormula(this.text), false);
    // append the rendered math to the span
    span.appendChild(mathContainer);

    // add class nerdamer-container to the div
    mathContainer.classList.add("nerdamer-container");
    // const mathRendered = mathContainer.firstChild as HTMLElement;
    // mathRendered.classList.add("nerdamer-render");
    finishRenderMath();
    return span;
  }

  private getFormula(formula: string): string {
    console.log("Formula:", formula);
    return formula.toString();
  }
}

export function renderNerdamerBlock(node: SyntaxNodeRef, content: string, builder: RangeSetBuilder<Decoration>): void {
  builder.add(
    node.from,
    node.to,
    Decoration.replace({
      widget: new LatexWidget(content),
    })
  );
}
