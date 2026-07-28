import {
  assessmentProtectionConfig,
  defaultAccommodations
} from "./config.mjs";
import { installCopyProtection } from "./copy-protection.mjs";
import { installPasteProtection } from "./paste-protection.mjs";
import { applyTranslationDiscouragement } from "./translation-protection.mjs";

const installationKey = Symbol.for("assessment-protection.installation");

export function normalizeAccommodations(value = {}) {
  const accommodations = {
    ...defaultAccommodations,
    ...(value && typeof value === "object" ? value : {})
  };
  if (accommodations.assistiveTechnologyMode) {
    return {
      ...accommodations,
      allowCopy: true,
      allowCut: true,
      allowPaste: true,
      allowDrop: true,
      allowSelection: true,
      allowTranslation: true
    };
  }
  return accommodations;
}

function createAttemptReporter(document, assessmentId) {
  return (eventType, target) => {
    const questionId = target?.dataset?.questionId
      || target?.closest?.("[data-question-id]")?.dataset?.questionId
      || null;

    document.dispatchEvent(new CustomEvent("assessment-protection:attempt", {
      detail: {
        assessmentId,
        questionId,
        eventType,
        timestamp: new Date().toISOString(),
        route: globalThis.location?.pathname || ""
      }
    }));
  };
}

export function initAssessmentProtection(options = {}) {
  const document = options.document || globalThis.document;
  if (!document || !assessmentProtectionConfig.enabled) return () => {};
  if (document[installationKey]) return document[installationKey];

  const config = options.config || assessmentProtectionConfig;
  const accommodations = normalizeAccommodations(options.accommodations);
  const assessmentId = options.assessmentId
    || document.body?.dataset?.assessmentId
    || document.title;
  const reportAttempt = options.onAttempt || createAttemptReporter(document, assessmentId);

  applyTranslationDiscouragement({
    document,
    selector: config.selectors.protectedContent,
    config: config.translationDiscouragement,
    accommodations
  });

  const removeCopyProtection = installCopyProtection({
    document,
    config: config.copyProtection,
    selectors: config.selectors,
    accommodations,
    onAttempt: reportAttempt
  });
  const removePasteProtection = installPasteProtection({
    document,
    config: config.pasteProtection,
    selectors: config.selectors,
    accommodations,
    onAttempt: reportAttempt
  });

  const cleanup = () => {
    removeCopyProtection();
    removePasteProtection();
    delete document[installationKey];
  };
  document[installationKey] = cleanup;
  return cleanup;
}

function initializeWhenReady() {
  const accommodations = globalThis.assessmentProtectionAccommodations || {};
  initAssessmentProtection({ accommodations });
}

if (globalThis.document) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWhenReady, { once: true });
  } else {
    initializeWhenReady();
  }
}
