/**
 * Template placeholder expansion, matching what the core Daily notes plugin
 * does when it applies a template. Kept free of Obsidian APIs so the logic is
 * testable in isolation.
 */

import type { Moment, unitOfTime } from "moment";

/**
 * A placeholder, with an optional `+1d` style offset and an optional
 * `:format` suffix, e.g. `{{date}}`, `{{time:HH}}` or `{{date+1d:YYYY}}`.
 */
const PLACEHOLDER_RE =
	/{{\s*(date|time|title|yesterday|tomorrow)\s*(?:([+-]\d+)([yqmwdhs]))?\s*(?::([^}]*?))?\s*}}/gi;

export interface TemplateContext {
	/** Basename of the note being created, without folder or extension. */
	title: string;
	/** Day the note is for. */
	date: Moment;
	/** Wall clock time to stamp into `{{time}}`. */
	now: Moment;
	/** Core Templates plugin date format, used by a bare `{{date}}`. */
	dateFormat: string;
	/** Core Templates plugin time format, used by a bare `{{time}}`. */
	timeFormat: string;
	/** Daily note filename format, used by `{{yesterday}}` and `{{tomorrow}}`. */
	noteFormat: string;
}

/**
 * Expands the placeholders in `template`.
 *
 * A bare `{{date}}` uses the Templates plugin's date format rather than the
 * daily note filename format: filename formats often carry folders, and
 * `2026/09-September/2026-09-24-Thursday` is not what anyone means by a date.
 */
export function applyTemplate(
	template: string,
	context: TemplateContext
): string {
	// The date of the note, at the current time of day.
	const stamp = context.date.clone().set({
		hour: context.now.get("hour"),
		minute: context.now.get("minute"),
		second: context.now.get("second"),
	});

	return template.replace(
		PLACEHOLDER_RE,
		(_match, name: string, delta: string, unit: string, format: string) => {
			switch (name.toLowerCase()) {
				case "title":
					return context.title;
				case "yesterday":
					return context.date
						.clone()
						.subtract(1, "day")
						.format(context.noteFormat);
				case "tomorrow":
					return context.date
						.clone()
						.add(1, "day")
						.format(context.noteFormat);
			}

			const when = stamp.clone();
			if (delta) {
				when.add(
					Number.parseInt(delta, 10),
					unit as unitOfTime.DurationConstructor
				);
			}

			const fallback =
				name.toLowerCase() === "date"
					? context.dateFormat
					: context.timeFormat;
			return when.format(format?.trim() || fallback);
		}
	);
}
