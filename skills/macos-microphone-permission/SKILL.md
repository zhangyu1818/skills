---
name: macos-microphone-permission
description: Use when a macOS app needs microphone permission, the system prompt never appears, permission immediately becomes denied, or TCC and Hardened Runtime behavior around audio input needs debugging.
---

# macOS Microphone Permission

## Overview

Use this skill when a macOS app needs reliable microphone permission handling or when microphone authorization behaves unexpectedly.

For modern macOS permission handling, the correct source of truth is `AVCaptureDevice`, not `AVAudioApplication`.

## When to Use

Use this skill when:

- a microphone prompt does not appear
- clicking a request button immediately produces `denied`
- the app never shows up in `System Settings > Privacy & Security > Microphone`
- the app is a Developer ID or local debug build using Hardened Runtime
- the app uses Continuity iPhone microphone and permission behavior seems suspicious
- you need to test or debug the permission flow without guessing

Do not use this skill for:

- Accessibility permission
- Input Monitoring or event tap permission
- generic AVAudioEngine capture bugs after permission is already granted

## Correct Permission Flow

1. Add `NSMicrophoneUsageDescription` to the app's Info.plist inputs.
2. Treat `AVCaptureDevice.authorizationStatus(for: .audio)` as the permission truth.
3. Only call `AVCaptureDevice.requestAccess(for: .audio)` when the status is `.notDetermined`.
4. If the app uses Hardened Runtime, add `com.apple.security.device.audio-input`.
5. Do not enable App Sandbox just to request microphone permission.
6. If the status is already `.denied`, do not pretend the system will re-prompt. Send the user to `System Settings > Privacy & Security > Microphone`.

## Implementation Pattern

Use this pattern for production code:

```swift
let status = AVCaptureDevice.authorizationStatus(for: .audio)

switch status {
case .notDetermined:
    let granted = await withCheckedContinuation { continuation in
        AVCaptureDevice.requestAccess(for: .audio) { granted in
            continuation.resume(returning: granted)
        }
    }
    return granted ? .granted : .denied
case .authorized:
    return .granted
case .restricted, .denied:
    return .denied
@unknown default:
    return .denied
}
```

## Entitlement Choice

For non-sandboxed apps using Hardened Runtime, use:

- `com.apple.security.device.audio-input`

For sandboxed apps, use the App Sandbox capability flow that matches the product's distribution model.

Do not mix these models casually:

- `com.apple.security.device.microphone`

Reason:

- `audio-input` is the Hardened Runtime resource access entitlement for microphone capture.
- `device.microphone` is tied to App Sandbox capability flow.
- If the app is intentionally non-sandboxed, adding sandbox-oriented microphone entitlements is the wrong fix.

## TCC and State Interpretation

Interpret states this way:

- `notDetermined`: the system has not made a microphone decision for this app identity yet
- `authorized`: the app may capture audio
- `denied`: the user or system policy blocked access; do not expect another system prompt
- `restricted`: system policy or device management blocked access

Important:

- `tccutil reset Microphone <bundle-id>` only resets TCC for that app identity
- after reset, you must relaunch the app and request again from the same bundle identifier and bundle path
- if the app still does not appear in the system microphone list, treat that as a strong sign that the request path or entitlements are wrong

## Continuity iPhone Microphone

Using an iPhone as the microphone does not change the macOS permission model.

The app still needs standard microphone authorization. Continuity only changes the available input device, not the TCC flow.

## Troubleshooting Workflow

Follow this order:

1. Confirm the app bundle identifier and bundle path at runtime.
2. Confirm `NSMicrophoneUsageDescription` exists in the running app.
3. Confirm the built app contains `com.apple.security.device.audio-input`.
4. Check `AVCaptureDevice.authorizationStatus(for: .audio)` before requesting.
5. Only if the status is `.notDetermined`, call `AVCaptureDevice.requestAccess(for: .audio)`.
6. Re-check `AVCaptureDevice.authorizationStatus(for: .audio)` after the request.
7. If the result is `.denied`, stop trying to re-prompt and guide the user to System Settings.

Useful runtime logging fields:

- bundle identifier
- bundle path
- `NSMicrophoneUsageDescription` presence and length
- status before request
- request result
- status after request

## Verification Commands

Reset TCC:

```bash
tccutil reset Microphone your.bundle.identifier
```

Inspect logs:

```bash
log stream --style compact --predicate 'subsystem == "your.subsystem" && category == "permissions.microphone"'
```

Inspect built entitlements:

```bash
codesign -d --entitlements :- /path/to/TypeFree.app
```

Expected verification outcome:

- request starts from `.notDetermined`
- the system prompt appears
- the final state becomes `.authorized` or `.denied`
- the app appears under `System Settings > Privacy & Security > Microphone`

## Testing Strategy

Automate with Swift Testing:

- status mapping from `AVAuthorizationStatus` to app permission state
- request behavior when status is `.notDetermined`
- no-op refresh behavior when status is already `.denied` or `.authorized`
- guidance text for `undetermined` vs `denied`

Do not pretend full microphone permission is fully automatable in CI.

Keep these as manual acceptance:

- real first-run system prompt appearance
- real TCC reset and re-request behavior
- validation that the app appears in the macOS microphone privacy list

## Common Mistakes

- using `AVAudioApplication` as the permission source of truth
- calling `requestAccess` after the system already returned `denied`
- forgetting `NSMicrophoneUsageDescription`
- forgetting `com.apple.security.device.audio-input` on Hardened Runtime builds
- enabling App Sandbox just to chase microphone permission
- interpreting Continuity microphone selection as a different permission path

## References

- Apple: Requesting Authorization for Media Capture on macOS
  - https://developer.apple.com/documentation/bundleresources/requesting-authorization-for-media-capture-on-macos/
- Apple: `AVCaptureDevice.authorizationStatus(for:)`
  - https://developer.apple.com/documentation/avfoundation/avcapturedevice/authorizationstatus(for:)/
- Apple: `AVCaptureDevice.requestAccess(for:completionHandler:)`
  - https://developer.apple.com/documentation/avfoundation/avcapturedevice/requestaccess(for:completionhandler:)/
- Apple: `com.apple.security.device.audio-input`
  - https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.security.device.audio-input/
- Apple: `com.apple.security.device.microphone`
  - https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.security.device.microphone/
- Apple: Supporting Continuity Camera in your macOS app
  - https://developer.apple.com/documentation/avfoundation/supporting-continuity-camera-in-your-macos-app
