import { EditorView, WidgetType } from "@codemirror/view";
import nerdamer from "nerdamer";
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


    const mathContainer = renderMath(this.getFormula(this.text),false);
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
    const latex = nerdamer.convertToLaTeX(formula)
    // console.log("Latex:", latex);
    return latex.toString();
  }
}

