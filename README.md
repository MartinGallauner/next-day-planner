# Next Day Planner

An Obsidian plugin for planning tomorrow, today.

The core **Daily notes** plugin can open *today's* note and apply a template to it.
It can't create *tomorrow's*. ("Open next daily note" only navigates to an existing
later note.) This plugin fills that gap: one command creates or opens the next day's
note using the exact same folder, filename format and template you already configured
in Daily notes.

## Commands

- **Open tomorrow's daily note** — creates it if needed, rolls today's
  unfinished tasks in, opens it. Also on the ribbon (calendar icon).
- **Roll over unfinished tasks into tomorrow's note** — the rollover on its
  own, without opening anything.

## Rollover

Unchecked tasks from today's note are **copied** into tomorrow's note. By
default every unchecked task is carried over and inserted at the top of
tomorrow's note, right below its frontmatter.

Set a heading (e.g. `✅ Do`) to narrow that down: only unchecked tasks under
that heading are copied, into the same heading in tomorrow's note, above
whatever the template put there.

- Today's note is never modified. An unchecked box stays unchecked where it is,
  so the day remains an honest record of what you didn't do.
- With a heading set, only that heading is read. Your Highlight stays a
  single Highlight.
- The source is strictly the day before. Skip a day and nothing rolls over —
  no digging through history.
- Each carried task gets a `(↻n)` counter. `(↻4)` means you have moved that
  task four times, which is information about a decision you are avoiding, not
  about your workload.
- Tasks already present in tomorrow's note are never duplicated, so running the
  command repeatedly is safe.

Configurable in Settings → Next Day Planner: the heading (empty for the whole
note), whether rollover happens on open, and whether the counter is shown.

Requires the core **Daily notes** plugin (or Periodic Notes with daily notes
enabled). While it is off, the commands only show a notice and the settings
tab shows a warning.

## Installation

Not yet in the community plugin directory. Until then:

**With BRAT (recommended)** — install the
[BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin, run its
*Add a beta plugin* command, and paste `MartinGallauner/next-day-planner`.
BRAT installs the latest release and keeps it updated.

**Manually** — download `main.js` and `manifest.json` from the
[latest release](https://github.com/MartinGallauner/next-day-planner/releases),
put them in `<your-vault>/.obsidian/plugins/next-day-planner/`, then enable
*Next Day Planner* in Settings → Community plugins.

## How it works

Settings are read from the core Daily notes plugin via
[`obsidian-daily-notes-interface`](https://github.com/liamcain/obsidian-daily-notes-interface),
the same library the Calendar and Periodic Notes plugins use. Nothing is configured
twice — change your Daily notes settings and this plugin follows.

Template placeholders are expanded the way the core plugin expands them:
`{{title}}` is the note's filename, `{{date}}` and `{{time}}` use the formats
from the core **Templates** plugin, and `{{date:FORMAT}}` takes any moment
format. That matters if your filename format carries folders, e.g.
`YYYY/MM-MMMM/YYYY-MM-DD-dddd` — a bare `{{date}}` still gives you `2026-09-24`,
not the whole path. `{{yesterday}}` and `{{tomorrow}}` use the filename format,
so they link to the neighbouring notes.

## Development

Node is pinned via [mise](https://mise.jdx.dev/) (`mise.toml`) — `mise install`
once, then either the npm scripts or the equivalent mise tasks:

```bash
npm install
npm run dev     # or: mise run dev    — esbuild watch -> main.js
npm run build   # or: mise run build  — typecheck + minified build
npm test        # or: mise run test   — vitest, covers the markdown parsing
```

To test in a real vault, symlink the repo into its plugin folder:

```bash
ln -s "$PWD" <your-vault>/.obsidian/plugins/next-day-planner
```

Then enable *Next Day Planner* in Settings → Community plugins. Install the
[Hot Reload](https://github.com/pjeby/hot-reload) plugin to avoid restarting
Obsidian on every rebuild.

To release: bump `version` in `manifest.json` (and `versions.json`), commit,
then tag that version and push the tag. CI builds the plugin, runs the tests,
and attaches `main.js` + `manifest.json` to a draft GitHub release — review
and publish it.

```bash
git tag 0.1.0 && git push origin 0.1.0
```

## License

MIT
