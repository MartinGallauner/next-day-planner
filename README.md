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

Unchecked tasks under the configured heading (default `✅ Do`) are **copied**
into the same heading in tomorrow's note, above whatever the template put
there.

- Today's note is never modified. An unchecked box stays unchecked where it is,
  so the day remains an honest record of what you didn't do.
- Only that one heading is read. Your Highlight stays a single Highlight.
- The source is strictly the day before. Skip a day and nothing rolls over —
  no digging through history.
- Each carried task gets a `(↻n)` counter. `(↻4)` means you have moved that
  task four times, which is information about a decision you are avoiding, not
  about your workload.
- Tasks already present in tomorrow's note are never duplicated, so running the
  command repeatedly is safe.

Configurable in Settings → Next Day Planner: the heading, whether rollover
happens on open, and whether the counter is shown.

## How it works

Settings are read from the core Daily notes plugin via
[`obsidian-daily-notes-interface`](https://github.com/liamcain/obsidian-daily-notes-interface),
the same library the Calendar and Periodic Notes plugins use. Nothing is configured
twice — change your Daily notes settings and this plugin follows.

## Development

```bash
npm install
npm run dev     # esbuild watch -> main.js
npm run build   # typecheck + minified build
npm test        # vitest, covers the markdown parsing
```

To test in a real vault, symlink the repo into its plugin folder:

```bash
ln -s "$PWD" ~/Documents/MG-2nd-brain-remote/.obsidian/plugins/next-day-planner
```

Then enable *Next Day Planner* in Settings → Community plugins. Install the
[Hot Reload](https://github.com/pjeby/hot-reload) plugin to avoid restarting
Obsidian on every rebuild.

## License

MIT
