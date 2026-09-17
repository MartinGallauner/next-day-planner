# Next Day Planner

An Obsidian plugin for planning tomorrow, today.

The core **Daily notes** plugin can open *today's* note and apply a template to it.
It can't create *tomorrow's*. ("Open next daily note" only navigates to an existing
later note.) This plugin fills that gap: one command creates or opens the next day's
note using the exact same folder, filename format and template you already configured
in Daily notes.

## Status

**v0.1.0 — phase 1 only.**

- [x] Command: *Open tomorrow's daily note* (also in the ribbon, calendar icon)
- [ ] Phase 2: roll over today's unchecked action items into tomorrow's note

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
