import { App, PluginSettingTab, Setting } from "obsidian";
import type NextDayPlannerPlugin from "./main";

export interface NextDayPlannerSettings {
	/** Heading whose unchecked tasks are rolled over, in both notes. */
	taskHeading: string;
	/** Roll tasks over automatically when opening tomorrow's note. */
	rollOverOnOpen: boolean;
	/** Append a (↻n) marker counting how often a task has been deferred. */
	showRolloverCounter: boolean;
}

export const DEFAULT_SETTINGS: NextDayPlannerSettings = {
	taskHeading: "✅ Do",
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

		new Setting(containerEl)
			.setName("Task heading")
			.setDesc(
				"Unchecked tasks under this heading are carried into tomorrow's note, under the same heading. Leave out the leading #."
			)
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.taskHeading)
					.setValue(this.plugin.settings.taskHeading)
					.onChange(async (value) => {
						this.plugin.settings.taskHeading =
							value.trim() || DEFAULT_SETTINGS.taskHeading;
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
