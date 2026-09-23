import { Notice, Plugin, TFile, TFolder, moment, normalizePath } from "obsidian";
import {
	appHasDailyNotesPluginLoaded,
	getAllDailyNotes,
	getDailyNote,
	getDailyNoteSettings,
	getTemplateInfo,
} from "obsidian-daily-notes-interface";
import {
	DEFAULT_SETTINGS,
	NextDayPlannerSettingTab,
	NextDayPlannerSettings,
} from "./settings";
import { extractUncheckedTasks, findSection, insertTasks } from "./rollover";
import { applyTemplate } from "./template";

type Moment = ReturnType<typeof moment>;

/** The parts of the app Obsidian does not declare publicly. */
interface InternalApp {
	internalPlugins?: {
		getPluginById(id: string): { instance?: { options?: unknown } } | null;
	};
	foldManager?: { save(file: TFile, folds: unknown): void };
}

const DEFAULT_NOTE_FORMAT = "YYYY-MM-DD";
const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";
const DEFAULT_TIME_FORMAT = "HH:mm";

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
			return await this.createDailyNote(date);
		} catch (error) {
			console.error("Next Day Planner: failed to create note", error);
			new Notice("Next Day Planner: could not create tomorrow's note.");
			return null;
		}
	}

	/**
	 * Creates the daily note for `date` from the core Daily notes template.
	 *
	 * This is deliberately not `createDailyNote()` from the daily notes
	 * interface: that helper expands a bare `{{date}}` and `{{title}}` using
	 * the daily note *filename* format, so a format carrying folders such as
	 * `YYYY/MM-MMMM/YYYY-MM-DD-dddd` lands a path in the note. The core plugin
	 * uses the Templates plugin's date format instead, and so do we.
	 */
	private async createDailyNote(date: Moment): Promise<TFile | null> {
		const { format, folder, template } = getDailyNoteSettings() ?? {};
		const noteFormat = format || DEFAULT_NOTE_FORMAT;
		const filename = date.format(noteFormat);
		const path = normalizePath(`${folder ?? ""}/${filename}.md`);

		await this.ensureParentFolder(path);

		const [contents, folds] = await getTemplateInfo(template ?? "");
		const { dateFormat, timeFormat } = this.templateFormats();
		const file = await this.app.vault.create(
			path,
			applyTemplate(contents, {
				title: filename.slice(filename.lastIndexOf("/") + 1),
				date,
				now: moment(),
				dateFormat,
				timeFormat,
				noteFormat,
			})
		);

		// Carry the template's folded sections across, as the core plugin does.
		(this.app as unknown as InternalApp).foldManager?.save(file, folds);
		return file;
	}

	/** Date and time formats configured in the core Templates plugin. */
	private templateFormats(): { dateFormat: string; timeFormat: string } {
		const options = (this.app as unknown as InternalApp).internalPlugins
			?.getPluginById("templates")
			?.instance?.options as
			| { dateFormat?: string; timeFormat?: string }
			| undefined;

		return {
			dateFormat: options?.dateFormat || DEFAULT_DATE_FORMAT,
			timeFormat: options?.timeFormat || DEFAULT_TIME_FORMAT,
		};
	}

	/**
	 * Creates the folders `path` lives in, if they are not there yet. Every
	 * ancestor is created in turn, because a filename format such as
	 * `YYYY/MM-MMMM/YYYY-MM-DD` nests the note several folders deep.
	 */
	private async ensureParentFolder(path: string): Promise<void> {
		const segments = path.split("/").slice(0, -1);

		for (let i = 0; i < segments.length; i++) {
			const folder = segments.slice(0, i + 1).join("/");
			if (this.app.vault.getAbstractFileByPath(folder) instanceof TFolder) {
				continue;
			}
			await this.app.vault.createFolder(folder);
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
