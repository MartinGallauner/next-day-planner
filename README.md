# Next Day Planner

Plan tomorrow, today. One command creates tomorrow's daily note from your
existing Daily notes setup, carries today's unfinished tasks into it, and opens
it.

Obsidian's core **Daily notes** plugin can open *today's* note. It can't create
*tomorrow's* — its "Open next daily note" command only navigates to a note that
already exists. This plugin fills that gap, using the exact same folder,
filename format and template you already configured. Nothing is configured
twice.

## Requirements

- Obsidian 1.5.0 or newer (desktop and mobile).
- The core **Daily notes** plugin turned on, in Settings → Core plugins.
  Periodic Notes with daily notes enabled works as well.

## Install

The plugin is not in the community directory yet, so it is installed through
[BRAT](https://github.com/TfTHacker/obsidian42-brat), which fetches it from
GitHub and keeps it updated.

1. In Settings → Community plugins, install and enable **BRAT**.
2. Open the command palette (`Ctrl/Cmd+P`) and run
   **BRAT: Add a beta plugin for testing**.
3. Paste `MartinGallauner/next-day-planner` and confirm.
4. Go to Settings → Community plugins and turn on **Next Day Planner**. BRAT
   installs the plugin but does not enable it.

To update later, run **BRAT: Check for updates to all beta plugins and UPDATE**,
or turn on automatic updates in BRAT's settings.

Without BRAT: download `main.js` and `manifest.json` from the
[latest release](https://github.com/MartinGallauner/next-day-planner/releases/latest),
put them in `<your vault>/.obsidian/plugins/next-day-planner/`, restart
Obsidian and enable the plugin.

## Using it

Run **Open tomorrow's daily note** from the command palette, or click the
calendar icon in the left ribbon. That is the whole workflow:

1. If tomorrow's note does not exist, it is created from your Daily notes
   template, in your Daily notes folder, with your filename format.
2. Every unchecked task in today's note is copied to the top of tomorrow's
   note.
3. Tomorrow's note opens.

There is a second command, **Roll over unfinished tasks into tomorrow's note**,
that does steps 1 and 2 without opening anything.

### What rollover does, precisely

- Tasks are **copied, never moved**. Today's note is not touched. An unchecked
  box stays unchecked where it is, so each day remains an honest record.
- Only the note of the day before is read. Skip a day and nothing rolls over.
- Each carried task gets a `(↻n)` counter. `(↻4)` means you have deferred that
  task four times — that is information about a decision, not a workload.
- Indented lines under a task travel with it.
- A task already present in tomorrow's note, checked or not, is not added
  again. Running the command twice is safe.
- Empty checkboxes (`- [ ]` with no text, typically from a template) are
  ignored.

### Settings

Settings → Next Day Planner:

- **Roll over tasks under heading** — empty by default, which means the whole
  note. Enter a heading such as `✅ Do` (without the `#`) and only unchecked
  tasks under that heading are carried over, into the same heading in
  tomorrow's note, above whatever your template put there. If tomorrow's note
  has no such heading, nothing is inserted and a notice tells you so.
- **Roll over when opening tomorrow** — on by default. Turn it off and the
  open command only creates and opens; use the roll-over command when you
  want the tasks.
- **Show rollover counter** — on by default.

### Template placeholders

Placeholders are expanded the way the core Daily notes plugin expands them:
`{{title}}` is the note's filename, `{{date}}` and `{{time}}` use the formats
from the core **Templates** plugin, `{{date:FORMAT}}` takes any moment format,
`{{date+1d}}` style offsets work. `{{yesterday}}` and `{{tomorrow}}` use the
daily note filename format so they link to the neighbouring notes.

## Known limitations

- "Tomorrow" is the calendar day after now. Plan at 00:30 and you get the day
  after next, not the day you are about to sleep through. If that bites you,
  say so — a configurable day boundary is on the table.
- With no heading set, rolled tasks land directly below the frontmatter, above
  the first heading of your template.
- Only Markdown checkboxes (`- [ ]`, `* [ ]`, `+ [ ]`) are recognised as
  tasks.

## Testing and feedback

If you are trying this out as a tester: use it for a few real days rather than
poking at it once. The interesting bugs live in the details of *your* daily
note setup — nested folders in the filename format, unusual templates, tasks
with sub-bullets.

Report anything odd, including "this behaved correctly but not how I expected",
at <https://github.com/MartinGallauner/next-day-planner/issues>. Include:

- your Daily notes settings (folder, date format, template path),
- the plugin's own settings,
- what you ran and what happened, ideally with the relevant lines from both
  notes.

## How it works

Settings are read from the core Daily notes plugin through
[`obsidian-daily-notes-interface`](https://github.com/liamcain/obsidian-daily-notes-interface),
the same library the Calendar and Periodic Notes plugins use. Change your Daily
notes settings and this plugin follows.

## Development

Node is pinned via [mise](https://mise.jdx.dev/) (`mise.toml`) — `mise install`
once, then either the npm scripts or the equivalent mise tasks:

```bash
npm install
npm run dev     # or: mise run dev    — esbuild watch -> main.js
npm run build   # or: mise run build  — typecheck + minified build
npm test        # or: mise run test   — vitest, covers the markdown parsing
```

To test in a real vault, symlink the repo into its plugin folder and enable the
plugin in Settings → Community plugins:

```bash
ln -s "$PWD" <your-vault>/.obsidian/plugins/next-day-planner
```

The [Hot Reload](https://github.com/pjeby/hot-reload) plugin saves you a
restart on every rebuild.

To release: bump `version` in `manifest.json`, `package.json` and add the entry
to `versions.json`, add a `CHANGELOG.md` section, commit, then tag that exact
version (no `v` prefix) and push the tag. CI runs the tests, builds, and
attaches `main.js` + `manifest.json` to a draft GitHub release — review and
publish it.

```bash
git tag 0.2.0 && git push origin 0.2.0
```

## License

MIT
