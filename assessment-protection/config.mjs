export const assessmentProtectionConfig = Object.freeze({
  enabled: true,
  selectors: Object.freeze({
    protectedContent: ".exam-content",
    answerFields: [
      ".student-answer",
      ".exam-content textarea",
      '.exam-content input[type="text"]',
      '.exam-content input[type="search"]',
      '.exam-content input[type="email"]',
      '.exam-content input[type="url"]',
      '.exam-content input[type="tel"]',
      '.exam-content input[type="number"]',
      '.exam-content [contenteditable="true"]'
    ].join(", "),
    applicationCopyControls: [
      ".exam-content [data-copy]",
      ".exam-content .copy-button",
      '.exam-content [aria-label*="copy" i]'
    ].join(", ")
  }),
  copyProtection: Object.freeze({
    enabled: true,
    disableSelection: true,
    disableCopy: true,
    disableCut: true,
    disableContextMenu: true,
    disableDrag: true,
    blockSelectAll: true
  }),
  pasteProtection: Object.freeze({
    enabled: true,
    disablePaste: true,
    disableDrop: true,
    disablePasteShortcuts: true,
    inspectClipboardContents: false
  }),
  translationDiscouragement: Object.freeze({
    enabled: true,
    useTranslateNoAttribute: true,
    useNotranslateClass: true
  }),
  silent: true
});

export const defaultAccommodations = Object.freeze({
  allowCopy: false,
  allowCut: false,
  allowPaste: false,
  allowDrop: false,
  allowSelection: false,
  allowTranslation: false,
  assistiveTechnologyMode: false
});
