import { App, PluginSettingTab, Setting } from "obsidian";
import { appHasDailyNotesPluginLoaded } from "obsidian-daily-notes-interface";
import type NextDayPlannerPlugin from "./main";

export interface NextDayPlannerSettings {
	/**
	 * Heading whose unchecked tasks are rolled over, in both notes. Empty rolls
	 * over every unchecked task in the note.
	 */
	taskHeading: string;
	/** Roll tasks over automatically when opening tomorrow's note. */
	rollOverOnOpen: boolean;
	/** Append a (↻n) marker counting how often a task has been deferred. */
	showRolloverCounter: boolean;
}

export const DEFAULT_SETTINGS: NextDayPlannerSettings = {
	taskHeading: "",
	rollOverOnOpen: true,
	showRolloverCounter: true,
};

export class NextDayPlannerSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: NextDayPlannerPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		if (!appHasDailyNotesPluginLoaded()) {
			containerEl.createEl("p", {
				cls: "mod-warning",
				text: "The core Daily notes plugin is turned off, so this plugin does nothing until you enable it in Settings → Core plugins. Its folder, date format and template are used for tomorrow's note.",
			});
		}

		new Setting(containerEl)
			.setName("Roll over tasks under heading")
			.setDesc(
				"Only unchecked tasks below this heading are carried over, and they land below the same heading in tomorrow's note. Enter the heading text without the #, e.g. ✅ Do. Leave empty to carry over every unchecked task in the note."
			)
			.addText((text) =>
				text
					.setPlaceholder("Whole note")
					.setValue(this.plugin.settings.taskHeading)
					.onChange(async (value) => {
						this.plugin.settings.taskHeading = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Roll over when opening tomorrow")
			.setDesc(
				"Carry unfinished tasks across as part of opening tomorrow's note. Tasks already there are never duplicated."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.rollOverOnOpen)
					.onChange(async (value) => {
						this.plugin.settings.rollOverOnOpen = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Show rollover counter")
			.setDesc(
				"Mark carried tasks with (↻n) so a task you keep deferring becomes visible."
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showRolloverCounter)
					.onChange(async (value) => {
						this.plugin.settings.showRolloverCounter = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
