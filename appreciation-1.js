let originalRows = [];
const acceptedDatasetIds = new Set(["A", "B", "C", "D"]);
const acceptedDatasetHashes = {
  A: "3af7b6615d46230c5686fcdb5513c768991bd7d09850f1ba8939cc665d049601",
  B: "72240bde50aafc4bf4bb41ace929009446c2a68ef2257b64d1d071c176a0de96",
  C: "c79f56665c4751622521eeefaec5cc1fdd54956ed6eefe76b6b7a49deea83c51",
  D: "4e0cf1e555aa763bb65d1d1fc091af9a1fd2d75ef96ce6dc2bd7a5ee5f55be1d"
};
const storageKey = "dataStewardAppreciation1V4";
const legacyStorageKey = "dataStewardLockedAppreciation1V3";
const datasetContext = "A school environmental team conducted a one-day waste and recycling collection around the campus. Each row is one collection record showing the school location, the number of individual items collected, and the material category assigned to those items. Different team members entered the data, so the dataset may contain missing information, duplicate records, unreasonable quantities, inconsistent units, or inconsistent category names. Clean the data without inventing information, then use reliable records to compare two collection points.";
const stageNames = [
  "Upload your assigned CSV file",
  "Clean the assigned dataset",
  "Write your manual change log",
  "Complete the peer review",
  "Write your individual reflections",
  "Create a two-location comparison",
  "Review and submit your evidence"
];
const reflectionPrompts = [
  { key: "responsibility", label: "Responsibility", prompt: "What did you do to check your work before locking the dataset?" },
  { key: "communication", label: "Respectful communication", prompt: "What did your partner say, and how did you respond respectfully?" },
  { key: "sharedWork", label: "Shared work", prompt: "What correction did you check for your partner, and what did your partner check for you?" },
  { key: "dataCare", label: "Data care", prompt: "Which correction best shows that you avoided inventing information? Explain." },
  { key: "persistence", label: "Persistence", prompt: "What was difficult, and what did you do before continuing?" }
];

let state = createInitialState();

const briefingSection = document.querySelector("#briefingSection");
const assessmentSection = document.querySelector("#assessmentSection");
const stageHost = document.querySelector("#stageHost");
const stageMessage = document.querySelector("#stageMessage");
const stageActions = document.querySelector("#stageActions");
const lockDialog = document.querySelector("#lockDialog");
const supportDialog = document.querySelector("#supportDialog");
const studentDialog = document.querySelector("#studentDialog");

function createInitialState() {
  return {
    version: 4,
    introComplete: false,
    currentStage: 1,
    lockedAt: {},
    stageSnapshots: {},
    dataset: { id: "", fileName: "" },
    originalRows: [],
    rows: [],
    removedRows: [],
    logEntries: [emptyLogEntry(), emptyLogEntry(), emptyLogEntry()],
    peer: { partnerName: "", correctionExplained: "", feedbackReceived: "", correctionChecked: "" },
    reflections: Object.fromEntries(reflectionPrompts.map(item => [item.key, ""])),
    model: { title: "", material: "", firstRow: "", secondRow: "", conclusion: "" },
    student: { name: "", className: "", date: getLocalDateValue() }
  };
}

function emptyLogEntry() {
  return { row: "", original: "", problem: "", cleaned: "", reason: "" };
}

function persistState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    showStageMessage("Your work could not be saved. Keep this page open until you finish.", "warning");
  }
}

function restoreState() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) || localStorage.getItem(legacyStorageKey));
  } catch {
    try { localStorage.removeItem(storageKey); } catch {}
    return;
  }
  if (!saved || ![3, 4].includes(saved.version) || typeof saved !== "object") return;
  if (!Number.isInteger(saved.currentStage) || saved.currentStage < 1 || saved.currentStage > 7) return;
  const validRows = rows => Array.isArray(rows)
    && rows.every(row => row && ["point", "items", "material"].every(key => typeof row[key] === "string"));
  if (!validRows(saved.originalRows) || !validRows(saved.rows) || saved.originalRows.length !== saved.rows.length) return;
  if (saved.currentStage > 1 && (!saved.dataset || !acceptedDatasetIds.has(saved.dataset.id) || saved.originalRows.length !== 12)) return;
  state = saved;
  state.version = 4;
  state.dataset = saved.dataset && acceptedDatasetIds.has(saved.dataset.id)
    ? { id: saved.dataset.id, fileName: stringOrEmpty(saved.dataset.fileName) }
    : { id: "", fileName: "" };
  state.originalRows = structuredClone(saved.originalRows);
  originalRows = structuredClone(state.originalRows);
  state.lockedAt = saved.lockedAt && typeof saved.lockedAt === "object" ? saved.lockedAt : {};
  state.stageSnapshots = saved.stageSnapshots && typeof saved.stageSnapshots === "object" ? saved.stageSnapshots : {};
  state.removedRows = Array.isArray(saved.removedRows)
    ? [...new Set(saved.removedRows.filter(index => Number.isInteger(index) && index >= 0 && index < state.rows.length))]
    : [];
  state.logEntries = Array.isArray(saved.logEntries) && saved.logEntries.length
    ? saved.logEntries.filter(entry => entry && ["row", "original", "problem", "cleaned", "reason"].every(key => typeof entry[key] === "string")).slice(0, 12)
    : [emptyLogEntry(), emptyLogEntry(), emptyLogEntry()];
  while (state.logEntries.length < 3) state.logEntries.push(emptyLogEntry());
  state.peer = saved.peer && typeof saved.peer === "object"
    ? { partnerName: stringOrEmpty(saved.peer.partnerName), correctionExplained: stringOrEmpty(saved.peer.correctionExplained), feedbackReceived: stringOrEmpty(saved.peer.feedbackReceived), correctionChecked: stringOrEmpty(saved.peer.correctionChecked) }
    : { partnerName: "", correctionExplained: "", feedbackReceived: "", correctionChecked: "" };
  state.reflections = Object.fromEntries(reflectionPrompts.map(item => [item.key, stringOrEmpty(saved.reflections?.[item.key])]));
  const hasComparisonModel = saved.model && typeof saved.model === "object"
    && ["material", "firstRow", "secondRow", "conclusion"].every(key => typeof saved.model[key] === "string");
  state.model = hasComparisonModel
    ? {
        title: stringOrEmpty(saved.model.title),
        material: stringOrEmpty(saved.model.material),
        firstRow: stringOrEmpty(saved.model.firstRow),
        secondRow: stringOrEmpty(saved.model.secondRow),
        conclusion: stringOrEmpty(saved.model.conclusion)
      }
    : { title: stringOrEmpty(saved.model?.title), material: "", firstRow: "", secondRow: "", conclusion: "" };
  if (!hasComparisonModel && state.currentStage === 7) {
    state.currentStage = 6;
    delete state.lockedAt["6"];
    persistState();
  }
  state.student = saved.student && typeof saved.student === "object"
    ? { name: stringOrEmpty(saved.student.name), className: stringOrEmpty(saved.student.className), date: stringOrEmpty(saved.student.date) || getLocalDateValue() }
    : { name: "", className: "", date: getLocalDateValue() };
  Object.keys(state.lockedAt).forEach(stage => {
    if (!state.stageSnapshots[stage]) state.stageSnapshots[stage] = createStageSnapshot(Number(stage));
  });
  persistState();
}

