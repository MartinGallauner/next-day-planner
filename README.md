# Next Day Planner

Plan tomorrow, today.

This plugin is scratching my own itch!
If you're using the daily-note core plugin to write your daily to-do list, it might be a good match for you too.
The idea is that you can rollover all your unchecked todos to tomorrow with the click of a button.
For context: I enjoy planning my next day the night before.

## Requirements

- Obsidian 1.5.0 or newer (desktop and mobile).
- The core **Daily notes** plugin turned on, in Settings → Core plugins.

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
2. Every unchecked task in the most recent earlier daily note is copied to the
   top of tomorrow's note.
3. Tomorrow's note opens.


### What is a rollover?

- Tasks are **copied**. Today's note is not touched. An unchecked
  box stays unchecked where it is, so each day remains an honest record.
- The most recent daily note before tomorrow is read. Skip a day and tasks
  still roll over from the last note you wrote.
- Each carried task gets a `(↻n)` counter. `(↻4)` means you have deferred that
  task four times.
- Indented lines under a task travel with it.
- A task already present in tomorrow's note, checked or not, is not added
  again. Running the command twice is safe.

### Settings

Settings → Next Day Planner:

- **Task heading** — empty by default, which means the whole note. Enter a heading such as `✅ Do` (without the `#`) and only unchecked
  tasks under that heading are carried over, into the same heading in
  tomorrow's note, above whatever your template put there. If tomorrow's note
  has no such heading, nothing is inserted and a notice tells you so.
- **Roll over when opening tomorrow** — on by default. Turn it off and the
  open command only creates and opens; use the roll-over command when you
  want the tasks.
- **Show rollover counter** — on by default.

## Known limitations

- "Tomorrow" is the calendar day after now. Plan at 00:30 and you get the day
  after next.
- With no task heading set, rolled tasks land directly below the frontmatter,
  above the first heading of your template.
- Only Markdown checkboxes (`- [ ]`, `* [ ]`, `+ [ ]`) are recognised as
  tasks.

