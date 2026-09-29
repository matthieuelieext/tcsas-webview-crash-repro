# TCSAS DevTools crash when destroying a clicked `<web-view>`

Minimal reproduction: TCSAS DevTools crashes when a `<web-view>` is removed from the page
**after the user has clicked inside it**. Without any click, removing it works fine.
The same flow works on a real device.

## Environment

| Item              | Value                                             |
|-------------------|---------------------------------------------------|
| TCSAS DevTools    | 2.4.511 (darwin_arm64)                            |
| Base library      | 2.3.9 (`TCSASLibVersion` in `project.config.json`) |
| OS                | macOS 26.6.2 (25G83), Apple Silicon               |
| Real device       | Not affected (same flow works in the super app)   |

The project has no dependency: no npm package, no JSSDK, no third-party script, no network call.

## Steps to reproduce

1. Clone this repository:
   `git clone https://github.com/matthieuelieext/tcsas-webview-crash-repro.git`
2. In TCSAS DevTools, import the cloned folder as a mini program project. No AppID is needed:
   `project.config.json` uses the tourist ID (`"TCSASappid": "touristId"`).
3. **Case 1**: compile and do not touch the simulator. After 10 s the web-view is removed and
   "Web-view destroyed" is displayed → **OK**.
4. **Case 2**: recompile, click the button inside the web-view, then wait. After 10 s the web-view
   is removed → **DevTools crashes**.

## Expected

The web-view is removed and "Web-view destroyed" is displayed, as on a real device.

## Actual

TCSAS DevTools crashes as soon as the web-view is destroyed. No error is logged beforehand, and
a `try/catch` around the navigation call does not catch anything.

## Code

- `pages/index/index.wxml`: `<web-view wx:if="{{ show }}" src="/static/index.html" />`
- `pages/index/index.js`: `setTimeout(() => this.setData({ show: false }), 10000)` in `onLoad`
- `static/index.html`: static page with a button that does nothing

## Other variants tested (same result)

These variants were tested in the original project this repro was extracted from. The crash
happens whatever the way the web-view is left, as long as the user clicked inside it:

| Action inside the web-view                                       | How the web-view is destroyed        | Result |
|------------------------------------------------------------------|--------------------------------------|--------|
| None                                                             | `setData` (`wx:if`) after timer      | OK     |
| Click on a button with no logic                                  | `setData` after timer                | Crash  |
| Click, then `blur()` of the focused element                      | `setData` after timer                | Crash  |
| Click → `wx.miniProgram.sendWebviewEvent(...)`                   | `setData` in `bindevent` handler     | Crash  |
| Click → `wx.miniProgram.sendWebviewEvent(...)`, host waits 5 s   | `setData` after delay                | Crash  |
| Click → `location.href = '...?done=1'`                           | `setData` in `bindload` handler      | Crash  |
| Click → `wx.miniProgram.reLaunch(...)`                           | Navigation                           | Crash  |
| Click → `sendWebviewEvent`, host calls `wx.redirectTo` / `wx.reLaunch` | Navigation                     | Crash  |