function stringOrEmpty(value) {
  return typeof value === "string" ? value : "";
}

function renderView() {
  briefingSection.hidden = state.introComplete;
  assessmentSection.hidden = !state.introComplete;
  if (state.introComplete) renderStage();
}

function beginAssessment() {
  state.introComplete = true;
  state.currentStage = 1;
  persistState();
  window.history.replaceState({ assessment: true }, "", `${window.location.pathname}${window.location.search}#assessment`);
  renderView();
  document.querySelector("#stageTitle").focus({ preventScroll: true });
  assessmentSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderStage() {
  const stage = state.currentStage;
  document.querySelector("#stageCounter").textContent = `Stage ${stage} of 7`;
  document.querySelector("#stageTitle").textContent = stageNames[stage - 1];
  stageMessage.textContent = "";
  stageMessage.className = "result";
  stageHost.innerHTML = `${renderRevisionNotice(stage)}${stageRenderers[stage]()}`;
  renderStageNavigation();
  stageActions.hidden = stage === 7;
  if (stage < 7) document.querySelector("#lockStageBtn").textContent = stageButtonLabel(stage);
  bindStageEvents(stage);
}

function renderRevisionNotice(stage) {
  if (stage === 7 || !state.stageSnapshots[String(stage)]) return "";
  return `<div class="revision-note"><strong>You are revising a saved stage.</strong> When you choose Save and continue, this version will replace the earlier version used for scoring.</div>`;
}

function highestAccessibleStage() {
  const finished = Object.keys(state.lockedAt).map(Number).filter(Number.isInteger);
  return Math.max(state.currentStage, finished.length ? Math.max(...finished) + 1 : 1);
}

function renderStageNavigation() {
  const highest = Math.min(7, highestAccessibleStage());
  const nav = document.querySelector("#stageNav");
  nav.innerHTML = Array.from({ length: highest }, (_, index) => index + 1).map(stage => {
    const finished = Boolean(state.lockedAt[String(stage)]);
    const current = stage === state.currentStage;
    const disabled = stage === 1 && finished;
    return `<button type="button" data-stage-nav="${stage}" class="${finished ? "stage-finished" : ""}"${current ? ' aria-current="step"' : ""}${disabled ? ' disabled title="The assigned file cannot be replaced"' : ""}>${stage === 7 ? "Final review" : `Stage ${stage}`}</button>`;
  }).join("");
}

function navigateToStage(stage) {
  if (!Number.isInteger(stage) || stage < 1 || stage > highestAccessibleStage()) return;
  if (stage === 1 && state.lockedAt["1"]) return;
  state.currentStage = stage;
  persistState();
  renderStage();
  document.querySelector("#stageTitle").focus({ preventScroll: true });
  assessmentSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function stageButtonLabel(stage) {
  return {
    1: "Lock assigned file and continue",
    2: "Save dataset and continue",
    3: "Save change log and continue",
    4: "Save peer review and continue",
    5: "Save reflections and continue",
    6: "Save display and continue"
  }[stage];
}

const stageRenderers = {
  1: () => `
    <p class="stage-intro">Upload the CSV file your teacher assigned to you. The file is read only in this browser and is not sent to a server.</p>
    <div class="upload-panel">
      <label class="csv-upload-label" for="datasetFile">
        <span class="upload-title">Choose your assigned CSV file</span>
        <span class="hint">Accepted assessment files: Dataset A, B, C, or D.</span>
        <input id="datasetFile" type="file" accept=".csv,text/csv" />
      </label>
      <div class="rules"><strong>Before continuing:</strong> Confirm that the dataset letter matches the file your teacher assigned. The assigned file cannot be replaced after Stage 1.</div>
    </div>
    <div id="importPreview" aria-live="polite">${renderImportPreview()}</div>`,

  2: () => `
    <div class="dataset-identity"><strong>Assigned Dataset ${escapeHtml(state.dataset.id)}</strong><span>${escapeHtml(state.dataset.fileName)}</span></div>
    ${renderDatasetContext()}
    <div class="support-reminder">
      <div><strong>Use the built-in assessment support.</strong><span>Review the data-care rules, hints, and change-log notes without leaving this assessment.</span></div>
      <button class="secondary" type="button" data-open-support>Open support</button>
    </div>
    <p class="stage-intro">Review every row and independently correct the problems you find. The website will not identify the problems or tell you whether a correction is right.</p>
    <div class="rules"><strong>Data-care rules:</strong> Do not invent missing information—use <em>Not provided</em> when the correct value is unknown. For this small school collection, a quantity above 100 items is implausible unless another source verifies it. When two records are exactly repeated, keep the first record and mark the later copy as a duplicate.</div>
    <div class="row-status-legend" aria-label="Dataset row color guide">
      <span><i class="status-swatch status-untouched" aria-hidden="true"></i><strong>White</strong> Not edited</span>
      <span><i class="status-swatch status-edited" aria-hidden="true"></i><strong>Green</strong> Edited</span>
      <span><i class="status-swatch status-removed" aria-hidden="true"></i><strong>Red</strong> Removed</span>
    </div>
    <div class="table-scroll">
      <table id="editableDataset">
        <thead><tr><th>Row</th><th>Collection Point</th><th>Items Collected</th><th>Material Category</th><th>Action</th></tr></thead>
        <tbody>${state.rows.map((row, index) => `
          <tr class="${isRowRemoved(index) ? "removed-row" : rowChanged(index) ? "changed" : ""}">
            <td>${index + 1}</td>
            <td><input type="text" data-row="${index}" data-key="point" value="${escapeHtml(row.point)}" aria-label="Collection point row ${index + 1}"${isRowRemoved(index) ? " disabled" : ""}></td>
            <td><input type="text" data-row="${index}" data-key="items" value="${escapeHtml(row.items)}" aria-label="Items collected row ${index + 1}"${isRowRemoved(index) ? " disabled" : ""}></td>
            <td><input type="text" data-row="${index}" data-key="material" value="${escapeHtml(row.material)}" aria-label="Material category row ${index + 1}"${isRowRemoved(index) ? " disabled" : ""}></td>
            <td><button type="button" class="duplicate-row-button${isRowRemoved(index) ? " restore-row-button" : ""}" data-remove-row="${index}">${isRowRemoved(index) ? "Restore row" : "Remove duplicate"}</button></td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
    <p id="datasetDraftStatus" class="progress-text">${datasetDraftStatus()}</p>`,

  3: () => `
    <div class="dataset-identity"><strong>Assigned Dataset ${escapeHtml(state.dataset.id)}</strong><span>Imported file is fixed</span></div>
    <p class="stage-intro">Compare the original data with your current working corrections, then manually document at least three changes.</p>
    ${renderDatasetComparison()}
    <div class="section-heading log-heading">
      <div><h3>Your manual change log</h3><p class="hint">Type each entry yourself. Explain why the cleaned value is more appropriate.</p></div>
      <button id="addLogEntryBtn" class="secondary" type="button">Add another entry</button>
    </div>
    <div class="table-scroll">
      <table id="manualLogTable">
        <thead><tr><th>Row</th><th>Original Value</th><th>Problem Found</th><th>Cleaned Value</th><th>Reason</th><th>Action</th></tr></thead>
        <tbody>${renderEditableLogRows()}</tbody>
      </table>
    </div>
    <p id="logDraftStatus" class="progress-text">${completeLogEntries().length} complete entr${completeLogEntries().length === 1 ? "y" : "ies"} · minimum 3.</p>`,

  4: () => `
    <p class="stage-intro">Use your saved cleaning evidence during a five-minute review with one assigned partner.</p>
    <div class="locked-evidence">
      <h3>Saved cleaning evidence</h3>
      ${renderReadOnlyDataset()}
      ${renderReadOnlyLog()}
    </div>
    <div class="peer-name"><label>Partner's full name<input id="partnerName" type="text" maxlength="60" value="${escapeHtml(state.peer.partnerName)}" placeholder="Enter your assigned partner"></label></div>
    <div class="question-grid">
      <label>Which correction did you explain to your partner?
        <textarea id="correctionExplained" rows="3" maxlength="500" placeholder="Name the row or value and summarize your explanation...">${escapeHtml(state.peer.correctionExplained)}</textarea>
      </label>
      <label>What useful feedback did your partner give you?
        <textarea id="feedbackReceived" rows="3" maxlength="500" placeholder="Record the feedback you received...">${escapeHtml(state.peer.feedbackReceived)}</textarea>
      </label>
      <label>Which correction did you check for your partner?
        <textarea id="correctionChecked" rows="3" maxlength="500" placeholder="Explain what you checked and what you told your partner...">${escapeHtml(state.peer.correctionChecked)}</textarea>
      </label>
    </div>`,

  5: () => `
    <p class="stage-intro">Answer each question in one or two complete sentences. Use specific evidence from your cleaning and peer review.</p>
    <div class="peer-summary"><strong>Peer-review partner:</strong> ${escapeHtml(state.peer.partnerName)}</div>
    <div class="reflection-grid">
      ${reflectionPrompts.map((item, index) => `
        <label><span class="reflection-number">${index + 1}</span><span><strong>${item.label}</strong>${item.prompt}</span>
          <textarea data-reflection="${item.key}" rows="3" maxlength="500" placeholder="Write a short, specific reflection...">${escapeHtml(state.reflections[item.key])}</textarea>
        </label>`).join("")}
    </div>`,

  6: () => `
    <p class="stage-intro">Use two accurate values from your current working dataset to show which collection point gathered more items. If an earlier data error prevents a fair comparison, return to Stage 2 and correct the working copy.</p>
    <div class="comparison-task">
      <strong>Your goal</strong>
      <p>Create two proportional bars: one for each collection point. Then state which location collected more and calculate the difference.</p>
      <ol>
        <li>Choose two different collection points.</li>
        <li>Check that the displayed values match your current working data.</li>
        <li>Write a comparison sentence using both locations and the difference.</li>
      </ol>
    </div>
    <div class="locked-evidence compact-evidence"><h3>Your current working dataset</h3>${renderReadOnlyDataset()}</div>
    ${renderComparisonAvailability()}
    <div class="model-grid">
      <label class="model-title">Comparison title<input id="modelTitleInput" type="text" maxlength="80" value="${escapeHtml(state.model.title)}" placeholder="Example: Metal items collected at the Gym and Courtyard"></label>
      <label class="model-material">Material to compare<select id="modelMaterial">
        <option value="">Choose a material with two reliable values</option>
        ${renderComparableMaterialOptions(state.model.material)}
      </select></label>
      <label>First collection point<select id="modelFirstRow">
        <option value="">Choose the first location</option>
        ${renderComparisonOptions(state.model.firstRow, state.model.material)}
      </select></label>
      <label>Second collection point<select id="modelSecondRow">
        <option value="">Choose the second location</option>
        ${renderComparisonOptions(state.model.secondRow, state.model.material)}
      </select></label>
      <label class="model-description">Comparison sentence<textarea id="modelConclusion" rows="3" maxlength="400" placeholder="Example: The Courtyard collected 4 more items than the Technology Lab.">${escapeHtml(state.model.conclusion)}</textarea></label>
    </div>
    <div id="modelPreview" class="model-preview" aria-live="polite">${renderModelPreview()}</div>`,

  7: () => `
    <p class="stage-intro">Every assessment stage has been marked finished. Review the newest saved evidence below, then download the PDF. If you revise a stage, save it again before returning here.</p>
    <div class="completion-banner"><span aria-hidden="true">✓</span><div><strong>All six evidence stages are finished</strong><p>Dataset ${escapeHtml(state.dataset.id)} and your evidence report are ready.</p></div></div>
    ${renderFinalReview()}
    <div class="submission-instructions"><strong>Submit your individual evidence:</strong><ol>
      <li>Click <em>Download individual report</em>.</li>
      <li>Add your full name, class, and activity date.</li>
      <li>Upload the PDF to Google Classroom.</li>
    </ol></div>
    <button id="downloadPdfBtn" type="button">Download individual report</button>`
};

function renderFinalReview() {
  const cleaning = state.stageSnapshots["2"] || { rows: state.rows, removedRows: state.removedRows };
  const logEntries = state.stageSnapshots["3"]?.logEntries || state.logEntries;
  const peer = state.stageSnapshots["4"]?.peer || state.peer;
  const reflections = state.stageSnapshots["5"]?.reflections || state.reflections;
  const comparison = state.stageSnapshots["6"] || { model: state.model, rows: state.rows, removedRows: state.removedRows };
  return `<div class="final-review">
    <section><h3>Assigned file</h3><div class="dataset-identity"><strong>Dataset ${escapeHtml(state.dataset.id)}</strong><span>${escapeHtml(state.dataset.fileName)}</span></div></section>
    <section><h3>Cleaned dataset</h3>${renderReadOnlyDataset(cleaning.rows, cleaning.removedRows)}</section>
    <section><h3>Manual change log</h3>${renderReadOnlyLog(logEntries)}</section>
    <section><h3>Peer review</h3>${renderPeerSummary(peer)}</section>
    <section><h3>Individual reflections</h3>${renderReflectionSummary(reflections)}</section>
    <section><h3>Two-location comparison</h3><div class="model-preview">${renderModelPreview(comparison.model, comparison.rows, comparison.removedRows)}</div></section>
  </div>`;
}

function renderImportPreview() {
  if (!state.dataset.id || !state.originalRows.length) {
    return `<div class="import-empty">
      <strong>No assessment file selected</strong>
      <p>Choose the CSV file your teacher gave you. Its dataset letter and 12 records will appear here.</p>
    </div>`;
  }
  return `<div class="import-success">
    <div class="dataset-identity"><strong>Dataset ${escapeHtml(state.dataset.id)} is ready</strong><span>${escapeHtml(state.dataset.fileName)} · ${state.originalRows.length} records</span></div>
    ${renderDatasetContext()}
    <p>Check the dataset letter now. Do not begin cleaning until the next stage.</p>
    <div class="table-scroll"><table class="readonly-table">
      <thead><tr><th>Row</th><th>Collection Point</th><th>Items Collected</th><th>Material Category</th></tr></thead>
      <tbody>${state.originalRows.map((row, index) => `<tr>
        <td>${index + 1}</td><td>${displayValue(row.point)}</td><td>${displayValue(row.items)}</td><td>${displayValue(row.material)}</td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

function renderDatasetContext() {
  return `<div class="official-task"><strong>Dataset context:</strong> ${escapeHtml(datasetContext)}</div>`;
}

async function importAssignedCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".csv")) {
    event.target.value = "";
    return showStageMessage("Choose a CSV file ending in .csv.", "warning");
  }
  try {
    const parsed = parseAssignedCsv(await file.text());
    if (await datasetFingerprint(parsed) !== acceptedDatasetHashes[parsed.id]) {
      throw new Error(`Dataset ${parsed.id} does not match the original assigned file. Download a fresh copy from your teacher.`);
    }
    state.dataset = { id: parsed.id, fileName: file.name };
    state.originalRows = structuredClone(parsed.rows);
    state.rows = structuredClone(parsed.rows);
    originalRows = structuredClone(parsed.rows);
    state.removedRows = [];
    state.logEntries = [emptyLogEntry(), emptyLogEntry(), emptyLogEntry()];
    state.model = { title: "", material: "", firstRow: "", secondRow: "", conclusion: "" };
    persistState();
    document.querySelector("#importPreview").innerHTML = renderImportPreview();
    showStageMessage(`Dataset ${parsed.id} was imported successfully. Confirm the letter before continuing.`, "success");
  } catch (error) {
    event.target.value = "";
    showStageMessage(error.message || "This file could not be read as an assigned assessment CSV.", "warning");
  }
}

async function datasetFingerprint(parsed) {
  const bytes = new TextEncoder().encode(JSON.stringify({ id: parsed.id, rows: parsed.rows }));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function parseAssignedCsv(text) {
  const table = parseCsv(text.replace(/^\uFEFF/, ""));
  if (table.length < 2) throw new Error("The CSV file does not contain assessment records.");
  const headers = table[0].map(value => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ""));
  const requiredHeaders = ["datasetid", "collectionpoint", "itemscollected", "materialcategory"];
  if (headers.length !== requiredHeaders.length || !requiredHeaders.every((header, index) => headers[index] === header)) {
    throw new Error("This is not an assigned assessment file. Required columns: Dataset ID, Collection Point, Items Collected, Material Category.");
  }
  const dataRows = table.slice(1).filter(row => row.some(value => value.trim() !== ""));
  if (dataRows.length !== 12 || dataRows.some(row => row.length !== 4)) {
    throw new Error("An assigned assessment file must contain exactly 12 records and four columns.");
  }
  const ids = [...new Set(dataRows.map(row => row[0].trim().toUpperCase()))];
  if (ids.length !== 1 || !acceptedDatasetIds.has(ids[0])) {
    throw new Error("The Dataset ID must be A, B, C, or D and must match in every row.");
  }
  return {
    id: ids[0],
    rows: dataRows.map(row => ({ point: row[1].trim(), items: row[2].trim(), material: row[3].trim() }))
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(value);
      value = "";
    } else if (character === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }
  if (quoted) throw new Error("The CSV contains an unclosed quotation mark.");
  if (value.length || row.length) {
    row.push(value.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function bindStageEvents(stage) {
  if (stage === 1) {
    document.querySelector("#datasetFile").addEventListener("change", importAssignedCsv);
  }
  if (stage === 2) {
    stageHost.querySelector("#editableDataset").addEventListener("input", event => {
      const input = event.target.closest("[data-row]");
      if (!input) return;
      state.rows[Number(input.dataset.row)][input.dataset.key] = input.value;
      input.closest("tr").classList.toggle("changed", rowChanged(Number(input.dataset.row)));
      document.querySelector("#datasetDraftStatus").textContent = datasetDraftStatus();
      persistState();
    });
    stageHost.querySelector("#editableDataset").addEventListener("click", event => {
      const button = event.target.closest("[data-remove-row]");
      if (!button) return;
      const index = Number(button.dataset.removeRow);
      if (isRowRemoved(index)) {
        state.removedRows = state.removedRows.filter(rowIndex => rowIndex !== index);
      } else {
        state.removedRows.push(index);
      }
      persistState();
      renderStage();
    });
  }
  if (stage === 3) {
    stageHost.querySelector("#manualLogTable").addEventListener("input", event => {
      const input = event.target.closest("[data-log-index]");
      if (!input) return;
      state.logEntries[Number(input.dataset.logIndex)][input.dataset.logKey] = input.value;
      document.querySelector("#logDraftStatus").textContent = `${completeLogEntries().length} complete entr${completeLogEntries().length === 1 ? "y" : "ies"} · minimum 3.`;
      persistState();
    });
    stageHost.querySelector("#addLogEntryBtn").addEventListener("click", () => {
      if (state.logEntries.length >= 12) return;
      state.logEntries.push(emptyLogEntry());
      persistState();
      renderStage();
    });
    stageHost.querySelectorAll("[data-remove-log]").forEach(button => button.addEventListener("click", () => {
      if (state.logEntries.length <= 3) return;
      state.logEntries.splice(Number(button.dataset.removeLog), 1);
      persistState();
      renderStage();
    }));
  }
  if (stage === 4) {
    ["partnerName", "correctionExplained", "feedbackReceived", "correctionChecked"].forEach(key => {
      document.querySelector(`#${key}`).addEventListener("input", event => {
        state.peer[key] = event.target.value;
        persistState();
      });
    });
  }
  if (stage === 5) {
    stageHost.querySelectorAll("[data-reflection]").forEach(field => field.addEventListener("input", event => {
      state.reflections[event.target.dataset.reflection] = event.target.value;
      persistState();
    }));
  }
  if (stage === 6) {
    document.querySelector("#modelMaterial").addEventListener("change", event => {
      state.model.material = event.target.value;
      state.model.firstRow = "";
      state.model.secondRow = "";
      persistState();
      renderStage();
    });
    const bindings = { modelTitleInput: "title", modelFirstRow: "firstRow", modelSecondRow: "secondRow", modelConclusion: "conclusion" };
    Object.entries(bindings).forEach(([id, key]) => {
      const field = document.querySelector(`#${id}`);
      field.addEventListener(field.tagName === "SELECT" ? "change" : "input", event => {
        state.model[key] = event.target.value;
        persistState();
        document.querySelector("#modelPreview").innerHTML = renderModelPreview();
      });
    });
  }
  if (stage === 7) document.querySelector("#downloadPdfBtn").addEventListener("click", openStudentDialog);
}

