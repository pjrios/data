export function elementFromTarget(target) {
  if (!target) return null;
  if (target.nodeType === 1) return target;
  return target.parentElement || null;
}

export function matchesOrIsWithin(target, selector) {
  const element = elementFromTarget(target);
  return Boolean(element?.matches?.(selector) || element?.closest?.(selector));
}

export function isEditableTarget(target) {
  const element = elementFromTarget(target);
  if (!element) return false;
  if (element.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName);
}

export function isModifiedKey(event, key) {
  return Boolean((event.ctrlKey || event.metaKey) && String(event.key).toLowerCase() === key);
}

export function silentlyPrevent(event) {
  if (event?.cancelable !== false) event?.preventDefault?.();
  event?.stopImmediatePropagation?.();
}
