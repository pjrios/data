import {
  isModifiedKey,
  matchesOrIsWithin,
  silentlyPrevent
} from "./dom-utils.mjs";

export function isPasteShortcut(event) {
  return isModifiedKey(event, "v")
    || (event.shiftKey && String(event.key).toLowerCase() === "insert");
}

export function isPasteLikeInput(event) {
  return ["insertFromPaste", "insertFromDrop"].includes(event.inputType);
}

export function installPasteProtection({
  document,
  config,
  selectors,
  accommodations,
  onAttempt = () => {}
}) {
  if (!config.enabled) return () => {};

  const removers = [];
  const listen = (type, handler) => {
    document.addEventListener(type, handler, true);
    removers.push(() => document.removeEventListener(type, handler, true));
  };
  const inAnswerField = target => matchesOrIsWithin(target, selectors.answerFields);
  const block = (event, eventType) => {
    silentlyPrevent(event);
    onAttempt(eventType, event.target);
  };

  listen("paste", event => {
    if (config.disablePaste && !accommodations.allowPaste && inAnswerField(event.target)) {
      // Clipboard data is intentionally neither read nor retained.
      block(event, "paste");
    }
  });

  listen("drop", event => {
    if (config.disableDrop && !accommodations.allowDrop && inAnswerField(event.target)) {
      // DataTransfer contents are intentionally neither read nor retained.
      block(event, "drop");
    }
  });

  listen("beforeinput", event => {
    if (
      !accommodations.allowPaste
      && inAnswerField(event.target)
      && isPasteLikeInput(event)
    ) {
      block(event, event.inputType === "insertFromDrop" ? "drop-input" : "paste-input");
    }
  });

  listen("keydown", event => {
    if (
      config.disablePasteShortcuts
      && !accommodations.allowPaste
      && inAnswerField(event.target)
      && isPasteShortcut(event)
    ) {
      block(event, "paste-shortcut");
    }
  });

  return () => removers.splice(0).forEach(remove => remove());
}