function renderEditableLogRows() {
  return state.logEntries.map((entry, index) => `
    <tr>
      <td><input type="number" min="1" max="${state.rows.length}" data-log-index="${index}" data-log-key="row" value="${escapeHtml(entry.row)}" aria-label="Change log row number entry ${index + 1}"></td>
      <td><input type="text" maxlength="100" data-log-index="${index}" data-log-key="original" value="${escapeHtml(entry.original)}" aria-label="Original value entry ${index + 1}"></td>
      <td><input type="text" maxlength="100" data-log-index="${index}" data-log-key="problem" value="${escapeHtml(entry.problem)}" aria-label="Problem found entry ${index + 1}"></td>
      <td><input type="text" maxlength="100" data-log-index="${index}" data-log-key="cleaned" value="${escapeHtml(entry.cleaned)}" aria-label="Cleaned value entry ${index + 1}"></td>
      <td><textarea rows="2" maxlength="240" data-log-index="${index}" data-log-key="reason" aria-label="Reason entry ${index + 1}">${escapeHtml(entry.reason)}</textarea></td>
      <td><button type="button" class="remove-log-entry" data-remove-log="${index}"${state.logEntries.length <= 3 ? " disabled" : ""}>Remove</button></td>
    </tr>`).join("");
}

function renderDatasetComparison() {
  const renderRows = (rows, locked = false) => rows.map((row, index) => {
    if (locked && isRowRemoved(index)) {
      return `<tr class="comparison-removed"><td>${index + 1}</td><td colspan="3"><strong>Removed as a duplicate record</strong></td></tr>`;
    }
    return `<tr class="${locked && rowChanged(index) ? "comparison-change" : ""}">
        <td>${index + 1}</td>
        <td>${displayValue(row.point)}</td>
        <td>${displayValue(row.items)}</td>
        <td>${displayValue(row.material)}</td>
      </tr>`;
  }).join("");
  return `<div class="comparison-tables">
    <section class="comparison-card" aria-labelledby="originalDataHeading">
      <h3 id="originalDataHeading">Original data</h3>
      <p>What the dataset looked like before you made any changes.</p>
      <div class="table-scroll"><table class="comparison-table">
        <thead><tr><th>Row</th><th>Collection Point</th><th>Items Collected</th><th>Material Category</th></tr></thead>
        <tbody>${renderRows(originalRows)}</tbody>
      </table></div>
    </section>
    <section class="comparison-card comparison-card-locked" aria-labelledby="lockedDataHeading">
      <h3 id="lockedDataHeading">Your working data</h3>
      <p>Your current version. Green rows are rows you changed.</p>
      <div class="table-scroll"><table class="comparison-table">
        <thead><tr><th>Row</th><th>Collection Point</th><th>Items Collected</th><th>Material Category</th></tr></thead>
        <tbody>${renderRows(state.rows, true)}</tbody>
      </table></div>
    </section>
  </div>`;
}

