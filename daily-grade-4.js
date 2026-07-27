const acceptedDatasetIds = new Set(["A", "B", "C", "D"]);
const acceptedDatasetHashes = {
  A: "3b8a48d4b863d8a0c9f7650a376c3c55d41d3b5cba2fcca3d1258bccbef1dd03",
  B: "08c3dfeae01b4eb4d14a714d1cf6955f2c72b74d8d4e11317254225fc9016598",
  C: "c525a1c9287a5d9f05b4571e074650d826e5a8e6131f4b0d8772ab81ed4d9fc4",
  D: "1b5544edb69ac5cadf62c1c05f5ea76e8d05049db7c884808894acc13ce88f73"
};
const storageKey = "dailyGrade4ChartInvestigationV1";
const stageNames = [
  "Upload your assigned CSV file",
  "Create one chart",
  "Write the pattern and comparison",
  "Analyze the outlier and possible correlation",
  "Review and submit your evidence"
];

let state = createInitialState();

const briefingSection = document.querySelector("#briefingSection");
const assessmentSection = document.querySelector("#assessmentSection");
const stageHost = document.querySelector("#stageHost");
const stageMessage = document.querySelector("#stageMessage");
const stageActions = document.querySelector("#stageActions");
const lockDialog = document.querySelector("#lockDialog");
const studentDialog = document.querySelector("#studentDialog");

function createInitialState() {
  return {
    version: 1,
    introComplete: false,
    currentStage: 1,
    lockedAt: {},
    dataset: {
      id: "",
      fileName: "",
      headers: { record: "", x: "", y: "" },
      rows: []
    },
    chart: { type: "", title: "", xField: "", yField: "" },
    analysis: {
      patternDirection: "",
      patternSentence: "",
      compareFirst: "",
      compareSecond: "",
      comparisonSentence: "",
      outlierRecord: "",
      outlierSentence: "",
      correlation: "",
      limitation: "",
      conclusion: ""
    },
    student: { name: "", className: "", date: localDateValue() }
  };
}

function persistState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    showMessage("Your work could not be saved. Keep this page open until you finish.", "warning");
  }
}

function restoreState() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(storageKey));
  } catch {
    try { localStorage.removeItem(storageKey); } catch {}
    return;
  }
  if (!saved || saved.version !== 1 || typeof saved !== "object") return;
  if (!Number.isInteger(saved.currentStage) || saved.currentStage < 1 || saved.currentStage > 5) return;
  const rows = saved.dataset?.rows;
  const headers = saved.dataset?.headers;
  const validRows = Array.isArray(rows) && rows.every(row =>
    row && typeof row.record === "string" && Number.isFinite(row.x) && Number.isFinite(row.y)
  );
  const validHeaders = headers && ["record", "x", "y"].every(key => typeof headers[key] === "string");
  if (saved.currentStage > 1 && (!acceptedDatasetIds.has(saved.dataset?.id) || !validRows || rows.length !== 9 || !validHeaders)) return;

  state = createInitialState();
  state.introComplete = Boolean(saved.introComplete);
  state.currentStage = saved.currentStage;
  state.lockedAt = saved.lockedAt && typeof saved.lockedAt === "object" ? saved.lockedAt : {};
  if (acceptedDatasetIds.has(saved.dataset?.id) && validRows && validHeaders) {
    state.dataset = {
      id: saved.dataset.id,
      fileName: stringOrEmpty(saved.dataset.fileName),
      headers: {
        record: stringOrEmpty(headers.record),
        x: stringOrEmpty(headers.x),
        y: stringOrEmpty(headers.y)
      },
      rows: rows.map(row => ({ record: row.record, x: Number(row.x), y: Number(row.y) }))
    };
  }
  state.chart = {
    type: stringOrEmpty(saved.chart?.type),
    title: stringOrEmpty(saved.chart?.title),
    xField: stringOrEmpty(saved.chart?.xField),
    yField: stringOrEmpty(saved.chart?.yField)
  };
  state.analysis = Object.fromEntries(
    Object.keys(state.analysis).map(key => [key, stringOrEmpty(saved.analysis?.[key])])
  );
  state.student = {
    name: stringOrEmpty(saved.student?.name),
    className: stringOrEmpty(saved.student?.className),
    date: stringOrEmpty(saved.student?.date) || localDateValue()
  };
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
  document.querySelector("#stageCounter").textContent = `Stage ${stage} of 5`;
  document.querySelector("#stageTitle").textContent = stageNames[stage - 1];
  stageMessage.textContent = "";
  stageMessage.className = "result";
  stageHost.innerHTML = stageRenderers[stage]();
  stageActions.hidden = stage === 5;
  if (stage < 5) document.querySelector("#lockStageBtn").textContent = stageButtonLabel(stage);
  bindStageEvents(stage);
  renderVisibleChart(stage);
}

