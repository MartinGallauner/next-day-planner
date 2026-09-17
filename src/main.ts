import { Notice, Plugin, TFile, moment } from "obsidian";
import {
	appHasDailyNotesPluginLoaded,
	createDailyNote,
	getAllDailyNotes,
	getDailyNote,
} from "obsidian-daily-notes-interface";

export default class NextDayPlannerPlugin extends Plugin {
	async onload(): Promise<void> {
		this.addCommand({
			id: "open-next-day-note",
			name: "Open tomorrow's daily note",
			callback: () => void this.openNextDayNote(),
		});

		this.addRibbonIcon("calendar-plus", "Plan tomorrow", () => {
			void this.openNextDayNote();
		});
	}

	/**
	 * Opens tomorrow's daily note, creating it from the core Daily notes
	 * template (and its folder structure) when it does not exist yet.
	 */
	private async openNextDayNote(): Promise<void> {
		if (!appHasDailyNotesPluginLoaded()) {
			new Notice(
				"Next Day Planner: enable the core Daily notes plugin first."
			);
			return;
		}

		const date = moment().add(1, "day").startOf("day");

		let note: TFile | null | undefined = null;
		try {
			note = getDailyNote(date, getAllDailyNotes());
		} catch (error) {
			// getAllDailyNotes() throws when the daily note folder is missing,
			// which just means nothing has been created there yet.
			console.debug("Next Day Planner: no existing daily notes", error);
		}

		if (!note) {
			try {
				note = await createDailyNote(date);
			} catch (error) {
				console.error("Next Day Planner: failed to create note", error);
				new Notice("Next Day Planner: could not create tomorrow's note.");
				return;
			}
		}

		if (!note) {
			new Notice("Next Day Planner: could not open tomorrow's note.");
			return;
		}

		await this.app.workspace.getLeaf(false).openFile(note, { active: true });
	}
}
