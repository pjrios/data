# Assessment Protection

This folder provides silent, assessment-scoped deterrence for:

- `appreciation-1.html`
- `daily-grade-4.html`
- `guided-steward-8f3k2m.html`

## Protected regions

Only elements explicitly marked with all of the following are protected:

```html
class="exam-content notranslate"
translate="no"
```

Copy, cut, selection, context-menu, and drag handlers are registered in the
capture phase. Paste, dropped text, Ctrl/Cmd+V, Shift+Insert, and paste-like
`beforeinput` events are blocked in editable response fields inside those
regions. Clipboard and `DataTransfer` contents are never read.

Editable fields retain ordinary typing, deletion, caret movement, focus,
keyboard navigation, dictation input, and local text selection for revision.
Copying and cutting from those fields remain blocked because they are inside
protected assessment content.

## Silent operation

Blocked actions do not create alerts, banners, dialogs, toast notifications,
tooltips, warnings, or visible status changes. A non-persistent
`assessment-protection:attempt` browser event is emitted with limited metadata
for possible future integration. The event contains no answer, clipboard, or
dropped content and is not currently stored or transmitted.

## Accommodations

The initializer accepts accommodation overrides before protection is
installed:

```js
window.assessmentProtectionAccommodations = {
  allowCopy: true,
  allowCut: true,
  allowPaste: true,
  allowDrop: true,
  allowSelection: true,
  allowTranslation: true,
  assistiveTechnologyMode: true
};
```

The current static deployment has no authorization service for these settings.
When the assessments move into the authenticated Supabase application,
accommodation values should come from a server-authorized session rather than
student-controlled browser code.

## Automated-assistant guidance

Each assessment page contains separate JSON-LD metadata identifying the page
as an active educational assessment and requesting conceptual guidance rather
than completed answers. This is advisory. Automated assistants and browser
extensions are not required to honor it.

## Limitations

Browser-side deterrence cannot prevent screenshots, photographs, another
device, manually retyping content, developer-tool changes, disabled JavaScript,
external translation, browser extensions, screenshot-based AI tools, or
network inspection of content delivered to the browser.

## Tests

Run:

```sh
node --test tests/assessment-protection.test.mjs
```
