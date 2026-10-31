import { PluginSettingTab, SettingDefinitionItem } from "obsidian";
import { appHasDailyNotesPluginLoaded } from "obsidian-daily-notes-interface";

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
	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: "Core Daily notes plugin is turned off",
				desc: "This plugin does nothing until you enable it in Settings → Core plugins. Its folder, date format and template are used for tomorrow's note.",
				visible: () => !appHasDailyNotesPluginLoaded(),
			},
			{
				name: "Roll over when opening tomorrow",
				desc: "Carry unfinished tasks across as part of opening tomorrow's note. Tasks already there are never duplicated.",
				control: { type: "toggle", key: "rollOverOnOpen" },
			},
			{
				name: "Show rollover counter",
				desc: "Mark carried tasks with (↻n) so a task you keep deferring becomes visible.",
				control: { type: "toggle", key: "showRolloverCounter" },
			},
			{
				name: "Task heading",
				desc: "Only roll over unchecked tasks under this heading, and put them under the same heading in tomorrow's note. Type the heading without the #, for example Tasks. Leave empty to use the whole note.",
				control: {
					type: "text",
					key: "taskHeading",
					placeholder: "Whole note",
				},
			},
		];
	}
}
