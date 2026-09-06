# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.1] - 2026-09-06

### Fixed

- The `Ctrl/Cmd+Shift+R` "Shuffle noise pattern" shortcut (documented in the README's Keyboard Shortcuts table as always available) silently did nothing when the active pattern wasn't "Noise dots" — it still called `preventDefault()` and blocked the browser's native hard-refresh shortcut, with no feedback telling the user why. It now shows a toast ("Select the Noise pattern to shuffle it") when triggered while a different pattern is selected, so the shortcut's behavior matches what's documented instead of failing silently.
