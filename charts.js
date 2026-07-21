const chartStorageKey = "chartPracticeStateV1";
const correctJudgments = { barCategories: "yes", lineCategories: "no", pieTrend: "no", scatterRelationship: "yes", tableExact: "yes" };
const judgmentExplanations = {
  barCategories: "Yes. Bars make the four club totals easy to compare.",
  lineCategories: "No. Favorite colors are separate categories, not points in an ordered trend. A bar chart is clearer.",
  pieTrend: "No. A pie chart shows parts of one whole. A line chart is better for daily change across two weeks.",
  scatterRelationship: "Yes. Each point can pair one study-hours value with one quiz-score value.",
  tableExact: "Yes. A table makes each student’s exact score easy to find."
};
const sentenceKeys = ["pattern", "comparison", "outlier", "conclusion"];
const chartColors = ["#3157d5", "#2c7f8f", "#df8a3d", "#7b61b3", "#3b9b68", "#c85367", "#6b7280", "#a66b2b"];

function defaultChartState() {
  return {
    examplesReviewed: false,
    judgments: {},
    judgmentsCorrect: false,
    chartType: "bar",
    title: "Practice scores by week",
    xAxisLabel: "Week",
    yAxisLabel: "Practice score",
    rows: [
      { label: "Week 1", x: "1", value: "62" },
      { label: "Week 2", x: "2", value: "70" },
      { label: "Week 3", x: "3", value: "76" },
      { label: "Week 4", x: "4", value: "74" },
      { label: "Week 5", x: "5", value: "86" }
    ],
    chartCreated: false,
    sentences: { pattern: "", comparison: "", outlier: "", conclusion: "" },
    strongest: ""
  };
}

let chartState = defaultChartState();

function loadChartState() {
  try {
    const saved = JSON.parse(localStorage.getItem(chartStorageKey));
    if (!saved || typeof saved !== "object") return;
    const defaults = defaultChartState();
    chartState = {
      ...defaults,
      ...saved,
      examplesReviewed: saved.examplesReviewed === true,
      judgments: saved.judgments && typeof saved.judgments === "object" ? saved.judgments : {},
      judgmentsCorrect: saved.judgmentsCorrect === true,
      rows: Array.isArray(saved.rows) && saved.rows.length >= 2 && saved.rows.length <= 8 ? saved.rows : defaults.rows,
      sentences: saved.sentences && typeof saved.sentences === "object" ? { ...defaults.sentences, ...saved.sentences } : defaults.sentences
    };
  } catch {
    chartState = defaultChartState();
  }
}

function saveChartState() {
  try { localStorage.setItem(chartStorageKey, JSON.stringify(chartState)); } catch {}
}

function updateClassProgress() {
  const completed = [
    chartState.examplesReviewed,
    chartState.judgmentsCorrect,
    chartState.chartCreated,
    sentenceKeys.every(key => chartState.sentences[key].trim().length >= 10),
    Boolean(chartState.strongest && chartState.sentences[chartState.strongest]?.trim())
  ].filter(Boolean).length;
  document.querySelector("#classProgressBar").style.width = `${(completed / 5) * 100}%`;
  document.querySelector("#classProgressText").textContent = `${completed} of 5 class sections complete.`;
}

function setupExamples() {
  const action = document.querySelector(".review-examples-action");
  const button = document.querySelector("#examplesReviewedBtn");
  const message = document.querySelector("#examplesReviewedMessage");
  const render = () => {
    action.classList.toggle("reviewed", chartState.examplesReviewed);
    button.textContent = chartState.examplesReviewed ? "Examples reviewed ✓" : "I reviewed all five examples";
    message.textContent = chartState.examplesReviewed ? "Good. Use these examples while answering the questions below." : "";
  };
  button.addEventListener("click", () => {
    chartState.examplesReviewed = true;
    saveChartState();
    render();
    updateClassProgress();
  });
  render();
}

