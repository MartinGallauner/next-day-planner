import { describe, expect, it } from "vitest";
import {
	extractUncheckedTasks,
	findSection,
	insertTasks,
	renderTask,
} from "../src/rollover";

const HEADING = "✅ Do";

const template = [
	"---",
	'Date: "{{date}}"',
	"category:",
	'  - "[[Daily]]"',
	"---",
	"# ✨Today's Highlight",
	"- [ ] ",
	"",
	"# ✅ Do",
	"- [ ] ",
	"",
	"# 📝 Note",
	"- ",
	"",
].join("\n");

const today = [
	"# ✨Today's Highlight",
	"- [ ] [[RIAG IT Welcome Day]]",
	"",
	"# ✅ Do",
	"- [ ] [[Russisch]] Kurs anmelden",
	"- [ ] Contact [[Vienna Toastmasters Club 551]] (↻3)",
	"- [x] [[Günter Diesenreiter|Günter]] anrufen",
	"- [ ] ",
	"",
	"# 📝 Note",
	"- [ ] not a task heading item",
	"",
].join("\n");

describe("findSection", () => {
	it("ends a section at the next heading of the same level", () => {
		const lines = today.split("\n");
		const section = findSection(lines, HEADING);
		expect(section).not.toBeNull();
		expect(lines.slice(section!.start, section!.end)).toContain(
			"- [x] [[Günter Diesenreiter|Günter]] anrufen"
		);
		expect(lines.slice(section!.start, section!.end)).not.toContain(
			"- [ ] not a task heading item"
		);
	});

	it("tolerates a leading # and different casing", () => {
		expect(findSection(today.split("\n"), "# ✅ do")).not.toBeNull();
	});
});

describe("extractUncheckedTasks", () => {
	const tasks = extractUncheckedTasks(today.split("\n"), HEADING);

	it("takes only unchecked tasks from the configured heading", () => {
		expect(tasks.map((task) => task.text)).toEqual([
			"[[Russisch]] Kurs anmelden",
			"Contact [[Vienna Toastmasters Club 551]]",
		]);
	});

	it("skips the empty template placeholder", () => {
		expect(tasks.some((task) => task.text === "")).toBe(false);
	});

	it("reads an existing rollover counter", () => {
		expect(tasks[0].count).toBe(0);
		expect(tasks[1].count).toBe(3);
	});

	it("returns nothing when the heading is absent", () => {
		expect(extractUncheckedTasks(today.split("\n"), "Nope")).toEqual([]);
	});

	it("carries indented child lines along with their task", () => {
		const lines = ["# ✅ Do", "- [ ] parent", "\t- [ ] child", "- [ ] other"];
		const [parent] = extractUncheckedTasks(lines, HEADING);
		expect(parent.children).toEqual(["\t- [ ] child"]);
	});

	it("does not extract a nested task a second time on its own", () => {
		const lines = [
			"# ✅ Do",
			"- [ ] parent",
			"\t- [ ] child",
			"\t\t- [ ] grandchild",
			"- [ ] other",
		];
		expect(
			extractUncheckedTasks(lines, HEADING).map((task) => task.text)
		).toEqual(["parent", "other"]);
	});
});

describe("renderTask", () => {
	it("increments the counter", () => {
		expect(renderTask({ text: "a", count: 3, children: [] }, true)).toEqual([
			"- [ ] a (↻4)",
		]);
	});

	it("starts an unmarked task at one", () => {
		expect(renderTask({ text: "a", count: 0, children: [] }, true)).toEqual([
			"- [ ] a (↻1)",
		]);
	});

	it("omits the counter when disabled", () => {
		expect(renderTask({ text: "a", count: 3, children: [] }, false)).toEqual([
			"- [ ] a",
		]);
	});
});

describe("insertTasks", () => {
	const tasks = extractUncheckedTasks(today.split("\n"), HEADING);

	it("inserts above the template placeholder", () => {
		const { lines, added } = insertTasks(
			template.split("\n"),
			HEADING,
			tasks,
			true
		);
		expect(added).toBe(2);
		expect(lines.join("\n")).toContain(
			[
				"# ✅ Do",
				"- [ ] [[Russisch]] Kurs anmelden (↻1)",
				"- [ ] Contact [[Vienna Toastmasters Club 551]] (↻4)",
				"- [ ] ",
			].join("\n")
		);
	});

	it("leaves the other sections untouched", () => {
		const { lines } = insertTasks(template.split("\n"), HEADING, tasks, true);
		expect(lines.join("\n")).toContain("# ✨Today's Highlight\n- [ ] \n");
	});

	it("is idempotent", () => {
		const once = insertTasks(template.split("\n"), HEADING, tasks, true);
		const twice = insertTasks(once.lines, HEADING, tasks, true);
		expect(twice.added).toBe(0);
		expect(twice.lines).toEqual(once.lines);
	});

	it("does not re-add a task already completed in the target", () => {
		const target = ["# ✅ Do", "- [x] [[Russisch]] Kurs anmelden (↻1)"];
		const { added, lines } = insertTasks(target, HEADING, tasks, true);
		expect(added).toBe(1);
		expect(lines.join("\n")).not.toContain("- [ ] [[Russisch]]");
	});

	it("rolls a nested task over exactly once", () => {
		const source = ["# ✅ Do", "- [ ] parent", "\t- [ ] child"];
		const nested = extractUncheckedTasks(source, HEADING);
		const { lines, added } = insertTasks(
			template.split("\n"),
			HEADING,
			nested,
			false
		);
		expect(added).toBe(1);
		expect(lines.filter((line) => line.includes("child"))).toEqual([
			"\t- [ ] child",
		]);
	});

	it("reports nothing added when the heading is missing", () => {
		const target = ["# Something else", "- [ ] x"];
		expect(insertTasks(target, HEADING, tasks, true).added).toBe(0);
	});
});
