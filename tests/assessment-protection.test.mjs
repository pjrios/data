import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assessmentProtectionConfig, defaultAccommodations } from "../assessment-protection/config.mjs";
import { installCopyProtection, isBlockedCopyShortcut } from "../assessment-protection/copy-protection.mjs";
import { normalizeAccommodations } from "../assessment-protection/index.mjs";
import { installPasteProtection, isPasteLikeInput, isPasteShortcut } from "../assessment-protection/paste-protection.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

class FakeDocument {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, handler, capture) {
    assert.equal(capture, true);
    const listeners = this.listeners.get(type) || [];
    listeners.push(handler);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, handler, capture) {
    assert.equal(capture, true);
    this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item !== handler));
  }

  emit(type, event) {
    (this.listeners.get(type) || []).forEach(handler => handler(event));
  }
}

function fakeTarget({ protectedContent = false, answerField = false, editable = false } = {}) {
  return {
    nodeType: 1,
    tagName: editable ? "TEXTAREA" : "DIV",
    isContentEditable: false,
    dataset: {},
    matches(selector) {
      if (selector === assessmentProtectionConfig.selectors.protectedContent) return protectedContent;
      if (selector === assessmentProtectionConfig.selectors.answerFields) return answerField;
      return false;
    },
    closest(selector) {
      if (selector === assessmentProtectionConfig.selectors.protectedContent && protectedContent) return this;
      if (selector === assessmentProtectionConfig.selectors.answerFields && answerField) return this;
      return null;
    }
  };
}

function fakeEvent(target, values = {}) {
  return {
    target,
    key: "",
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    cancelable: true,
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopImmediatePropagation() {
      this.propagationStopped = true;
    },
    ...values
  };
}

test("copy is prevented inside protected content and allowed outside", () => {
  const document = new FakeDocument();
  const attempts = [];
  const cleanup = installCopyProtection({
    document,
    config: assessmentProtectionConfig.copyProtection,
    selectors: assessmentProtectionConfig.selectors,
    accommodations: defaultAccommodations,
    onAttempt: type => attempts.push(type)
  });

  const protectedCopy = fakeEvent(fakeTarget({ protectedContent: true }));
  document.emit("copy", protectedCopy);
  assert.equal(protectedCopy.defaultPrevented, true);
  assert.deepEqual(attempts, ["copy"]);

  const outsideCopy = fakeEvent(fakeTarget());
  document.emit("copy", outsideCopy);
  assert.equal(outsideCopy.defaultPrevented, false);

  cleanup();
  assert.equal(document.listeners.get("copy").length, 0);
});

test("cut, select-all, context menu, and drag are scoped to protected content", () => {
  const document = new FakeDocument();
  installCopyProtection({
    document,
    config: assessmentProtectionConfig.copyProtection,
    selectors: assessmentProtectionConfig.selectors,
    accommodations: defaultAccommodations
  });

  for (const type of ["cut", "contextmenu", "dragstart"]) {
    const event = fakeEvent(fakeTarget({ protectedContent: true }));
    document.emit(type, event);
    assert.equal(event.defaultPrevented, true, `${type} should be prevented`);
  }

  const selectAll = fakeEvent(fakeTarget({ protectedContent: true }), { key: "a", ctrlKey: true });
  document.emit("keydown", selectAll);
  assert.equal(selectAll.defaultPrevented, true);

  const editableSelectAll = fakeEvent(
    fakeTarget({ protectedContent: true, answerField: true, editable: true }),
    { key: "a", metaKey: true }
  );
  document.emit("keydown", editableSelectAll);
  assert.equal(editableSelectAll.defaultPrevented, false);
});

test("ordinary keyboard navigation is not blocked", () => {
  const target = fakeTarget({ protectedContent: true, answerField: true, editable: true });
  for (const key of ["Tab", "ArrowLeft", "Enter", " ", "Escape"]) {
    assert.equal(
      isBlockedCopyShortcut(fakeEvent(target, { key }), assessmentProtectionConfig.copyProtection, defaultAccommodations),
      false
    );
  }
});

