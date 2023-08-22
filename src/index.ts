import { Extension } from "@codemirror/state";
import { Plugin, finishRenderMath, loadMathJax } from "obsidian";
import { DEFAULT_SETTINGS, LapelSettings, LapelSettingsTab } from "./settings";
import { NerdamerListField } from "./EditorExtension";

export default class LapelPlugin extends Plugin {
  public settings: LapelSettings;
  private cmExtension: Extension[];

  async onload(): Promise<void> {
    await this.loadSettings();
    await loadMathJax();
    await finishRenderMath();
    // this.cmExtension = headingMarkerPlugin(this.app, this.settings.showBeforeLineNumbers);
    // this.registerEditorExtension([this.cmExtension]);
    this.registerEditorExtension([NerdamerListField]);
    this.registerSettingsTab();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  private registerSettingsTab() {
    this.addSettingTab(new LapelSettingsTab(this.app, this));
  }

  public async updateSettings(tx: (old: LapelSettings) => Partial<LapelSettings>): Promise<void> {
    const changedSettings = tx(this.settings);
    const newSettings = Object.assign({}, this.settings, changedSettings);
    if (this.settings.showBeforeLineNumbers !== changedSettings.showBeforeLineNumbers) {
      // const updatedExt = headingMarkerPlugin(this.app, newSettings.showBeforeLineNumbers);
      // this.cmExtension[0] = updatedExt;
      // this.app.workspace.updateOptions();
    }

    this.settings = newSettings;
    await this.saveData(this.settings);
  }
}