function stageButtonLabel(stage) {
  return {
    1: "Lock assigned dataset and continue",
    2: "Lock chart and continue",
    3: "Lock pattern and comparison",
    4: "Lock final analysis and continue"
  }[stage];
}

const stageRenderers = {
  1: () => `
    <p class="stage-intro">Choose the CSV file assigned to you in Google Classroom. The file is read only here and is not sent to a server.</p>
    <div class="upload-panel">
      <label class="upload-label" for="datasetFile">
        <strong>Choose your assigned CSV file</strong>
        <span class="hint">Use the downloaded Dataset A, B, C, or D file.</span>
        <input id="datasetFile" type="file" accept=".csv,text/csv" />
      </label>
      <div class="rules"><strong>Before locking:</strong> Check the dataset letter, filename, column names, and all nine records. After this stage is locked, the file cannot be replaced.</div>
    </div>
    <div id="importPreview" aria-live="polite">${renderImportPreview()}</div>`,

  2: () => `
    ${renderDatasetIdentity("Imported dataset is locked")}
    <p class="stage-intro">Use the two numerical columns to create one chart. Add a clear title and choose what appears on each axis.</p>
    ${renderDatasetTable()}
    <div class="chart-form">
      <label class="chart-title-field">Chart title
        <input id="chartTitle" type="text" maxlength="100" value="${escapeHtml(state.chart.title)}" placeholder="Describe the two variables being shown" />
      </label>
      <label>Chart type
        <select id="chartType">
          ${option("", "Choose a chart type", state.chart.type)}
          ${option("scatter", "Scatter plot", state.chart.type)}
          ${option("line", "Line chart", state.chart.type)}
          ${option("bar", "Bar chart", state.chart.type)}
        </select>
      </label>
      <label>Horizontal (X) axis
        <select id="chartXField">${axisOptions(state.chart.xField)}</select>
      </label>
      <label>Vertical (Y) axis
        <select id="chartYField">${axisOptions(state.chart.yField)}</select>
      </label>
    </div>
    <div class="rules"><strong>Chart check:</strong> The chart should help the reader see whether the two numerical variables may be related.</div>
    <section class="chart-preview-card" aria-labelledby="chartPreviewTitle">
      <h3 id="chartPreviewTitle">Chart preview</h3>
      <div class="chart-canvas-wrap"><canvas id="chartCanvas" width="900" height="500" aria-label="Chart preview"></canvas></div>
      <p id="chartSummary" class="hint"></p>
    </section>`,

  3: () => `
    ${renderDatasetIdentity("Dataset and chart are locked")}
    <p class="stage-intro">Use your locked chart and exact dataset values. Both sentences should be complete and supported by evidence.</p>
    ${renderLockedChart()}
    <div class="analysis-grid">
      <section class="analysis-card">
        <h3>1. Pattern</h3>
        <p>Describe the overall direction or trend.</p>
        <fieldset class="radio-list">
          <legend class="hint">Overall direction</legend>
          ${radio("patternDirection", "positive", "The values generally rise together", state.analysis.patternDirection)}
          ${radio("patternDirection", "negative", "One value generally falls as the other rises", state.analysis.patternDirection)}
          ${radio("patternDirection", "unclear", "There is no clear overall direction", state.analysis.patternDirection)}
        </fieldset>
        <label>Pattern sentence
          <textarea id="patternSentence" rows="5" maxlength="600" placeholder="Use at least two numbers from the dataset...">${escapeHtml(state.analysis.patternSentence)}</textarea>
        </label>
        <div class="evidence-tip">Include at least two numerical values so the sentence is supported by the chart.</div>
      </section>
      <section class="analysis-card">
        <h3>2. Comparison</h3>
        <p>Compare two different records using exact values.</p>
        <div class="record-grid">
          <label>First record<select id="compareFirst">${recordOptions(state.analysis.compareFirst)}</select></label>
          <label>Second record<select id="compareSecond">${recordOptions(state.analysis.compareSecond)}</select></label>
        </div>
        <div id="comparisonEvidence" class="evidence-tip">${comparisonEvidence()}</div>
        <label>Comparison sentence
          <textarea id="comparisonSentence" rows="5" maxlength="600" placeholder="Name both records and compare their values...">${escapeHtml(state.analysis.comparisonSentence)}</textarea>
        </label>
        <div class="evidence-tip">Include at least two numerical values from the selected records.</div>
      </section>
    </div>`,

  4: () => `
    ${renderDatasetIdentity("Earlier evidence is locked")}
    <p class="stage-intro">Identify the value that does not follow the overall pattern, then write a careful conclusion about possible correlation.</p>
    ${renderLockedChart()}
    <div class="analysis-grid">
      <section class="analysis-card">
        <h3>3. Outlier or limitation</h3>
        <p>Select the record that appears most unusual compared with the overall pattern.</p>
        <label>Possible outlier
          <select id="outlierRecord">${recordOptions(state.analysis.outlierRecord, "Choose a record")}</select>
        </label>
        <div id="outlierEvidence" class="evidence-tip">${outlierEvidence()}</div>
        <label>Outlier or limitation sentence
          <textarea id="outlierSentence" rows="5" maxlength="600" placeholder="Name the record, its two values, and why it is unusual...">${escapeHtml(state.analysis.outlierSentence)}</textarea>
        </label>
        <div class="evidence-tip">Include both numerical values from the selected record.</div>
      </section>
      <section class="analysis-card">
        <h3>4. Conclusion</h3>
        <p>Describe the possible correlation without claiming more than the chart proves.</p>
        <fieldset class="radio-list">
          <legend class="hint">Possible correlation</legend>
          ${radio("correlation", "positive", "Possible positive correlation", state.analysis.correlation)}
          ${radio("correlation", "negative", "Possible negative correlation", state.analysis.correlation)}
          ${radio("correlation", "unclear", "No clear correlation", state.analysis.correlation)}
        </fieldset>
        <fieldset class="radio-list">
          <legend class="hint">What is an important limitation?</legend>
          ${radio("limitation", "causation", "The chart cannot prove that one variable caused the other", state.analysis.limitation)}
          ${radio("limitation", "cause", "The chart proves exactly what caused the result", state.analysis.limitation)}
          ${radio("limitation", "future", "The chart guarantees the same result in the future", state.analysis.limitation)}
        </fieldset>
        <label>Conclusion sentence
          <textarea id="conclusionSentence" rows="5" maxlength="600" placeholder="State what the data suggest and what they cannot prove...">${escapeHtml(state.analysis.conclusion)}</textarea>
        </label>
      </section>
    </div>`,

  5: () => `
    <p class="stage-intro">All evidence stages are locked. Review the complete submission, then download the PDF and upload it to Google Classroom.</p>
    ${renderFinalSummary()}
    <div class="submission-note">
      <strong>Submit your work</strong>
      <ol>
        <li>Download the PDF using your full name and class.</li>
        <li>Open the PDF and check that the chart and four sentences appear.</li>
        <li>Upload that PDF to the Daily Grade #4 assignment in Google Classroom.</li>
      </ol>
    </div>
    <div class="lesson-actions"><button id="downloadPdfBtn" type="button">Download submission PDF</button><p>Your assessment remains saved in this browser.</p></div>`
};