function renderReadOnlyDataset(rows = state.rows, removedRows = state.removedRows) {
  const activeRows = activeDatasetRowsFor(rows, removedRows);
  return `<div class="table-scroll"><table class="readonly-table">
    <thead><tr><th>Row</th><th>Collection Point</th><th>Items Collected</th><th>Material Category</th></tr></thead>
    <tbody>${activeRows.length
      ? activeRows.map(item => `<tr><td>${item.index + 1}</td><td>${displayValue(item.row.point)}</td><td>${displayValue(item.row.items)}</td><td>${displayValue(item.row.material)}</td></tr>`).join("")
      : `<tr class="empty-row"><td colspan="4">No active dataset rows remain.</td></tr>`}</tbody>
  </table></div>
  ${removedRows.length ? `<p class="removed-summary"><strong>Removed duplicate row${removedRows.length === 1 ? "" : "s"}:</strong> ${removedRows.map(index => index + 1).join(", ")}</p>` : ""}`;
}

function renderReadOnlyLog(logEntries = state.logEntries) {
  const entries = attemptedLogEntries(logEntries);
  return `<div class="table-scroll"><table class="readonly-table log-review-table">
    <thead><tr><th>Row</th><th>Original</th><th>Problem</th><th>Cleaned</th><th>Reason</th></tr></thead>
    <tbody>${entries.length
      ? entries.map(entry => `<tr><td>${escapeHtml(entry.row || "(blank)")}</td><td>${escapeHtml(entry.original || "(blank)")}</td><td>${escapeHtml(entry.problem || "(blank)")}</td><td>${escapeHtml(entry.cleaned || "(blank)")}</td><td>${escapeHtml(entry.reason || "(blank)")}</td></tr>`).join("")
      : `<tr class="empty-row"><td colspan="5">No change-log evidence was saved.</td></tr>`}</tbody>
  </table></div>`;
}

