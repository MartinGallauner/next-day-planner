# Changelog

All notable changes to Next Day Planner are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Roll over unfinished tasks into today's note** command, for days you did not
  plan the night before.

### Changed

- The roll-over commands now show a notice when there is nothing new to roll
  over, instead of doing nothing visibly.

## [0.3.0] - 2026-10-25

### Changed

- Rollover now reads the most recent daily note before tomorrow instead of
  strictly the day before, so skipping a day no longer drops your open tasks.
- The heading setting is now called **Task heading** and sits at the bottom of
  the settings tab.

## [0.2.1] - 2026-10-14

### Fixed

- Finished subtasks no longer roll over with their unfinished parent. Only open
  subtasks and plain note lines travel along; anything nested under a checked
  subtask stays behind with it.

## [0.2.0] - 2026-09-24

### Changed

- The rollover heading is now optional, and empty is the new default. Rollover
  reads the whole note body below the frontmatter and inserts carried tasks at
  the top of it. Setting a heading still narrows rollover to that one section.
  Existing installs keep whatever heading they already have — only fresh
  installs get the new default.
- Tomorrow's note is now built by the plugin instead of by
  `obsidian-daily-notes-interface`, so template placeholders expand the way the
  core **Daily notes** plugin expands them: `{{title}}` is the plain filename,
  `{{date}}` and `{{time}}` use the formats from the core **Templates** plugin,
  and `{{date:FORMAT}}` takes any moment format. `{{yesterday}}` and
  `{{tomorrow}}` keep using the filename format.

### Added

- The settings tab warns when the core **Daily notes** plugin is turned off,
  since its folder, date format and template are what this plugin follows.

### Fixed

- A task's indented subtasks were rolled over twice: once as children of their
  parent, then again as top-level tasks. They now travel with their parent only.
- With a daily note format that carries folders, such as
  `YYYY/MM-MMMM/YYYY-MM-DD-dddd`, a bare `{{date}}` expanded to the whole path
  (`2026/09-September/2026-09-23-Wednesday`) instead of a date.

## [0.1.0] - 2026-09-17

Initial release.

### Added

- **Open tomorrow's daily note** command and ribbon icon: creates the next
  day's note if it does not exist, using the folder, filename format and
  template already configured in the core **Daily notes** plugin, then opens it.
- **Roll over unfinished tasks into tomorrow's note** command: the rollover on
  its own, without opening anything.
- Rollover copies today's unchecked tasks into tomorrow's note without touching
  today's, reads strictly the day before, skips tasks already present so repeat
  runs are safe, and marks each carried task with a `(↻n)` counter.
- Settings for the rollover heading, whether rollover happens on open, and
  whether the counter is shown.

[0.2.1]: https://github.com/MartinGallauner/next-day-planner/releases/tag/0.2.1
[0.2.0]: https://github.com/MartinGallauner/next-day-planner/releases/tag/0.2.0
[0.1.0]: https://github.com/MartinGallauner/next-day-planner/releases/tag/0.1.0
