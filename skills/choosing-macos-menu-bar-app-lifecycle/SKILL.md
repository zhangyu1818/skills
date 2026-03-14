---
name: choosing-macos-menu-bar-app-lifecycle
description: Use when building or refactoring a macOS status bar or menu bar app and deciding between a SwiftUI App lifecycle, MenuBarExtra, Settings, NSApplicationDelegateAdaptor, and a full AppKit lifecycle entry point.
---

# Choosing macOS Menu Bar App Lifecycle

## Overview

Default to SwiftUI scenes. Use AppKit as a bridge, not as the app's primary entry, unless you have a concrete lifecycle or compatibility reason.

Last verified: 2026-03-14.

## When to Use

- New macOS status bar or menu bar app in SwiftUI
- Existing menu bar app needs a Settings or Preferences window
- Deciding whether to use `@main struct App` or `NSApplication.shared` with a custom `main()`
- Refactoring an AppKit-heavy menu bar app toward SwiftUI

Do not use this skill for:

- Pure AppKit apps with no SwiftUI adoption plan
- iOS or iPadOS menu bar questions

## Decision Guide

1. If the app is SwiftUI-first and targets macOS 13 or later, use SwiftUI `App` lifecycle.
2. If it also has settings or other scenes, use `MenuBarExtra(..., isInserted:)`, not the primary-scene initializer.
3. If you need AppKit callbacks, keep SwiftUI entry and add `@NSApplicationDelegateAdaptor`.
4. If you must support macOS 11 or 12, keep SwiftUI `App` when practical and bridge the status item with AppKit because `MenuBarExtra` starts at macOS 13.
5. Use a full AppKit lifecycle entry only when the app is already AppKit-lifecycle, or when startup, activation policy, status item, menu, and window behavior are primarily AppKit-owned.

## Recommended Default

For a modern SwiftUI menu bar app with a settings window:

- Entry: `@main struct MyApp: App`
- Menu bar: `MenuBarExtra(..., isInserted:)`
- Settings: `Settings { SettingsView() }`
- AppKit hooks: `@NSApplicationDelegateAdaptor`
- Programmatic settings opening:
  - macOS 14+: `SettingsLink` or `@Environment(\.openSettings)`
  - macOS 13: add a small fallback only if needed

```swift
import SwiftUI

@main
struct MyApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @AppStorage("showMenuBarExtra") private var showMenuBarExtra = true

    var body: some Scene {
        MenuBarExtra("My App", systemImage: "star", isInserted: $showMenuBarExtra) {
            MenuContentView()
        }

        Settings {
            SettingsView()
        }
    }
}
```

Use `@NSApplicationDelegateAdaptor` for things like:

- launch-time AppKit setup
- activation policy changes
- permission prompts or other AppKit callbacks
- legacy AppKit services that still fit behind a delegate boundary

## macOS 11 and 12 Compatibility

If you need a status bar app before macOS 13, do not assume you need a full custom AppKit entry. A practical hybrid is:

- keep SwiftUI `App` lifecycle
- use `Settings` as the settings window
- create the `NSStatusItem` from an AppKit delegate

```swift
import AppKit
import SwiftUI

@main
struct MyApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate

    var body: some Scene {
        Settings {
            SettingsView()
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var statusItem: NSStatusItem?

    func applicationDidFinishLaunching(_ notification: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        statusItem?.button?.image = NSImage(systemSymbolName: "star", accessibilityDescription: "My App")
    }
}
```

This keeps the app scene-based while only moving the missing status bar piece into AppKit.

## Avoid This by Default

Do not start from a custom AppKit `main()` just because the app lives in the menu bar.

```swift
@main
struct AppEntry {
    static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()
        app.delegate = delegate
        app.run()
    }
}
```

Choose this only when one of these is true:

- the app already uses AppKit lifecycle and large-scale migration is not worth it
- the core architecture is AppKit-owned, not SwiftUI-owned
- you need behavior that is substantially easier to model in AppKit than as SwiftUI scenes plus an adaptor
- you are deliberately building an AppKit app that hosts some SwiftUI views

When you do choose AppKit lifecycle, `NSHostingController`, `NSHostingView`, and on macOS 26 and later `NSHostingSceneRepresentation` are the bridge tools. They are integration tools, not the default architecture for a new SwiftUI menu bar app.

## MenuBarExtra Initializer Rule

`MenuBarExtra` has two relevant modes:

- Primary-scene mode:
  - `MenuBarExtra("App", systemImage: "hammer") { ... }`
  - Good for a menu-bar-only utility app
  - If the user removes the extra, the app quits
  - Do not combine this form with other scenes

- Multi-scene mode:
  - `MenuBarExtra("App", systemImage: "hammer", isInserted: $flag) { ... }`
  - Use this when the app also has `Settings`, `Window`, or `WindowGroup`
  - This is the safe default for real apps

## Version Matrix

- `Settings`: macOS 11+
- `MenuBarExtra`: macOS 13+
- `SettingsLink`: macOS 14+
- `openSettings`: macOS 14+
- `NSHostingSceneRepresentation`: macOS 26+

## Practical Rules

- If the app is new and SwiftUI-heavy, start from SwiftUI `App`.
- If you only need a few AppKit hooks, add an adaptor instead of replacing the entry.
- If the app needs a settings window, keep settings as a SwiftUI `Settings` scene whenever possible.
- If you are supporting macOS 11 or 12, build a hybrid around SwiftUI `App` rather than assuming you need a fully custom AppKit entry.
- Re-check Apple docs when scene APIs or your minimum macOS version change.

## Sources

- https://developer.apple.com/documentation/swiftui/migrating-to-the-swiftui-life-cycle
- https://developer.apple.com/documentation/swiftui/menubarextra
- https://developer.apple.com/documentation/swiftui/settings
- https://developer.apple.com/documentation/swiftui/nsapplicationdelegateadaptor
- https://developer.apple.com/documentation/swiftui/settingslink
- https://developer.apple.com/documentation/swiftui/environmentvalues/opensettings
- https://developer.apple.com/documentation/swiftui/appkit-integration
- https://developer.apple.com/documentation/swiftui/nshostingscenerepresentation