function renderPeerSummary(peer = state.peer) {
  return `<dl class="evidence-list">
    <div><dt>Partner</dt><dd>${escapeHtml(peer.partnerName)}</dd></div>
    <div><dt>Correction explained</dt><dd>${escapeHtml(peer.correctionExplained)}</dd></div>
    <div><dt>Feedback received</dt><dd>${escapeHtml(peer.feedbackReceived)}</dd></div>
    <div><dt>Correction checked</dt><dd>${escapeHtml(peer.correctionChecked)}</dd></div>
  </dl>`;
}

function renderReflectionSummary(reflections = state.reflections) {
  return `<dl class="evidence-list">${reflectionPrompts.map(item => `<div><dt>${item.label}</dt><dd>${escapeHtml(reflections[item.key])}</dd></div>`).join("")}</dl>`;
}

function numericItemValue(row) {
  const match = row.items.replaceAll(",", "").trim().match(/^-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) && value >= 0 && value <= 100 ? value : null;
}

function materialKey(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function materialLabel(value) {
  const labels = {
    paper: "Paper",
    plastic: "Plastic",
    glass: "Glass",
    metal: "Metal",
    cardboard: "Cardboard",
    organic: "Organic",
    ewaste: "E-waste"
  };
  return labels[materialKey(value)] || value.trim() || "Not provided";
}

function comparisonRows() {
  return comparisonRowsFor(state.rows, state.removedRows);
}

function comparisonRowsFor(rows, removedRows) {
  const seen = new Set();
  return activeDatasetRowsFor(rows, removedRows).map(item => ({
    ...item,
    value: numericItemValue(item.row),
    material: materialKey(item.row.material),
    materialLabel: materialLabel(item.row.material)
  })).filter(item => {
    if (item.value === null || !item.material) return false;
    const recordKey = `${item.row.point.trim().toLowerCase()}|${item.value}|${item.material}`;
    if (seen.has(recordKey)) return false;
    seen.add(recordKey);
    return true;
  });
}

function materialComparisonGroups() {
  const groups = new Map();
  comparisonRows().forEach(item => {
    if (!groups.has(item.material)) groups.set(item.material, { key: item.material, label: item.materialLabel, rows: [] });
    groups.get(item.material).rows.push(item);
  });
  return [...groups.values()];
}

function comparableMaterialGroups() {
  return materialComparisonGroups().filter(group => group.rows.length >= 2);
}

function renderComparisonAvailability() {
  const comparable = comparableMaterialGroups();
  const reliableCounts = new Map(materialComparisonGroups().map(group => [group.key, group.rows.length]));
  const allMaterials = [];
  activeDatasetRows().forEach(item => {
    const key = materialKey(item.row.material);
    if (key && !allMaterials.some(material => material.key === key)) {
      allMaterials.push({ key, label: materialLabel(item.row.material) });
    }
  });
  const unavailable = allMaterials.filter(material => (reliableCounts.get(material.key) || 0) < 2);
  return `<div class="comparison-availability">
    <div><strong>Available for a fair comparison</strong><span>${comparable.length
      ? comparable.map(group => `${escapeHtml(group.label)} (${group.rows.length} reliable locations)`).join(", ")
      : "No material currently has two reliable locations."}</span></div>
    ${unavailable.length ? `<div><strong>Not enough reliable data</strong><span>${unavailable.map(material => escapeHtml(material.label)).join(", ")}</span></div>` : ""}
    <p>Removed duplicates, missing values, negative quantities, and implausibly large quantities are not used in the comparison.</p>
  </div>`;
}

function renderComparableMaterialOptions(selectedValue) {
  return comparableMaterialGroups().map(group => `<option value="${group.key}"${group.key === selectedValue ? " selected" : ""}>${escapeHtml(group.label)} — ${group.rows.length} reliable locations</option>`).join("");
}

function renderComparisonOptions(selectedValue, selectedMaterial) {
  const group = comparableMaterialGroups().find(item => item.key === selectedMaterial);
  if (!group) return "";
  return group.rows.map(item => {
    const value = String(item.index);
    const selected = value === selectedValue ? " selected" : "";
    return `<option value="${value}"${selected}>Row ${item.index + 1}: ${escapeHtml(item.row.point)} — ${item.value} items</option>`;
  }).join("");
}

function selectedComparisonRow(value) {
  return selectedComparisonRowFor(value, state.rows, state.removedRows);
}

function selectedComparisonRowFor(value, rows, removedRows) {
  if (!/^\d+$/.test(value)) return null;
  const index = Number(value);
  return comparisonRowsFor(rows, removedRows).find(item => item.index === index) || null;
}

function renderModelPreview(model = state.model, rows = state.rows, removedRows = state.removedRows) {
  const first = selectedComparisonRowFor(model.firstRow, rows, removedRows);
  const second = selectedComparisonRowFor(model.secondRow, rows, removedRows);
  if (!model.title || !model.material || !first || !second) {
    return "<strong>Two-bar comparison preview</strong><p>Add a title, choose a comparable material, and select two different collection points.</p>";
  }
  if (first.index === second.index || first.material !== model.material || second.material !== model.material) {
    return `<strong>${escapeHtml(model.title)}</strong><p class="preview-warning">Choose two different collection points from the selected material.</p>`;
  }
  const maximum = Math.max(first.value, second.value);
  const firstWidth = maximum === 0 ? 0 : (first.value / maximum) * 100;
  const secondWidth = maximum === 0 ? 0 : (second.value / maximum) * 100;
  return `<h3>${escapeHtml(model.title)}</h3>
    <div class="comparison-bar-chart" role="img" aria-label="${escapeHtml(first.row.point)}: ${first.value} items. ${escapeHtml(second.row.point)}: ${second.value} items.">
      <div class="comparison-bar-row">
        <div class="comparison-bar-label"><strong>${escapeHtml(first.row.point)}</strong><span>${first.value} items</span></div>
        <div class="comparison-bar-track"><span class="comparison-bar comparison-bar-first" style="width:${firstWidth}%"></span></div>
      </div>
      <div class="comparison-bar-row">
        <div class="comparison-bar-label"><strong>${escapeHtml(second.row.point)}</strong><span>${second.value} items</span></div>
        <div class="comparison-bar-track"><span class="comparison-bar comparison-bar-second" style="width:${secondWidth}%"></span></div>
      </div>
    </div>
    <div class="comparison-question"><strong>What does the comparison show?</strong><p>${model.conclusion ? escapeHtml(model.conclusion) : "Write which location collected more and how many more items it collected."}</p></div>`;
}

function validateStage(stage) {
  if (stage === 1 && (!state.dataset.id || state.originalRows.length !== 12 || state.rows.length !== 12)) {
    return "Upload one of the assigned CSV files and confirm that its dataset letter is correct.";
  }
  if (stage === 3 && completeLogEntries().length < 3) return "Complete at least three manual change-log entries. Every entry needs a row, original value, problem, cleaned value, and clear reason.";
  if (stage === 4) {
    if (state.peer.partnerName.trim().length < 3) return "Enter your peer-review partner's full name.";
    const incomplete = ["correctionExplained", "feedbackReceived", "correctionChecked"].some(key => state.peer[key].trim().length < 20);
    if (incomplete) return "Complete all three peer-review responses with specific information.";
  }
  if (stage === 5) {
    const incomplete = reflectionPrompts.filter(item => state.reflections[item.key].trim().length < 20);
    if (incomplete.length) return `Complete all five reflections. Still too short: ${incomplete.map(item => item.label).join(", ")}.`;
  }
  if (stage === 6) {
    const model = state.model;
    const first = selectedComparisonRow(model.firstRow);
    const second = selectedComparisonRow(model.secondRow);
    const complete = model.title.trim().length >= 3 && model.material && first && second && first.index !== second.index
      && first.material === model.material && second.material === model.material
      && model.conclusion.trim().length >= 20;
    if (!complete) return "Add a clear title, choose a material with two reliable values, select two different locations from that material, and write a complete comparison sentence.";
  }
  return "";
}

function createStageSnapshot(stage) {
  const snapshot = { stage, finishedAt: new Date().toISOString() };
  if (stage === 1) Object.assign(snapshot, { dataset: structuredClone(state.dataset), originalRows: structuredClone(state.originalRows) });
  if (stage === 2) Object.assign(snapshot, { rows: structuredClone(state.rows), removedRows: [...state.removedRows] });
  if (stage === 3) snapshot.logEntries = structuredClone(state.logEntries);
  if (stage === 4) snapshot.peer = structuredClone(state.peer);
  if (stage === 5) snapshot.reflections = structuredClone(state.reflections);
  if (stage === 6) Object.assign(snapshot, { model: structuredClone(state.model), rows: structuredClone(state.rows), removedRows: [...state.removedRows] });
  return snapshot;
}

function openLockDialog() {
  const error = validateStage(state.currentStage);
  if (state.currentStage === 1 && error) return showStageMessage(error, "warning");
  stageMessage.textContent = "";
  stageMessage.className = "result";
  const firstFinish = !state.stageSnapshots[String(state.currentStage)];
  document.querySelector("#lockDialogTitle").textContent = `${firstFinish ? "Finish" : "Save changes to"} Stage ${state.currentStage}?`;
  document.querySelector("#lockDialogText").textContent = firstFinish
    ? `You are about to mark “${stageNames[state.currentStage - 1]}” as finished. This version will be used for scoring.`
    : "This version will replace the earlier saved version used for scoring.";
  document.querySelector("#lockDialogWarning").textContent = error
    ? `${error} You may still continue if you consider this stage finished.`
    : "This stage appears complete. You can return later if a correction is needed for downstream work.";
  document.querySelector("#confirmLockBtn").textContent = error ? "Continue with incomplete stage" : "Save and continue";
  lockDialog.showModal();
}

function confirmStageLock() {
  const stage = state.currentStage;
  state.stageSnapshots[String(stage)] = createStageSnapshot(stage);
  if (!state.lockedAt[String(stage)]) state.lockedAt[String(stage)] = new Date().toISOString();
  state.currentStage = Math.min(7, stage + 1);
  persistState();
  lockDialog.close();
  window.history.replaceState({ assessment: true, stage: state.currentStage }, "", `${window.location.pathname}${window.location.search}#assessment`);
  renderStage();
  document.querySelector("#stageTitle").focus({ preventScroll: true });
  assessmentSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function changedValueCount() {
  let count = 0;
  state.rows.forEach((row, index) => ["point", "items", "material"].forEach(key => {
    if (!isRowRemoved(index) && row[key].trim() !== originalRows[index][key].trim()) count += 1;
  }));
  return count;
}

function isRowRemoved(index) {
  return state.removedRows.includes(index);
}

function activeDatasetRows() {
  return activeDatasetRowsFor(state.rows, state.removedRows);
}

function activeDatasetRowsFor(rows, removedRows) {
  return rows.map((row, index) => ({ row, index })).filter(item => !removedRows.includes(item.index));
}

function datasetDraftStatus() {
  const edited = changedValueCount();
  const removed = state.removedRows.length;
  return `${edited} value${edited === 1 ? "" : "s"} edited · ${removed} duplicate row${removed === 1 ? "" : "s"} removed. Review your work carefully before deciding to continue.`;
}

function rowChanged(index) {
  return isRowRemoved(index) || ["point", "items", "material"].some(key => state.rows[index][key] !== originalRows[index][key]);
}

function completeLogEntries() {
  return completeLogEntriesFrom(state.logEntries, state.rows.length);
}

function completeLogEntriesFrom(entries, rowCount) {
  return entries.filter(entry => {
    const rowNumber = Number(entry.row);
    return Number.isInteger(rowNumber) && rowNumber >= 1 && rowNumber <= rowCount
      && ["original", "problem", "cleaned"].every(key => entry[key].trim().length >= 1)
      && entry.reason.trim().length >= 8;
  });
}

function attemptedLogEntries(entries) {
  return entries.filter(entry => ["row", "original", "problem", "cleaned", "reason"].some(key => entry[key].trim().length));
}

function showStageMessage(message, type) {
  stageMessage.textContent = message;
  stageMessage.className = `result ${type}`;
}

function openStudentDialog() {
  document.querySelector("#studentName").value = state.student.name;
  document.querySelector("#className").value = state.student.className;
  document.querySelector("#activityDate").value = state.student.date || getLocalDateValue();
  studentDialog.showModal();
}

function submitStudentDetails(event) {
  event.preventDefault();
  state.student = {
    name: document.querySelector("#studentName").value.trim(),
    className: document.querySelector("#className").value.trim(),
    date: document.querySelector("#activityDate").value
  };
  persistState();
  studentDialog.close();
  downloadPdf();
}

function downloadPdf() {
  const allStagesFinished = [1, 2, 3, 4, 5, 6].every(stage => state.lockedAt[String(stage)]);
  if (state.currentStage !== 7 || !allStagesFinished) return showStageMessage("Mark every evidence stage finished before downloading.", "warning");
  if (!window.jspdf?.jsPDF) return showStageMessage("The PDF tool could not load. Check your connection and try again.", "warning");

  const cleaningEvidence = state.stageSnapshots["2"] || { rows: state.rows, removedRows: state.removedRows };
  const logEvidence = state.stageSnapshots["3"]?.logEntries || state.logEntries;
  const peerEvidence = state.stageSnapshots["4"]?.peer || state.peer;
  const reflectionEvidence = state.stageSnapshots["5"]?.reflections || state.reflections;
  const comparisonEvidence = state.stageSnapshots["6"] || { model: state.model, rows: state.rows, removedRows: state.removedRows };
  const comparisonModel = comparisonEvidence.model || state.model;
  const comparisonDataRows = comparisonEvidence.rows || state.rows;
  const comparisonRemovedRows = comparisonEvidence.removedRows || state.removedRows;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);
  const orange = [168, 90, 25];
  const dark = [29, 36, 51];
  const muted = [102, 112, 133];

  function ensureSpace(y, needed = 18) {
    if (y + needed <= pageHeight - 16) return y;
    doc.addPage();
    return 18;
  }
  function sectionTitle(title, y) {
    y = ensureSpace(y, 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...orange);
    doc.text(title, margin, y);
    doc.setDrawColor(216, 222, 234);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    return y + 8;
  }
  function paragraph(text, y, options = {}) {
    const lines = doc.splitTextToSize(text || "Not completed", contentWidth);
    y = ensureSpace(y, (lines.length * 5) + 3);
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(options.size || 10);
    doc.setTextColor(...(options.color || dark));
    doc.text(lines, margin, y);
    return y + (lines.length * 5) + 3;
  }

  doc.setFillColor(...orange);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Appreciation Grade #1", margin, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Data Steward Challenge · Latest Saved Evidence", margin, 23);
  doc.text(formatActivityDate(state.student.date), pageWidth - margin, 23, { align: "right" });

  let y = sectionTitle("Student Details", 43);
  doc.autoTable({
    startY: y,
    head: [["Student", "Class", "Dataset", "Activity Date", "Peer-review Partner"]],
    body: [[state.student.name, state.student.className, state.dataset.id, formatActivityDate(state.student.date), peerEvidence.partnerName]],
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.8, textColor: dark },
    headStyles: { fillColor: orange, textColor: 255, fontStyle: "bold" }
  });

  y = sectionTitle("Dataset Context", doc.lastAutoTable.finalY + 11);
  y = paragraph(datasetContext, y);

  y = sectionTitle("Cleaned Dataset · Latest Saved Version", y + 3);
  doc.autoTable({
    startY: y,
    head: [["Row", "Collection Point", "Items Collected", "Material Category"]],
    body: activeDatasetRowsFor(cleaningEvidence.rows, cleaningEvidence.removedRows).map(item => [String(item.index + 1), item.row.point || "(blank)", item.row.items || "(blank)", item.row.material || "(blank)"]),
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2.2, textColor: dark },
    headStyles: { fillColor: orange, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    columnStyles: { 0: { cellWidth: 12, halign: "center" } }
  });

  let datasetEndY = doc.lastAutoTable.finalY;
  if (cleaningEvidence.removedRows.length) {
    datasetEndY = paragraph(`Removed duplicate row${cleaningEvidence.removedRows.length === 1 ? "" : "s"}: ${cleaningEvidence.removedRows.map(index => index + 1).join(", ")}`, datasetEndY + 6, { bold: true });
  }
  y = sectionTitle("Manual Change Log · Latest Saved Version", datasetEndY + 5);
  doc.autoTable({
    startY: y,
    head: [["Row", "Original Value", "Problem Found", "Cleaned Value", "Reason"]],
    body: attemptedLogEntries(logEvidence).map(entry => [entry.row || "(blank)", entry.original || "(blank)", entry.problem || "(blank)", entry.cleaned || "(blank)", entry.reason || "(blank)"]),
    margin: { left: margin, right: margin },
    theme: "grid",
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.1, textColor: dark, overflow: "linebreak" },
    headStyles: { fillColor: orange, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    columnStyles: { 0: { cellWidth: 11, halign: "center" } }
  });

  y = ensureSpace(doc.lastAutoTable.finalY + 11, 55);
  y = sectionTitle("Peer Review · Latest Saved Version", y);
  y = paragraph(`Partner: ${peerEvidence.partnerName}`, y, { bold: true });
  y = paragraph(`Correction explained: ${peerEvidence.correctionExplained}`, y);
  y = paragraph(`Feedback received: ${peerEvidence.feedbackReceived}`, y);
  y = paragraph(`Correction checked: ${peerEvidence.correctionChecked}`, y);

  y = sectionTitle("Individual Reflections · Latest Saved Version", y + 2);
  reflectionPrompts.forEach(item => {
    y = paragraph(`${item.label}: ${item.prompt}`, y, { bold: true });
    y = paragraph(reflectionEvidence[item.key], y);
  });

  y = ensureSpace(y + 2, 60);
  y = sectionTitle("Two-Location Comparison · Latest Saved Version", y);
  y = paragraph(comparisonModel.title, y, { bold: true, size: 12 });
  const pdfFirst = selectedComparisonRowFor(comparisonModel.firstRow, comparisonDataRows, comparisonRemovedRows);
  const pdfSecond = selectedComparisonRowFor(comparisonModel.secondRow, comparisonDataRows, comparisonRemovedRows);
  if (!pdfFirst || !pdfSecond) {
    paragraph("The two-location comparison was not completed.", y);
  } else {
    const visualY = ensureSpace(y, 40);
    const pdfMaximum = Math.max(pdfFirst.value, pdfSecond.value);
    const labelWidth = 50;
    const barWidth = contentWidth - labelWidth;
    [
      { item: pdfFirst, color: [47, 122, 88] },
      { item: pdfSecond, color: [73, 104, 184] }
    ].forEach((entry, index) => {
      const rowY = visualY + (index * 14);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...dark);
      doc.text(`${entry.item.row.point} (${entry.item.value} items)`, margin, rowY + 5);
      doc.setFillColor(226, 231, 238);
      doc.roundedRect(margin + labelWidth, rowY, barWidth, 8, 2, 2, "F");
      const proportionalWidth = pdfMaximum === 0 ? 0 : (entry.item.value / pdfMaximum) * barWidth;
      if (proportionalWidth > 0) {
        doc.setFillColor(...entry.color);
        doc.roundedRect(margin + labelWidth, rowY, proportionalWidth, 8, 2, 2, "F");
      }
    });
    y = visualY + 33;
    paragraph(`Comparison: ${comparisonModel.conclusion}`, y);
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(216, 222, 234);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("Data Steward Challenge · Latest Saved Scoring Record", margin, pageHeight - 7);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  }

  const safeName = state.student.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  doc.save(`appreciation-grade-1-dataset-${state.dataset.id.toLowerCase()}-${safeName || "student"}.pdf`);
  showStageMessage("Your individual evidence report was downloaded. Upload it to Google Classroom.", "success");
}

