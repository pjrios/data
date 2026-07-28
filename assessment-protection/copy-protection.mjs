import {
  isEditableTarget,
  isModifiedKey,
  matchesOrIsWithin,
  silentlyPrevent
} from "./dom-utils.mjs";

export function isBlockedCopyShortcut(event, config, accommodations) {
  if (isModifiedKey(event, "c")) return config.disableCopy && !accommodations.allowCopy;
  if (isModifiedKey(event, "x")) return config.disableCut && !accommodations.allowCut;
  if (isModifiedKey(event, "a")) {
    return config.blockSelectAll
      && !accommodations.allowSelection
      && !isEditableTarget(event.target);
  }
  return false;
}

export function installCopyProtection({
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
  const inProtectedContent = target => matchesOrIsWithin(target, selectors.protectedContent);
  const block = (event, eventType) => {
    silentlyPrevent(event);
    onAttempt(eventType, event.target);
  };

  listen("copy", event => {
    if (config.disableCopy && !accommodations.allowCopy && inProtectedContent(event.target)) {
      block(event, "copy");
    }
  });

  listen("cut", event => {
    if (config.disableCut && !accommodations.allowCut && inProtectedContent(event.target)) {
      block(event, "cut");
    }
  });

  listen("contextmenu", event => {
    if (config.disableContextMenu && inProtectedContent(event.target)) {
      block(event, "contextmenu");
    }
  });

  listen("dragstart", event => {
    if (config.disableDrag && inProtectedContent(event.target)) {
      block(event, "dragstart");
    }
  });

  listen("selectstart", event => {
    if (
      config.disableSelection
      && !accommodations.allowSelection
      && inProtectedContent(event.target)
      && !isEditableTarget(event.target)
    ) {
      block(event, "selectstart");
    }
  });

  listen("keydown", event => {
    if (inProtectedContent(event.target) && isBlockedCopyShortcut(event, config, accommodations)) {
      block(event, "copy-shortcut");
    }
  });

  listen("click", event => {
    if (
      config.disableCopy
      && !accommodations.allowCopy
      && matchesOrIsWithin(event.target, selectors.applicationCopyControls)
    ) {
      block(event, "application-copy");
    }
  });

  return () => removers.splice(0).forEach(remove => remove());
}
