export function applyTranslationDiscouragement({
  document,
  selector,
  config,
  accommodations
}) {
  if (!config.enabled || accommodations.allowTranslation) return;

  document.querySelectorAll(selector).forEach(element => {
    if (config.useTranslateNoAttribute) element.setAttribute("translate", "no");
    if (config.useNotranslateClass) element.classList.add("notranslate");
  });
}
