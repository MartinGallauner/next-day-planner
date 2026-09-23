import { describe, expect, it } from "vitest";
import moment from "moment";
import { applyTemplate, TemplateContext } from "../src/template";

/** The vault format that started all this: a filename carrying folders. */
const NOTE_FORMAT = "YYYY/MM-MMMM/YYYY-MM-DD-dddd";

function context(overrides: Partial<TemplateContext> = {}): TemplateContext {
	return {
		title: "2026-09-24-Thursday",
		date: moment("2026-09-24T00:00:00"),
		now: moment("2026-09-23T21:07:30"),
		dateFormat: "YYYY-MM-DD",
		timeFormat: "HH:mm",
		noteFormat: NOTE_FORMAT,
		...overrides,
	};
}

describe("applyTemplate", () => {
	it("expands a bare date with the Templates format, not the filename format", () => {
		expect(applyTemplate('Date: "{{date}}"', context())).toBe(
			'Date: "2026-09-24"'
		);
	});

	it("honours a custom Templates date format", () => {
		expect(
			applyTemplate("{{date}}", context({ dateFormat: "DD.MM.YYYY" }))
		).toBe("24.09.2026");
	});

	it("expands a bare time with the current clock", () => {
		expect(applyTemplate("{{time}}", context())).toBe("21:07");
	});

	it("expands the title without the folders of the filename format", () => {
		expect(applyTemplate("# {{title}}", context())).toBe(
			"# 2026-09-24-Thursday"
		);
	});

	it("honours an explicit format suffix", () => {
		expect(applyTemplate("{{date:dddd}} {{time:HH.mm.ss}}", context())).toBe(
			"Thursday 21.07.30"
		);
	});

	it("applies date offsets", () => {
		expect(applyTemplate("{{date+2d:YYYY-MM-DD}}", context())).toBe(
			"2026-09-26"
		);
		expect(applyTemplate("{{date-1M:YYYY-MM}}", context())).toBe("2026-08");
	});

	it("links neighbouring days with the filename format", () => {
		expect(applyTemplate("[[{{yesterday}}]] [[{{tomorrow}}]]", context())).toBe(
			"[[2026/09-September/2026-09-23-Wednesday]] " +
				"[[2026/09-September/2026-09-25-Friday]]"
		);
	});

	it("tolerates whitespace and casing", () => {
		expect(applyTemplate("{{ DATE }}", context())).toBe("2026-09-24");
	});

	it("leaves unknown placeholders alone", () => {
		expect(applyTemplate("{{weekday}}", context())).toBe("{{weekday}}");
	});

	it("does not re-expand text produced by an expansion", () => {
		expect(
			applyTemplate("{{date}}", context({ dateFormat: "[{{time}}]" }))
		).toBe("{{time}}");
	});

	it("leaves the date it is given untouched", () => {
		const date = moment("2026-09-24T00:00:00");
		applyTemplate("{{date}} {{tomorrow}} {{date+3d}}", context({ date }));
		expect(date.format("YYYY-MM-DD HH:mm")).toBe("2026-09-24 00:00");
	});
});