function renderDatasetIdentity(status) {
  return `<div class="dataset-identity"><strong>Assigned Dataset ${escapeHtml(state.dataset.id)}</strong><span>${escapeHtml(status)} · ${escapeHtml(state.dataset.fileName)}</span></div>`;
}

function renderImportPreview() {
  if (!state.dataset.id || !state.dataset.rows.length) {
    return `<div class="rules"><strong>No file imported yet.</strong> The full table will appear here before you lock it.</div>`;
  }
  return `${renderDatasetIdentity("Ready to lock")}${renderDatasetTable()}`;
}

function renderDatasetTable() {
  const { headers, rows } = state.dataset;
  if (!rows.length) return "";
  return `<div class="table-scroll"><table>
    <thead><tr><th>${escapeHtml(headers.record)}</th><th>${escapeHtml(headers.x)}</th><th>${escapeHtml(headers.y)}</th></tr></thead>
    <tbody>${rows.map(row => `<tr><td>${escapeHtml(row.record)}</td><td>${row.x}</td><td>${row.y}</td></tr>`).join("")}</tbody>
  </table></div>`;
}

function renderLockedChart() {
  return `<section class="locked-evidence" aria-labelledby="lockedChartTitle">
    <h3 id="lockedChartTitle">Locked chart</h3>
    <div class="chart-canvas-wrap"><canvas id="lockedChartCanvas" class="summary-chart" width="900" height="500" aria-label="Locked chart"></canvas></div>
  </section>`;
}