function formatRow(row) {
  return `${displayValue(row.point)} · ${displayValue(row.items)} · ${displayValue(row.material)}`;
}

function displayValue(value) {
  return escapeHtml(value.trim() || "(blank)");
}

function getLocalDateValue() {
  const now = new Date();
  const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  return localDate.toISOString().slice(0, 10);
}

function formatActivityDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value || "Not provided";
  return new Date(year, month - 1, day).toLocaleDateString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

restoreState();
if (state.introComplete) {
  window.history.replaceState({ assessment: true, stage: state.currentStage }, "", `${window.location.pathname}${window.location.search}#assessment`);
}
renderView();

document.querySelector("#beginBtn").addEventListener("click", beginAssessment);
document.querySelector("#lockStageBtn").addEventListener("click", openLockDialog);
document.querySelector("#closeLockDialogBtn").addEventListener("click", () => lockDialog.close());
document.querySelector("#cancelLockBtn").addEventListener("click", () => lockDialog.close());
document.querySelector("#confirmLockBtn").addEventListener("click", confirmStageLock);
document.querySelector("#stageNav").addEventListener("click", event => {
  const button = event.target.closest("[data-stage-nav]");
  if (button) navigateToStage(Number(button.dataset.stageNav));
});
document.addEventListener("click", event => {
  if (event.target.closest("[data-open-support]")) supportDialog.showModal();
  if (event.target.closest("[data-close-support]")) supportDialog.close();
});
document.querySelector("#closeStudentDialogBtn").addEventListener("click", () => studentDialog.close());
document.querySelector("#cancelStudentDialogBtn").addEventListener("click", () => studentDialog.close());
document.querySelector("#studentForm").addEventListener("submit", submitStudentDetails);

window.addEventListener("hashchange", () => {
  if (state.introComplete && window.location.hash !== "#assessment") {
    window.history.replaceState({ assessment: true, stage: state.currentStage }, "", `${window.location.pathname}${window.location.search}#assessment`);
  }
});
