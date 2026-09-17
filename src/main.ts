import { Notice, Plugin, TFile, moment } from "obsidian";
import {
	appHasDailyNotesPluginLoaded,
	createDailyNote,
	getAllDailyNotes,
	getDailyNote,
} from "obsidian-daily-notes-interface";
import {
	DEFAULT_SETTINGS,
	NextDayPlannerSettingTab,
	NextDayPlannerSettings,
} from "./settings";
import { extractUncheckedTasks, findSection, insertTasks } from "./rollover";

type Moment = ReturnType<typeof moment>;

export default class NextDayPlannerPlugin extends Plugin {
	settings: NextDayPlannerSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addCommand({
			id: "open-next-day-note",
			name: "Open tomorrow's daily note",
			callback: () => void this.planNextDay({ open: true }),
		});

		this.addCommand({
			id: "roll-over-tasks",
			name: "Roll over unfinished tasks into tomorrow's note",
			callback: () => void this.planNextDay({ open: false, force: true }),
		});

		this.addRibbonIcon("calendar-plus", "Plan tomorrow", () => {
			void this.planNextDay({ open: true });
		});

		this.addSettingTab(new NextDayPlannerSettingTab(this.app, this));
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	/**
	 * Ensures tomorrow's daily note exists, optionally rolling today's
	 * unfinished tasks into it and opening it.
	 */
	private async planNextDay(options: {
		open: boolean;
		force?: boolean;
	}): Promise<void> {
		if (!appHasDailyNotesPluginLoaded()) {
			new Notice(
				"Next Day Planner: enable the core Daily notes plugin first."
			);
			return;
		}

		const date = moment().add(1, "day").startOf("day");

		const note = await this.ensureDailyNote(date);
		if (!note) {
			return;
		}

		if (options.force || this.settings.rollOverOnOpen) {
			await this.rollOverInto(note, date);
		}

		if (options.open) {
			await this.app.workspace
				.getLeaf(false)
				.openFile(note, { active: true });
		}
	}

	/** Returns the daily note for `date`, creating it from the template. */
	private async ensureDailyNote(date: Moment): Promise<TFile | null> {
		const existing = this.findDailyNote(date);
		if (existing) {
			return existing;
		}

		try {
			return (await createDailyNote(date)) ?? null;
		} catch (error) {
			console.error("Next Day Planner: failed to create note", error);
			new Notice("Next Day Planner: could not create tomorrow's note.");
			return null;
		}
	}

	private findDailyNote(date: Moment): TFile | null {
		try {
			return getDailyNote(date, getAllDailyNotes()) ?? null;
		} catch (error) {
			// getAllDailyNotes() throws while the daily note folder is still
			// missing, which simply means nothing has been created there yet.
			console.debug("Next Day Planner: no daily notes found", error);
			return null;
		}
	}

	/**
	 * Copies unchecked tasks from the note of the day before `date` into
	 * `target`. The source note is never modified, and a missing source note
	 * means nothing is rolled over.
	 */
	private async rollOverInto(target: TFile, date: Moment): Promise<void> {
		const source = this.findDailyNote(date.clone().subtract(1, "day"));
		if (!source || source.path === target.path) {
			return;
		}

		const heading = this.settings.taskHeading;
		const sourceLines = (await this.app.vault.cachedRead(source)).split("\n");
		const tasks = extractUncheckedTasks(sourceLines, heading);
		if (tasks.length === 0) {
			return;
		}

		let added = 0;
		let headingMissing = false;

		await this.app.vault.process(target, (content) => {
			const lines = content.split("\n");
			if (!findSection(lines, heading)) {
				headingMissing = true;
				return content;
			}

			const result = insertTasks(
				lines,
				heading,
				tasks,
				this.settings.showRolloverCounter
			);
			added = result.added;
			return added > 0 ? result.lines.join("\n") : content;
		});

		if (headingMissing) {
			new Notice(
				`Next Day Planner: no "${heading}" heading in tomorrow's note.`
			);
			return;
		}

		if (added > 0) {
			new Notice(
				`Next Day Planner: rolled over ${added} task${added === 1 ? "" : "s"}.`
			);
		}
	}
}