function renderFinalSummary() {
  return `
    ${renderDatasetIdentity("All evidence is locked")}
    <section class="locked-evidence"><h3>Imported dataset</h3>${renderDatasetTable()}</section>
    ${renderLockedChart()}
    <section class="locked-evidence">
      <h3>Chart decisions</h3>
      <dl class="evidence-list">
        <div><dt>Chart type</dt><dd>${escapeHtml(chartTypeLabel(state.chart.type))}</dd></div>
        <div><dt>Title</dt><dd>${escapeHtml(state.chart.title)}</dd></div>
        <div><dt>Horizontal axis</dt><dd>${escapeHtml(fieldLabel(state.chart.xField))}</dd></div>
        <div><dt>Vertical axis</dt><dd>${escapeHtml(fieldLabel(state.chart.yField))}</dd></div>
      </dl>
    </section>
    <section class="locked-evidence">
      <h3>Four interpretation sentences</h3>
      <dl class="evidence-list">
        <div><dt>Pattern</dt><dd>${escapeHtml(state.analysis.patternSentence)}</dd></div>
        <div><dt>Comparison</dt><dd>${escapeHtml(state.analysis.comparisonSentence)}</dd></div>
        <div><dt>Outlier or limitation</dt><dd>${escapeHtml(state.analysis.outlierSentence)}</dd></div>
        <div><dt>Conclusion</dt><dd>${escapeHtml(state.analysis.conclusion)}</dd></div>
      </dl>
    </section>
    <section class="locked-evidence">
      <h3>Analysis selections</h3>
      <dl class="evidence-list">
        <div><dt>Pattern direction</dt><dd>${escapeHtml(directionLabel(state.analysis.patternDirection))}</dd></div>
        <div><dt>Compared records</dt><dd>${escapeHtml(`${state.analysis.compareFirst} and ${state.analysis.compareSecond}`)}</dd></div>
        <div><dt>Possible outlier</dt><dd>${escapeHtml(state.analysis.outlierRecord)}</dd></div>
        <div><dt>Possible correlation</dt><dd>${escapeHtml(directionLabel(state.analysis.correlation))}</dd></div>
        <div><dt>Selected limitation</dt><dd>${escapeHtml(limitationLabel(state.analysis.limitation))}</dd></div>
      </dl>
    </section>`;
}

function option(value, label, selected) {
  return `<option value="${escapeHtml(value)}"${value === selected ? " selected" : ""}>${escapeHtml(label)}</option>`;
}

function axisOptions(selected) {
  return [
    option("", "Choose a variable", selected),
    option("x", state.dataset.headers.x, selected),
    option("y", state.dataset.headers.y, selected)
  ].join("");
}

function recordOptions(selected, placeholder = "Choose a record") {
  return [
    option("", placeholder, selected),
    ...state.dataset.rows.map(row => option(row.record, recordOptionLabel(row), selected))
  ].join("");
}

function recordOptionLabel(row) {
  return `${row.record}: ${state.dataset.headers.x} ${row.x} · ${state.dataset.headers.y} ${row.y}`;
}

function radio(name, value, label, selected) {
  return `<label><input type="radio" name="${name}" value="${value}"${value === selected ? " checked" : ""}> <span>${escapeHtml(label)}</span></label>`;
}

function bindStageEvents(stage) {
  if (stage === 1) {
    document.querySelector("#datasetFile").addEventListener("change", importAssignedCsv);
  }
  if (stage === 2) {
    const bindings = {
      chartTitle: "title",
      chartType: "type",
      chartXField: "xField",
      chartYField: "yField"
    };
    Object.entries(bindings).forEach(([id, key]) => {
      const field = document.querySelector(`#${id}`);
      field.addEventListener(field.tagName === "INPUT" ? "input" : "change", event => {
        state.chart[key] = event.target.value;
        persistState();
        renderChartInto(document.querySelector("#chartCanvas"));
      });
    });
  }
  if (stage === 3) {
    document.querySelectorAll('input[name="patternDirection"]').forEach(input => input.addEventListener("change", event => {
      state.analysis.patternDirection = event.target.value;
      persistState();
    }));
    document.querySelector("#patternSentence").addEventListener("input", event => {
      state.analysis.patternSentence = event.target.value;
      persistState();
    });
    ["compareFirst", "compareSecond"].forEach(key => {
      document.querySelector(`#${key}`).addEventListener("change", event => {
        state.analysis[key] = event.target.value;
        document.querySelector("#comparisonEvidence").textContent = comparisonEvidence();
        persistState();
      });
    });
    document.querySelector("#comparisonSentence").addEventListener("input", event => {
      state.analysis.comparisonSentence = event.target.value;
      persistState();
    });
  }
  if (stage === 4) {
    document.querySelector("#outlierRecord").addEventListener("change", event => {
      state.analysis.outlierRecord = event.target.value;
      document.querySelector("#outlierEvidence").textContent = outlierEvidence();
      persistState();
    });
    document.querySelector("#outlierSentence").addEventListener("input", event => {
      state.analysis.outlierSentence = event.target.value;
      persistState();
    });
    ["correlation", "limitation"].forEach(key => {
      document.querySelectorAll(`input[name="${key}"]`).forEach(input => input.addEventListener("change", event => {
        state.analysis[key] = event.target.value;
        persistState();
      }));
    });
    document.querySelector("#conclusionSentence").addEventListener("input", event => {
      state.analysis.conclusion = event.target.value;
      persistState();
    });
  }
  if (stage === 5) {
    document.querySelector("#downloadPdfBtn").addEventListener("click", openStudentDialog);
  }
}