test("paste and dropped text are prevented only in protected answer fields", () => {
  const document = new FakeDocument();
  const attempts = [];
  installPasteProtection({
    document,
    config: assessmentProtectionConfig.pasteProtection,
    selectors: assessmentProtectionConfig.selectors,
    accommodations: defaultAccommodations,
    onAttempt: type => attempts.push(type)
  });

  const protectedPaste = fakeEvent(fakeTarget({ protectedContent: true, answerField: true, editable: true }));
  document.emit("paste", protectedPaste);
  assert.equal(protectedPaste.defaultPrevented, true);

  const protectedDrop = fakeEvent(fakeTarget({ protectedContent: true, answerField: true, editable: true }));
  document.emit("drop", protectedDrop);
  assert.equal(protectedDrop.defaultPrevented, true);

  const outsidePaste = fakeEvent(fakeTarget({ editable: true }));
  document.emit("paste", outsidePaste);
  assert.equal(outsidePaste.defaultPrevented, false);
  assert.deepEqual(attempts, ["paste", "drop"]);
});

test("paste shortcuts and paste-like beforeinput are blocked without blocking typing", () => {
  const document = new FakeDocument();
  installPasteProtection({
    document,
    config: assessmentProtectionConfig.pasteProtection,
    selectors: assessmentProtectionConfig.selectors,
    accommodations: defaultAccommodations
  });
  const target = fakeTarget({ protectedContent: true, answerField: true, editable: true });

  assert.equal(isPasteShortcut(fakeEvent(target, { key: "v", ctrlKey: true })), true);
  assert.equal(isPasteShortcut(fakeEvent(target, { key: "Insert", shiftKey: true })), true);
  assert.equal(isPasteLikeInput({ inputType: "insertFromPaste" }), true);
  assert.equal(isPasteLikeInput({ inputType: "insertText" }), false);

  const pasteShortcut = fakeEvent(target, { key: "v", metaKey: true });
  document.emit("keydown", pasteShortcut);
  assert.equal(pasteShortcut.defaultPrevented, true);

  const typedInput = fakeEvent(target, { inputType: "insertText" });
  document.emit("beforeinput", typedInput);
  assert.equal(typedInput.defaultPrevented, false);
});

test("accommodations can preserve selection, copy, cut, paste, and drop", () => {
  const document = new FakeDocument();
  const accommodations = {
    ...defaultAccommodations,
    allowCopy: true,
    allowCut: true,
    allowPaste: true,
    allowDrop: true,
    allowSelection: true
  };
  installCopyProtection({
    document,
    config: assessmentProtectionConfig.copyProtection,
    selectors: assessmentProtectionConfig.selectors,
    accommodations
  });
  installPasteProtection({
    document,
    config: assessmentProtectionConfig.pasteProtection,
    selectors: assessmentProtectionConfig.selectors,
    accommodations
  });
  const target = fakeTarget({ protectedContent: true, answerField: true, editable: true });

  for (const type of ["copy", "cut", "paste", "drop", "selectstart"]) {
    const event = fakeEvent(target);
    document.emit(type, event);
    assert.equal(event.defaultPrevented, false, `${type} should be allowed`);
  }
});

test("assistive-technology mode enables the complete interaction accommodation", () => {
  const accommodations = normalizeAccommodations({ assistiveTechnologyMode: true });
  assert.equal(accommodations.allowCopy, true);
  assert.equal(accommodations.allowCut, true);
  assert.equal(accommodations.allowPaste, true);
  assert.equal(accommodations.allowDrop, true);
  assert.equal(accommodations.allowSelection, true);
  assert.equal(accommodations.allowTranslation, true);
});

test("assessment pages include scoped translation and assistant guidance metadata", async () => {
  const pages = [
    "appreciation-1.html",
    "daily-grade-4.html",
    "guided-steward-8f3k2m.html"
  ];

  for (const page of pages) {
    const html = await readFile(join(root, page), "utf8");
    assert.match(html, /<meta name="google" content="notranslate"\s*\/>/);
    assert.match(html, /id="assessment-ai-guidance"/);
    assert.match(html, /learningResourceType": "Assessment"/);
    assert.match(html, /class="[^"]*exam-content[^"]*notranslate[^"]*"/);
    assert.match(html, /translate="no"/);
    assert.match(html, /assessment-protection\/index\.mjs/);
  }
});

test("protection code never reads clipboard or drop contents and has no student messages", async () => {
  const files = [
    "copy-protection.mjs",
    "paste-protection.mjs",
    "index.mjs"
  ];
  const source = (await Promise.all(
    files.map(file => readFile(join(root, "assessment-protection", file), "utf8"))
  )).join("\n");

  assert.doesNotMatch(source, /clipboardData|getData\(|navigator\.clipboard|dataTransfer\./);
  assert.doesNotMatch(source, /\balert\(|\bconfirm\(|\bprompt\(|toast|notification/i);
});