function setupMatching() {
  document.querySelectorAll("[data-judgment]").forEach(radio => {
    radio.checked = chartState.judgments[radio.dataset.judgment] === radio.value;
    radio.addEventListener("change", () => {
      chartState.judgments[radio.dataset.judgment] = radio.value;
      chartState.judgmentsCorrect = false;
      const card = radio.closest(".judgment-card");
      card.classList.remove("correct", "incorrect");
      card.querySelector(".judgment-feedback").textContent = "";
      document.querySelector("#matchResult").textContent = "";
      saveChartState();
      updateClassProgress();
    });
  });

  if (chartState.judgmentsCorrect) {
    const result = document.querySelector("#matchResult");
    result.textContent = "Excellent—each display fits the question it is being used to answer.";
    result.className = "result success";
    renderJudgmentFeedback();
  }

  document.querySelector("#checkMatchesBtn").addEventListener("click", () => {
    let score = 0;
    Object.keys(correctJudgments).forEach(key => {
      const correct = chartState.judgments[key] === correctJudgments[key];
      const card = document.querySelector(`[data-judgment-card="${key}"]`);
      card.classList.toggle("correct", correct);
      card.classList.toggle("incorrect", !correct);
      card.querySelector(".judgment-feedback").textContent = chartState.judgments[key]
        ? judgmentExplanations[key]
        : "Choose Yes or No, then check again.";
      if (correct) score += 1;
    });
    chartState.judgmentsCorrect = score === 5;
    saveChartState();
    const result = document.querySelector("#matchResult");
    result.textContent = score === 5 ? "Excellent—each display fits the question it is being used to answer." : `${score} of 5 choices are correct. Read each explanation, compare it with the examples, and try again.`;
    result.className = `result ${score === 5 ? "success" : "warning"}`;
    updateClassProgress();
  });
}

function renderJudgmentFeedback() {
  Object.keys(correctJudgments).forEach(key => {
    const card = document.querySelector(`[data-judgment-card="${key}"]`);
    card.classList.add("correct");
    card.classList.remove("incorrect");
    card.querySelector(".judgment-feedback").textContent = judgmentExplanations[key];
  });
}

function renderDataRows() {
  const body = document.querySelector("#chartDataBody");
  body.innerHTML = "";
  chartState.rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><input type="text" data-row-index="${index}" data-row-key="label" value="${escapeHtml(row.label)}" aria-label="Label row ${index + 1}"></td>
      <td class="x-value-column"><input type="number" step="any" data-row-index="${index}" data-row-key="x" value="${escapeHtml(row.x)}" aria-label="X value row ${index + 1}"></td>
      <td><input type="number" min="0" step="any" data-row-index="${index}" data-row-key="value" value="${escapeHtml(row.value)}" aria-label="Value row ${index + 1}"></td>
      <td><button class="remove-row" type="button" data-remove-row="${index}"${chartState.rows.length <= 2 ? " disabled" : ""}>Remove</button></td>`;
    body.appendChild(tr);
  });
  body.querySelectorAll("[data-remove-row]").forEach(button => button.addEventListener("click", () => {
    chartState.rows.splice(Number(button.dataset.removeRow), 1);
    chartState.chartCreated = false;
    saveChartState();
    renderDataRows();
    updateClassProgress();
  }));
  updateChartTypeUI();
}

function setupChartBuilder() {
  document.querySelector("#chartTitle").value = chartState.title;
  document.querySelector("#chartType").value = chartState.chartType;
  document.querySelector("#xAxisLabel").value = chartState.xAxisLabel;
  document.querySelector("#yAxisLabel").value = chartState.yAxisLabel;
  renderDataRows();

  document.querySelector("#chartDataBody").addEventListener("input", event => {
    const input = event.target.closest("[data-row-index]");
    if (!input) return;
    chartState.rows[Number(input.dataset.rowIndex)][input.dataset.rowKey] = input.value;
    chartState.chartCreated = false;
    saveChartState();
    updateClassProgress();
  });

  ["chartTitle", "chartType", "xAxisLabel", "yAxisLabel"].forEach(id => {
    document.querySelector(`#${id}`).addEventListener("input", event => {
      const key = { chartTitle: "title", chartType: "chartType", xAxisLabel: "xAxisLabel", yAxisLabel: "yAxisLabel" }[id];
      chartState[key] = event.target.value;
      chartState.chartCreated = false;
      saveChartState();
      if (id === "chartType") updateChartTypeUI();
      updateClassProgress();
    });
  });

  document.querySelector("#addDataRowBtn").addEventListener("click", () => {
    if (chartState.rows.length >= 8) return showChartMessage("Use no more than eight data rows for this practice.", "warning");
    const next = chartState.rows.length + 1;
    chartState.rows.push({ label: `Item ${next}`, x: String(next), value: "0" });
    chartState.chartCreated = false;
    saveChartState();
    renderDataRows();
  });

  document.querySelector("#createChartBtn").addEventListener("click", createChart);
  if (chartState.chartCreated) renderChart();
}