async function importAssignedCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (!file.name.toLowerCase().endsWith(".csv")) throw new Error("Choose the assigned CSV file downloaded from Google Classroom.");
    const parsed = parseAssignedCsv(await file.text());
    const fingerprint = await datasetFingerprint(parsed);
    if (fingerprint !== acceptedDatasetHashes[parsed.id]) {
      throw new Error(`Dataset ${parsed.id} does not match the original assigned file. Download a fresh copy from Google Classroom.`);
    }
    state.dataset = { ...parsed, fileName: file.name };
    state.chart = { type: "", title: "", xField: "", yField: "" };
    state.analysis = createInitialState().analysis;
    persistState();
    document.querySelector("#importPreview").innerHTML = renderImportPreview();
    showMessage(`Dataset ${parsed.id} was imported successfully. Review all nine records before locking it.`, "success");
  } catch (error) {
    event.target.value = "";
    showMessage(error.message || "This file could not be read as an assigned assessment CSV.", "warning");
  }
}

async function datasetFingerprint(parsed) {
  const bytes = new TextEncoder().encode(JSON.stringify(parsed));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function parseAssignedCsv(text) {
  const table = parseCsv(text.replace(/^\uFEFF/, ""));
  if (table.length < 2) throw new Error("The CSV file does not contain assessment records.");
  const headers = table[0].map(value => value.trim());
  if (headers.length !== 4 || normalizeHeader(headers[0]) !== "datasetid" || normalizeHeader(headers[1]) !== "record") {
    throw new Error("This is not an assigned Daily Grade #4 dataset.");
  }
  if (!headers[2] || !headers[3] || normalizeHeader(headers[2]) === normalizeHeader(headers[3])) {
    throw new Error("The assigned file must contain two different numerical columns.");
  }
  const dataRows = table.slice(1).filter(row => row.some(value => value.trim() !== ""));
  if (dataRows.length !== 9 || dataRows.some(row => row.length !== 4)) {
    throw new Error("An assigned Daily Grade #4 file must contain exactly nine records and four columns.");
  }
  const ids = [...new Set(dataRows.map(row => row[0].trim().toUpperCase()))];
  if (ids.length !== 1 || !acceptedDatasetIds.has(ids[0])) {
    throw new Error("The Dataset ID must be A, B, C, or D and must match in every row.");
  }
  const rows = dataRows.map((row, index) => {
    const record = row[1].trim();
    const x = Number(row[2].trim());
    const y = Number(row[3].trim());
    if (!record || !Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(`Record ${index + 1} must contain one label and two numerical values.`);
    }
    return { record, x, y };
  });
  if (new Set(rows.map(row => row.record.toLowerCase())).size !== rows.length) {
    throw new Error("Every record label in the assigned file must be different.");
  }
  return {
    id: ids[0],
    headers: { record: headers[1], x: headers[2], y: headers[3] },
    rows
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

function normalizeHeader(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function renderVisibleChart(stage) {
  const canvas = stage === 2
    ? document.querySelector("#chartCanvas")
    : stage >= 3
      ? document.querySelector("#lockedChartCanvas")
      : null;
  if (canvas) renderChartInto(canvas);
}

function renderChartInto(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const complete = state.dataset.rows.length && state.chart.type && state.chart.title.trim()
    && state.chart.xField && state.chart.yField && state.chart.xField !== state.chart.yField;
  if (!complete) {
    ctx.fillStyle = "#647188";
    ctx.font = "600 20px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Complete the chart title, type, and both axes.", width / 2, height / 2);
    const summary = document.querySelector("#chartSummary");
    if (summary) summary.textContent = "The chart will appear after all chart decisions are complete.";
    return;
  }

  const margin = { left: 82, right: 34, top: 64, bottom: 78 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xValues = state.dataset.rows.map(row => fieldValue(row, state.chart.xField));
  const yValues = state.dataset.rows.map(row => fieldValue(row, state.chart.yField));
  const xRange = paddedRange(xValues);
  const yRange = paddedRange(yValues);

  ctx.fillStyle = "#172336";
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(state.chart.title.trim(), width / 2, 32);

  ctx.strokeStyle = "#d7dfeb";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#647188";
  ctx.font = "12px system-ui, sans-serif";
  for (let tick = 0; tick <= 5; tick += 1) {
    const y = margin.top + (plotHeight * tick / 5);
    const value = yRange.max - ((yRange.max - yRange.min) * tick / 5);
    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(formatTick(value), margin.left - 10, y + 4);
  }

  ctx.strokeStyle = "#60738e";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, height - margin.bottom);
  ctx.lineTo(width - margin.right, height - margin.bottom);
  ctx.stroke();

  const points = state.dataset.rows.map(row => ({
    row,
    x: mapValue(fieldValue(row, state.chart.xField), xRange.min, xRange.max, margin.left, width - margin.right),
    y: mapValue(fieldValue(row, state.chart.yField), yRange.min, yRange.max, height - margin.bottom, margin.top)
  }));

  if (state.chart.type === "line") {
    ctx.strokeStyle = "#285f8f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    [...points].sort((a, b) => a.x - b.x).forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();
  }

  if (state.chart.type === "bar") {
    const barGap = plotWidth / points.length;
    const barWidth = Math.min(50, barGap * .62);
    points.forEach((point, index) => {
      const x = margin.left + (barGap * index) + (barGap / 2);
      const zeroY = mapValue(Math.max(0, yRange.min), yRange.min, yRange.max, height - margin.bottom, margin.top);
      ctx.fillStyle = "#3978a8";
      ctx.fillRect(x - barWidth / 2, point.y, barWidth, Math.max(2, zeroY - point.y));
      ctx.fillStyle = "#44536a";
      ctx.textAlign = "center";
      ctx.fillText(point.row.record, x, height - margin.bottom + 22);
    });
  } else {
    points.forEach(point => {
      ctx.beginPath();
      ctx.fillStyle = "#d1782f";
      ctx.arc(point.x, point.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#25344a";
      ctx.font = "700 12px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(point.row.record, point.x + 9, point.y - 8);
    });
    ctx.fillStyle = "#647188";
    ctx.font = "12px system-ui, sans-serif";
    for (let tick = 0; tick <= 5; tick += 1) {
      const x = margin.left + (plotWidth * tick / 5);
      const value = xRange.min + ((xRange.max - xRange.min) * tick / 5);
      ctx.textAlign = "center";
      ctx.fillText(formatTick(value), x, height - margin.bottom + 22);
    }
  }

  ctx.fillStyle = "#3f4f66";
  ctx.font = "700 14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(state.chart.type === "bar" ? state.dataset.headers.record : fieldLabel(state.chart.xField), margin.left + plotWidth / 2, height - 24);
  ctx.save();
  ctx.translate(22, margin.top + plotHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(fieldLabel(state.chart.yField), 0, 0);
  ctx.restore();

  const summary = document.querySelector("#chartSummary");
  if (summary) summary.textContent = `${chartTypeLabel(state.chart.type)} showing ${fieldLabel(state.chart.xField)} and ${fieldLabel(state.chart.yField)} for all nine records.`;
}

function paddedRange(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  return { min: min - spread * .08, max: max + spread * .08 };
}

function mapValue(value, min, max, outputMin, outputMax) {
  return outputMin + ((value - min) / (max - min || 1)) * (outputMax - outputMin);
}

function formatTick(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function fieldValue(row, field) {
  return field === "x" ? row.x : row.y;
}

function fieldLabel(field) {
  return field === "x" ? state.dataset.headers.x : field === "y" ? state.dataset.headers.y : "Not selected";
}

function chartTypeLabel(type) {
  return { scatter: "Scatter plot", line: "Line chart", bar: "Bar chart" }[type] || "Not selected";
}

function directionLabel(value) {
  return { positive: "Positive", negative: "Negative", unclear: "No clear direction" }[value] || "Not selected";
}

function limitationLabel(value) {
  return {
    causation: "The chart cannot prove that one variable caused the other",
    cause: "The chart proves exactly what caused the result",
    future: "The chart guarantees the same result in the future"
  }[value] || "Not selected";
}

function selectedRecord(label) {
  return state.dataset.rows.find(row => row.record === label) || null;
}

function comparisonEvidence() {
  const first = selectedRecord(state.analysis.compareFirst);
  const second = selectedRecord(state.analysis.compareSecond);
  if (!first || !second) return "Choose two different records to see their exact evidence.";
  if (first.record === second.record) return "Choose two different records.";
  return `${recordOptionLabel(first)}. ${recordOptionLabel(second)}.`;
}

function outlierEvidence() {
  const row = selectedRecord(state.analysis.outlierRecord);
  return row ? recordOptionLabel(row) : "Choose the record you believe is most unusual.";
}

function validateStage(stage) {
  if (stage === 1 && (!state.dataset.id || state.dataset.rows.length !== 9)) {
    return "Upload the CSV file assigned to you and review the full nine-record preview.";
  }
  if (stage === 2) {
    if (state.chart.title.trim().length < 6) return "Write a clear chart title before continuing.";
    if (!["scatter", "line", "bar"].includes(state.chart.type)) return "Choose one chart type.";
    if (!["x", "y"].includes(state.chart.xField) || !["x", "y"].includes(state.chart.yField) || state.chart.xField === state.chart.yField) {
      return "Choose two different numerical variables for the horizontal and vertical axes.";
    }
  }
  if (stage === 3) {
    if (!["positive", "negative", "unclear"].includes(state.analysis.patternDirection)) return "Select the overall pattern direction.";
    if (!completeEvidenceSentence(state.analysis.patternSentence)) return "Write a complete pattern sentence containing at least two numerical values from the dataset.";
    const first = selectedRecord(state.analysis.compareFirst);
    const second = selectedRecord(state.analysis.compareSecond);
    if (!first || !second || first.record === second.record) return "Choose two different records for the comparison.";
    if (!completeEvidenceSentence(state.analysis.comparisonSentence)) return "Write a complete comparison sentence containing at least two numerical values from the selected records.";
  }
  if (stage === 4) {
    if (!selectedRecord(state.analysis.outlierRecord)) return "Select the record you believe is the clearest outlier.";
    if (!completeEvidenceSentence(state.analysis.outlierSentence)) return "Write a complete outlier or limitation sentence containing both numerical values from the selected record.";
    if (!["positive", "negative", "unclear"].includes(state.analysis.correlation)) return "Select the possible correlation shown by the dataset.";
    if (!["causation", "cause", "future"].includes(state.analysis.limitation)) return "Select one important limitation.";
    if (state.analysis.conclusion.trim().length < 30) return "Write a complete conclusion explaining what the data suggest and what the chart cannot prove.";
  }
  return "";
}

function completeEvidenceSentence(value) {
  const text = value.trim();
  const numbers = text.match(/-?\d+(?:\.\d+)?/g) || [];
  return text.length >= 25 && numbers.length >= 2;
}

function openLockDialog() {
  const error = validateStage(state.currentStage);
  if (error) return showMessage(error, "warning");
  document.querySelector("#lockDialogTitle").textContent = `Lock Stage ${state.currentStage}?`;
  document.querySelector("#lockDialogText").textContent = `You are about to finish “${stageNames[state.currentStage - 1]}.” Check every choice and sentence now.`;
  document.querySelector("#lockDialogWarning").textContent = lockWarning(state.currentStage);
  lockDialog.showModal();
}

function lockWarning(stage) {
  return {
    1: "The imported dataset will be saved and cannot be replaced after you continue.",
    2: "The chart type, title, axes, and chart image cannot be changed after you continue.",
    3: "Your pattern and comparison choices and sentences cannot be changed after you continue.",
    4: "Your outlier, correlation, limitation, and final sentences cannot be changed after you continue."
  }[stage];
}

function confirmStageLock() {
  const stage = state.currentStage;
  const error = validateStage(stage);
  if (error) {
    lockDialog.close();
    return showMessage(error, "warning");
  }
  state.lockedAt[String(stage)] = new Date().toISOString();
  state.currentStage = Math.min(5, stage + 1);
  persistState();
  lockDialog.close();
  window.history.replaceState({ assessment: true, stage: state.currentStage }, "", `${window.location.pathname}${window.location.search}#assessment`);
  renderStage();
  document.querySelector("#stageTitle").focus({ preventScroll: true });
  assessmentSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showMessage(message, type) {
  stageMessage.textContent = message;
  stageMessage.className = `result ${type}`;
}

function openStudentDialog() {
  document.querySelector("#studentName").value = state.student.name;
  document.querySelector("#className").value = state.student.className;
  document.querySelector("#activityDate").value = state.student.date || localDateValue();
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
  if (state.currentStage !== 5 || Object.keys(state.lockedAt).length < 4) {
    return showMessage("Complete and lock every evidence stage before downloading.", "warning");
  }
  if (!window.jspdf?.jsPDF) {
    return showMessage("The PDF tool could not load. Check your connection and try again.", "warning");
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const blue = [40, 95, 143];
  const dark = [23, 35, 54];
  const muted = [100, 113, 136];
  let y = 18;

  function ensureSpace(needed = 20) {
    if (y + needed <= pageHeight - 18) return;
    doc.addPage();
    y = 18;
  }

  function sectionTitle(text) {
    ensureSpace(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...blue);
    doc.text(text, margin, y);
    doc.setDrawColor(215, 223, 235);
    doc.line(margin, y + 2, pageWidth - margin, y + 2);
    y += 8;
  }

  function paragraph(text, options = {}) {
    const size = options.size || 10;
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(options.color || dark));
    const lines = doc.splitTextToSize(text || "Not provided", contentWidth);
    ensureSpace(lines.length * (size * .43) + 4);
    doc.text(lines, margin, y);
    y += lines.length * (size * .43) + 4;
  }

  doc.setFillColor(...blue);
  doc.rect(0, 0, pageWidth, 37, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Chart Investigation", margin, 17);
  doc.setFontSize(10);
  doc.text("Daily Grade #4 · Individual Submission", margin, 25);
  doc.setFont("helvetica", "normal");
  doc.text(`Dataset ${state.dataset.id}`, pageWidth - margin, 25, { align: "right" });
  y = 46;

  doc.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 2.5, textColor: dark },
    headStyles: { fillColor: blue, textColor: [255, 255, 255] },
    head: [["Student", "Class", "Date", "Imported file"]],
    body: [[state.student.name, state.student.className, formatDate(state.student.date), state.dataset.fileName]],
    margin: { left: margin, right: margin }
  });
  y = doc.lastAutoTable.finalY + 9;

  sectionTitle("Imported Dataset");
  doc.autoTable({
    startY: y,
    theme: "striped",
    styles: { fontSize: 8.5, cellPadding: 2.2, textColor: dark },
    headStyles: { fillColor: [222, 234, 247], textColor: dark },
    head: [[state.dataset.headers.record, state.dataset.headers.x, state.dataset.headers.y]],
    body: state.dataset.rows.map(row => [row.record, String(row.x), String(row.y)]),
    margin: { left: margin, right: margin }
  });
  y = doc.lastAutoTable.finalY + 9;

  sectionTitle("Locked Chart");
  ensureSpace(100);
  const chartCanvas = document.createElement("canvas");
  chartCanvas.width = 1200;
  chartCanvas.height = 667;
  renderChartInto(chartCanvas);
  doc.addImage(chartCanvas.toDataURL("image/png"), "PNG", margin, y, contentWidth, contentWidth * .556);
  y += contentWidth * .556 + 8;

  sectionTitle("Four Interpretation Sentences");
  [
    ["Pattern", state.analysis.patternSentence],
    ["Comparison", state.analysis.comparisonSentence],
    ["Outlier or limitation", state.analysis.outlierSentence],
    ["Conclusion", state.analysis.conclusion]
  ].forEach(([label, text]) => {
    paragraph(label, { bold: true, size: 10, color: blue });
    paragraph(text);
  });

  sectionTitle("Objective Analysis Evidence");
  doc.autoTable({
    startY: y,
    theme: "grid",
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: dark },
    headStyles: { fillColor: [222, 234, 247], textColor: dark },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 45 } },
    body: [
      ["Chart type", chartTypeLabel(state.chart.type)],
      ["Chart title", state.chart.title],
      ["Horizontal axis", fieldLabel(state.chart.xField)],
      ["Vertical axis", fieldLabel(state.chart.yField)],
      ["Pattern direction", directionLabel(state.analysis.patternDirection)],
      ["Compared records", `${state.analysis.compareFirst} and ${state.analysis.compareSecond}`],
      ["Possible outlier", state.analysis.outlierRecord],
      ["Possible correlation", directionLabel(state.analysis.correlation)],
      ["Selected limitation", limitationLabel(state.analysis.limitation)]
    ],
    margin: { left: margin, right: margin }
  });
  y = doc.lastAutoTable.finalY + 9;

  sectionTitle("Rubric Evidence Check");
  paragraph("Teacher checks: chart accuracy, title and labels; supported pattern and comparison; accurate outlier or limitation; careful evidence-based conclusion. Punctuality, readiness, and respect are scored separately.");

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(215, 223, 235);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("Chart Investigation · Locked Daily Grade #4 Submission", margin, pageHeight - 7);
    doc.text(`Page ${page} of ${pages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
  }

  const safeName = state.student.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 44);
  doc.save(`daily-grade-4-dataset-${state.dataset.id.toLowerCase()}-${safeName || "student"}.pdf`);
  showMessage("Your submission PDF was downloaded. Open it, check it, and upload it to Google Classroom.", "success");
}

function localDateValue() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day).toLocaleDateString() : value;
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
document.querySelector("#closeStudentDialogBtn").addEventListener("click", () => studentDialog.close());
document.querySelector("#cancelStudentDialogBtn").addEventListener("click", () => studentDialog.close());
document.querySelector("#studentForm").addEventListener("submit", submitStudentDetails);

window.addEventListener("hashchange", () => {
  if (state.introComplete && window.location.hash !== "#assessment") {
    window.history.replaceState({ assessment: true, stage: state.currentStage }, "", `${window.location.pathname}${window.location.search}#assessment`);
  }
});
