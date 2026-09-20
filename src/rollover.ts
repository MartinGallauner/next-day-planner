/**
 * Markdown parsing helpers for rolling unfinished tasks into the next day's
 * note. Kept free of Obsidian APIs so the logic is testable in isolation.
 */

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const TASK_RE = /^(\s*)([-*+])\s+\[(.)\]\s*(.*)$/;
const COUNTER_RE = /\s*\(↻(\d+)\)\s*$/;

export interface Section {
	/** Index of the heading line itself, -1 when the section is the whole note. */
	heading: number;
	/** First line of the section body. */
	start: number;
	/** Exclusive end of the section body. */
	end: number;
}

export interface Task {
	/** Task text with any rollover counter stripped. */
	text: string;
	/** Rollover counter already carried by the task, 0 when it has none. */
	count: number;
	/** Indented child lines belonging to the task, verbatim. */
	children: string[];
}

function normalizeHeading(text: string): string {
	return text.replace(/^#+\s*/, "").trim();
}

/** The note body below any frontmatter. */
function wholeNote(lines: string[]): Section {
	let start = 0;
	if (lines[0]?.trim() === "---") {
		const close = lines.findIndex((line, i) => i > 0 && line.trim() === "---");
		if (close !== -1) {
			start = close + 1;
		}
	}
	return { heading: -1, start, end: lines.length };
}

/**
 * Locates a section by heading text. Matching ignores leading `#` and case.
 * An empty heading selects the whole note.
 */
export function findSection(lines: string[], heading: string): Section | null {
	const wanted = normalizeHeading(heading).toLowerCase();
	if (wanted === "") {
		return wholeNote(lines);
	}

	for (let i = 0; i < lines.length; i++) {
		const match = HEADING_RE.exec(lines[i]);
		if (!match || match[2].trim().toLowerCase() !== wanted) {
			continue;
		}

		const level = match[1].length;
		let end = lines.length;
		for (let j = i + 1; j < lines.length; j++) {
			const next = HEADING_RE.exec(lines[j]);
			if (next && next[1].length <= level) {
				end = j;
				break;
			}
		}

		return { heading: i, start: i + 1, end };
	}

	return null;
}

function splitCounter(text: string): { text: string; count: number } {
	const match = COUNTER_RE.exec(text);
	if (!match) {
		return { text: text.trim(), count: 0 };
	}
	return {
		text: text.slice(0, match.index).trim(),
		count: Number.parseInt(match[1], 10),
	};
}

/** Collects the indented lines that belong to the task starting at `index`. */
function collectChildren(
	lines: string[],
	index: number,
	indent: string
): string[] {
	const children: string[] = [];

	for (let i = index + 1; i < lines.length; i++) {
		const line = lines[i];
		if (line.trim() === "") {
			break;
		}
		const childIndent = /^\s*/.exec(line)?.[0] ?? "";
		if (childIndent.length <= indent.length) {
			break;
		}
		children.push(line);
	}

	return children;
}

/**
 * Returns every unchecked task in `heading`. Empty placeholder checkboxes are
 * skipped, and nested lines are carried along with their parent task.
 */
export function extractUncheckedTasks(
	lines: string[],
	heading: string
): Task[] {
	const section = findSection(lines, heading);
	if (!section) {
		return [];
	}

	const tasks: Task[] = [];

	for (let i = section.start; i < section.end; i++) {
		const match = TASK_RE.exec(lines[i]);
		if (!match || match[3] !== " ") {
			continue;
		}

		const indent = match[1];
		const { text, count } = splitCounter(match[4]);
		if (text === "") {
			continue;
		}

		const children = collectChildren(lines, i, indent);
		tasks.push({ text, count, children });
		// Children travel with their parent; don't visit them as tasks again.
		i += children.length;
	}

	return tasks;
}

/** Comparison key used to avoid rolling the same task over twice. */
export function taskKey(text: string): string {
	return splitCounter(text).text.replace(/\s+/g, " ").trim();
}

/** Keys of every task already present in `heading`, checked or not. */
export function existingTaskKeys(
	lines: string[],
	heading: string
): Set<string> {
	const section = findSection(lines, heading);
	const keys = new Set<string>();
	if (!section) {
		return keys;
	}

	for (let i = section.start; i < section.end; i++) {
		const match = TASK_RE.exec(lines[i]);
		if (match && match[4].trim() !== "") {
			keys.add(taskKey(match[4]));
		}
	}

	return keys;
}

export function renderTask(task: Task, showCounter: boolean): string[] {
	const suffix = showCounter ? ` (↻${task.count + 1})` : "";
	return [`- [ ] ${task.text}${suffix}`, ...task.children];
}

export interface InsertResult {
	lines: string[];
	/** Number of tasks actually inserted, ignoring their child lines. */
	added: number;
}

/**
 * Inserts tasks at the top of `heading` (or of the note body when `heading` is
 * empty), leaving any template placeholder in place below them. Tasks already present are skipped, so repeated runs are
 * idempotent.
 */
export function insertTasks(
	lines: string[],
	heading: string,
	tasks: Task[],
	showCounter: boolean
): InsertResult {
	const section = findSection(lines, heading);
	if (!section) {
		return { lines, added: 0 };
	}

	const existing = existingTaskKeys(lines, heading);
	const fresh = tasks.filter((task) => !existing.has(taskKey(task.text)));
	if (fresh.length === 0) {
		return { lines, added: 0 };
	}

	let at = section.start;
	while (at < section.end && lines[at].trim() === "") {
		at++;
	}

	const rendered = fresh.flatMap((task) => renderTask(task, showCounter));
	return {
		lines: [...lines.slice(0, at), ...rendered, ...lines.slice(at)],
		added: fresh.length,
	};
}