function updateChartTypeUI() {
  const isScatter = chartState.chartType === "scatter";
  document.querySelectorAll(".x-value-column").forEach(cell => cell.hidden = !isScatter);
  const tips = {
    bar: "Bar charts work best for comparing values across categories.",
    line: "Line charts work best when labels follow a meaningful order, such as weeks or months.",
    pie: "Pie charts show parts of a whole. Use non-negative values that belong to the same total.",
    scatter: "Scatter plots need an X value and a Y value for every point.",
    table: "Tables are useful when readers need to find exact values."
  };
  document.querySelector("#chartTypeTip").textContent = tips[chartState.chartType];
}

function createChart() {
  const title = chartState.title.trim();
  const rowsReady = chartState.rows.every(row => row.label.trim() && row.value !== "" && Number.isFinite(Number(row.value)) && Number(row.value) >= 0);
  const xReady = chartState.chartType !== "scatter" || chartState.rows.every(row => row.x !== "" && Number.isFinite(Number(row.x)));
  if (!title) return showChartMessage("Add a clear chart title before creating the chart.", "warning");
  if (!rowsReady) return showChartMessage("Every row needs a label and a non-negative numerical value.", "warning");
  if (!xReady) return showChartMessage("Every scatter point needs a numerical X value.", "warning");
  if (chartState.chartType === "pie" && chartState.rows.every(row => Number(row.value) === 0)) return showChartMessage("A pie chart needs at least one value greater than zero.", "warning");
  chartState.chartCreated = true;
  saveChartState();
  renderChart();
  showChartMessage("Chart created. Check the title, labels, scale, and whether this chart type fits the data.", "success");
  updateClassProgress();
}

function renderChart() {
  const preview = document.querySelector("#chartPreview");
  preview.innerHTML = "";
  if (chartState.chartType === "pie") renderPieChart(preview);
  else if (chartState.chartType === "table") renderTableChart(preview);
  else renderSvgChart(preview);
  document.querySelector("#chartSummary").textContent = `${chartState.title}. ${chartState.chartType} chart. ${chartState.rows.map(row => `${row.label}: ${row.value}`).join("; ")}.`;
}

function renderSvgChart(preview) {
  const width = 760, height = 390, left = 68, right = 26, top = 52, bottom = 72;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const svg = svgElement("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": chartState.title });
  svg.appendChild(svgElement("text", { x: width / 2, y: 25, "text-anchor": "middle", "font-size": 18, "font-weight": 700, fill: "#1d2433" }, chartState.title));
  svg.appendChild(svgElement("line", { x1: left, y1: top, x2: left, y2: top + plotHeight, stroke: "#667085" }));
  svg.appendChild(svgElement("line", { x1: left, y1: top + plotHeight, x2: left + plotWidth, y2: top + plotHeight, stroke: "#667085" }));

  const values = chartState.rows.map(row => Number(row.value));
  const maxValue = Math.max(...values, 1);
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = (maxValue / 4) * tick;
    const y = top + plotHeight - (value / maxValue) * plotHeight;
    svg.appendChild(svgElement("line", { x1: left, y1: y, x2: left + plotWidth, y2: y, stroke: "#d8deea", "stroke-width": .8 }));
    svg.appendChild(svgElement("text", { x: left - 9, y: y + 4, "text-anchor": "end", "font-size": 11, fill: "#667085" }, formatNumber(value)));
  }

  if (chartState.chartType === "bar") renderBars(svg, { left, top, plotWidth, plotHeight, maxValue });
  if (chartState.chartType === "line") renderLine(svg, { left, top, plotWidth, plotHeight, maxValue });
  if (chartState.chartType === "scatter") renderScatter(svg, { left, top, plotWidth, plotHeight, maxValue });

  svg.appendChild(svgElement("text", { x: left + plotWidth / 2, y: height - 15, "text-anchor": "middle", "font-size": 12, fill: "#465168" }, chartState.xAxisLabel || "Category"));
  const yLabel = svgElement("text", { x: 17, y: top + plotHeight / 2, "text-anchor": "middle", "font-size": 12, fill: "#465168", transform: `rotate(-90 17 ${top + plotHeight / 2})` }, chartState.yAxisLabel || "Value");
  svg.appendChild(yLabel);
  preview.appendChild(svg);
}

function renderBars(svg, dims) {
  const gap = 12;
  const slot = dims.plotWidth / chartState.rows.length;
  const barWidth = Math.max(14, slot - gap);
  chartState.rows.forEach((row, index) => {
    const value = Number(row.value);
    const barHeight = (value / dims.maxValue) * dims.plotHeight;
    const x = dims.left + index * slot + (slot - barWidth) / 2;
    const y = dims.top + dims.plotHeight - barHeight;
    svg.appendChild(svgElement("rect", { x, y, width: barWidth, height: barHeight, rx: 3, fill: chartColors[index % chartColors.length] }));
    svg.appendChild(svgElement("text", { x: x + barWidth / 2, y: y - 6, "text-anchor": "middle", "font-size": 11, fill: "#1d2433" }, formatNumber(value)));
    svg.appendChild(svgElement("text", { x: x + barWidth / 2, y: dims.top + dims.plotHeight + 18, "text-anchor": "middle", "font-size": 10, fill: "#465168" }, shortLabel(row.label)));
  });
}

function renderLine(svg, dims) {
  const step = chartState.rows.length === 1 ? 0 : dims.plotWidth / (chartState.rows.length - 1);
  const points = chartState.rows.map((row, index) => {
    const x = dims.left + index * step;
    const y = dims.top + dims.plotHeight - (Number(row.value) / dims.maxValue) * dims.plotHeight;
    return { x, y, row };
  });
  svg.appendChild(svgElement("polyline", { points: points.map(point => `${point.x},${point.y}`).join(" "), fill: "none", stroke: "#3157d5", "stroke-width": 3 }));
  points.forEach(point => {
    svg.appendChild(svgElement("circle", { cx: point.x, cy: point.y, r: 5, fill: "#3157d5", stroke: "white", "stroke-width": 2 }));
    svg.appendChild(svgElement("text", { x: point.x, y: point.y - 10, "text-anchor": "middle", "font-size": 11, fill: "#1d2433" }, formatNumber(Number(point.row.value))));
    svg.appendChild(svgElement("text", { x: point.x, y: dims.top + dims.plotHeight + 18, "text-anchor": "middle", "font-size": 10, fill: "#465168" }, shortLabel(point.row.label)));
  });
}

function renderScatter(svg, dims) {
  const xValues = chartState.rows.map(row => Number(row.x));
  const xMin = Math.min(...xValues), xMax = Math.max(...xValues);
  const xRange = xMax - xMin || 1;
  chartState.rows.forEach((row, index) => {
    const x = dims.left + ((Number(row.x) - xMin) / xRange) * dims.plotWidth;
    const y = dims.top + dims.plotHeight - (Number(row.value) / dims.maxValue) * dims.plotHeight;
    svg.appendChild(svgElement("circle", { cx: x, cy: y, r: 7, fill: chartColors[index % chartColors.length], opacity: .9 }));
    svg.appendChild(svgElement("text", { x, y: y - 11, "text-anchor": "middle", "font-size": 10, fill: "#1d2433" }, shortLabel(row.label)));
  });
  for (let tick = 0; tick <= 4; tick += 1) {
    const x = dims.left + (tick / 4) * dims.plotWidth;
    svg.appendChild(svgElement("text", { x, y: dims.top + dims.plotHeight + 18, "text-anchor": "middle", "font-size": 10, fill: "#465168" }, formatNumber(xMin + (xRange / 4) * tick)));
  }
}

function renderPieChart(preview) {
  const total = chartState.rows.reduce((sum, row) => sum + Number(row.value), 0);
  let current = 0;
  const stops = chartState.rows.map((row, index) => {
    const start = current;
    current += (Number(row.value) / total) * 360;
    return `${chartColors[index % chartColors.length]} ${start}deg ${current}deg`;
  });
  const layout = document.createElement("div");
  layout.className = "pie-layout";
  const pie = document.createElement("div");
  pie.className = "pie-visual";
  pie.style.background = `conic-gradient(${stops.join(", ")})`;
  pie.setAttribute("role", "img");
  pie.setAttribute("aria-label", chartState.title);
  const legend = document.createElement("div");
  legend.className = "chart-legend";
  const heading = document.createElement("h4");
  heading.textContent = chartState.title;
  legend.appendChild(heading);
  chartState.rows.forEach((row, index) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `<span class="legend-swatch" style="background:${chartColors[index % chartColors.length]}"></span><span>${escapeHtml(row.label)}: ${formatNumber(Number(row.value))} (${Math.round((Number(row.value) / total) * 100)}%)</span>`;
    legend.appendChild(item);
  });
  layout.append(pie, legend);
  preview.appendChild(layout);
}

function renderTableChart(preview) {
  const table = document.createElement("table");
  table.className = "preview-table";
  table.innerHTML = `<caption><strong>${escapeHtml(chartState.title)}</strong></caption><thead><tr><th>${escapeHtml(chartState.xAxisLabel || "Label")}</th><th>${escapeHtml(chartState.yAxisLabel || "Value")}</th></tr></thead><tbody>${chartState.rows.map(row => `<tr><td>${escapeHtml(row.label)}</td><td>${formatNumber(Number(row.value))}</td></tr>`).join("")}</tbody>`;
  preview.appendChild(table);
}

function setupSentences() {
  document.querySelectorAll("[data-sentence]").forEach(area => {
    area.value = chartState.sentences[area.dataset.sentence] || "";
    area.addEventListener("input", () => {
      chartState.sentences[area.dataset.sentence] = area.value;
      if (chartState.strongest === area.dataset.sentence && !area.value.trim()) chartState.strongest = "";
      saveChartState();
      renderEvidenceChoices();
      updateSentenceProgress();
      updateClassProgress();
    });
  });
  updateSentenceProgress();
  renderEvidenceChoices();
}

function updateSentenceProgress() {
  const count = sentenceKeys.filter(key => chartState.sentences[key].trim().length >= 10).length;
  document.querySelector("#sentenceProgress").textContent = `${count} of 4 evidence sentences ready.`;
}

function renderEvidenceChoices() {
  const container = document.querySelector("#evidenceChoices");
  container.innerHTML = "";
  sentenceKeys.forEach(key => {
    const label = document.createElement("label");
    label.className = "evidence-option";
    const sentence = chartState.sentences[key].trim();
    label.innerHTML = `<input type="radio" name="strongestEvidence" value="${key}"${chartState.strongest === key ? " checked" : ""}${!sentence ? " disabled" : ""}><span><strong>${key === "outlier" ? "Outlier or limitation" : key}</strong><br>${escapeHtml(sentence || "Write this sentence before selecting it.")}</span>`;
    container.appendChild(label);
  });
  container.querySelectorAll('input[name="strongestEvidence"]').forEach(radio => radio.addEventListener("change", () => {
    chartState.strongest = radio.value;
    saveChartState();
    renderStrongestEvidence();
    updateClassProgress();
  }));
  renderStrongestEvidence();
}

function renderStrongestEvidence() {
  const output = document.querySelector("#strongestEvidence");
  const sentence = chartState.strongest ? chartState.sentences[chartState.strongest].trim() : "";
  output.innerHTML = sentence ? `<p><strong>Strongest evidence:</strong><br><mark>${escapeHtml(sentence)}</mark></p>` : "<p>Choose your strongest sentence to highlight it here.</p>";
}

function resetChartActivity() {
  chartState = defaultChartState();
  try { localStorage.removeItem(chartStorageKey); } catch {}
  window.location.reload();
}

function showChartMessage(message, type) {
  const result = document.querySelector("#chartMessage");
  result.textContent = message;
  result.className = `result ${type}`;
}

function svgElement(tag, attributes, text) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  if (text !== undefined) element.textContent = text;
  return element;
}

function shortLabel(value) { return value.length > 11 ? `${value.slice(0, 10)}…` : value; }
function formatNumber(value) { return Number.isInteger(value) ? String(value) : value.toFixed(1); }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

loadChartState();
setupExamples();
setupMatching();
setupChartBuilder();
setupSentences();
updateClassProgress();
document.querySelector("#resetChartActivityBtn").addEventListener("click", resetChartActivity);
