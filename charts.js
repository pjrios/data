const chartStorageKey = "chartPracticeStateV1";
const lessonSteps = [
  { id: "video", name: "Watch the video" },
  { id: "examples", name: "Explore chart examples" },
  { id: "identify", name: "Identify chart types" },
  { id: "matching", name: "Choose the correct use" },
  { id: "builder", name: "Build a chart" },
  { id: "interpret", name: "Interpret the chart" },
  { id: "evidence", name: "Highlight strong evidence" }
];
const correctIdentifications = { barFamily: "bar", histogram: "histogram", pie: "pie", scatter: "scatter", line: "line" };
const identificationNames = { bar: "bar chart", histogram: "histogram", pie: "pie chart", scatter: "scatter plot", line: "line chart" };
const correctJudgments = { verticalComparison: "yes", horizontalRanking: "yes", stackedWhole: "yes", histogramDistribution: "yes", pieTrend: "no", scatterCorrelation: "yes", lineTime: "yes" };
const builderChartTypes = ["bar", "horizontalBar", "stackedBar", "histogram", "pie", "scatter", "line"];
const judgmentExplanations = {
  verticalComparison: "Yes. Separate columns make values across product categories easy to compare.",
  horizontalRanking: "Yes. Horizontal bars leave room for labels and make a highest-to-lowest ranking easy to scan.",
  stackedWhole: "Yes. Each complete bar shows a class total, while its colored stacks show the groups inside that total.",
  histogramDistribution: "Yes. A histogram groups numerical heights into continuous ranges and shows how often values occur.",
  pieTrend: "No. A pie chart shows parts of one whole. A line chart is better for daily change across two weeks.",
  scatterCorrelation: "Yes. Each point pairs one study-hours value with one quiz-score value so a possible correlation can be seen.",
  lineTime: "Yes. Connecting monthly values makes change over time easy to follow."
};
const sentenceKeys = ["pattern", "comparison", "outlier", "conclusion"];
const chartColors = ["#3157d5", "#2c7f8f", "#df8a3d", "#7b61b3", "#3b9b68", "#c85367", "#6b7280", "#a66b2b"];

function defaultChartState() {
  return {
    videoWatched: false,
    examplesReviewed: false,
    identifications: {},
    identificationsCorrect: false,
    judgments: {},
    judgmentsCorrect: false,
    currentStep: "video",
    lessonFinished: false,
    chartType: "bar",
    title: "Practice scores by week",
    xAxisLabel: "Week",
    yAxisLabel: "Practice score",
    seriesOneLabel: "Group A",
    seriesTwoLabel: "Group B",
    rows: [
      { label: "Week 1", x: "1", value: "62", value2: "18" },
      { label: "Week 2", x: "2", value: "70", value2: "22" },
      { label: "Week 3", x: "3", value: "76", value2: "20" },
      { label: "Week 4", x: "4", value: "74", value2: "26" },
      { label: "Week 5", x: "5", value: "86", value2: "24" }
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
      videoWatched: saved.videoWatched === true,
      examplesReviewed: saved.examplesReviewed === true,
      identifications: saved.identifications && typeof saved.identifications === "object" ? saved.identifications : {},
      identificationsCorrect: Object.keys(correctIdentifications).every(key => saved.identifications?.[key] === correctIdentifications[key]),
      judgments: saved.judgments && typeof saved.judgments === "object" ? saved.judgments : {},
      judgmentsCorrect: Object.keys(correctJudgments).every(key => saved.judgments?.[key] === correctJudgments[key]),
      chartType: builderChartTypes.includes(saved.chartType) ? saved.chartType : defaults.chartType,
      currentStep: lessonSteps.some(step => step.id === saved.currentStep) ? saved.currentStep : "video",
      lessonFinished: saved.lessonFinished === true,
      rows: Array.isArray(saved.rows) && saved.rows.length >= 2 && saved.rows.length <= 8
        ? saved.rows.map((row, index) => ({ ...row, value2: row.value2 ?? defaults.rows[index % defaults.rows.length].value2 }))
        : defaults.rows,
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
    chartState.videoWatched,
    chartState.examplesReviewed,
    chartState.identificationsCorrect,
    chartState.judgmentsCorrect,
    chartState.chartCreated,
    sentenceKeys.every(key => chartState.sentences[key].trim().length >= 10),
    Boolean(chartState.strongest && chartState.sentences[chartState.strongest]?.trim())
  ].filter(Boolean).length;
  document.querySelector("#classProgressBar").style.width = `${(completed / 7) * 100}%`;
  document.querySelector("#classProgressText").textContent = `${completed} of 7 steps complete.`;
}

function setupIdentification() {
  document.querySelectorAll("[data-identification]").forEach(select => {
    select.value = chartState.identifications[select.dataset.identification] || "";
    select.addEventListener("change", () => {
      chartState.identifications[select.dataset.identification] = select.value;
      chartState.identificationsCorrect = false;
      const card = select.closest(".identify-card");
      card.classList.remove("correct", "incorrect");
      card.querySelector(".identify-feedback").textContent = "";
      document.querySelector("#identifyResult").textContent = "";
      saveChartState();
      updateClassProgress();
    });
  });
  if (chartState.identificationsCorrect) renderIdentificationFeedback();
}

function checkIdentifications() {
  let score = 0;
  Object.keys(correctIdentifications).forEach(key => {
    const correct = chartState.identifications[key] === correctIdentifications[key];
    const card = document.querySelector(`[data-identify-card="${key}"]`);
    card.classList.toggle("correct", correct);
    card.classList.toggle("incorrect", !correct);
    card.querySelector(".identify-feedback").textContent = !chartState.identifications[key]
      ? "Choose a chart type."
      : correct
        ? `Correct: ${identificationNames[correctIdentifications[key]]}.`
        : `Look at the shape again. This is a ${identificationNames[correctIdentifications[key]]}.`;
    if (correct) score += 1;
  });
  chartState.identificationsCorrect = score === 5;
  saveChartState();
  const result = document.querySelector("#identifyResult");
  result.textContent = score === 5 ? "Excellent—you recognized all five displays." : `${score} of 5 are correct. Review the highlighted displays and try again.`;
  result.className = `result ${score === 5 ? "success" : "warning"}`;
  updateClassProgress();
  return chartState.identificationsCorrect;
}

function renderIdentificationFeedback() {
  Object.keys(correctIdentifications).forEach(key => {
    const card = document.querySelector(`[data-identify-card="${key}"]`);
    card.classList.add("correct");
    card.classList.remove("incorrect");
    card.querySelector(".identify-feedback").textContent = `Correct: ${identificationNames[correctIdentifications[key]]}.`;
  });
  const result = document.querySelector("#identifyResult");
  result.textContent = "Excellent—you recognized all five displays.";
  result.className = "result success";
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

}

function checkJudgments() {
  let score = 0;
  const total = Object.keys(correctJudgments).length;
  Object.keys(correctJudgments).forEach(key => {
    const correct = chartState.judgments[key] === correctJudgments[key];
    const card = document.querySelector(`[data-judgment-card="${key}"]`);
    card.classList.toggle("correct", correct);
    card.classList.toggle("incorrect", !correct);
    card.querySelector(".judgment-feedback").textContent = chartState.judgments[key]
      ? judgmentExplanations[key]
      : "Choose Yes or No, then continue again.";
    if (correct) score += 1;
  });
  chartState.judgmentsCorrect = score === total;
  saveChartState();
  const result = document.querySelector("#matchResult");
  result.textContent = score === total ? "Excellent—each display fits the question it is being used to answer." : `${score} of ${total} choices are correct. Read each explanation, compare it with the examples, and try again.`;
  result.className = `result ${score === total ? "success" : "warning"}`;
  updateClassProgress();
  return chartState.judgmentsCorrect;
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
      <td class="stack-value-column"><input type="number" min="0" step="any" data-row-index="${index}" data-row-key="value2" value="${escapeHtml(row.value2 ?? "0")}" aria-label="Second series value row ${index + 1}"></td>
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
  document.querySelector("#seriesOneLabel").value = chartState.seriesOneLabel;
  document.querySelector("#seriesTwoLabel").value = chartState.seriesTwoLabel;
  renderDataRows();

  document.querySelector("#chartDataBody").addEventListener("input", event => {
    const input = event.target.closest("[data-row-index]");
    if (!input) return;
    chartState.rows[Number(input.dataset.rowIndex)][input.dataset.rowKey] = input.value;
    chartState.chartCreated = false;
    saveChartState();
    updateClassProgress();
  });

  ["chartTitle", "chartType", "xAxisLabel", "yAxisLabel", "seriesOneLabel", "seriesTwoLabel"].forEach(id => {
    document.querySelector(`#${id}`).addEventListener("input", event => {
      const key = { chartTitle: "title", chartType: "chartType", xAxisLabel: "xAxisLabel", yAxisLabel: "yAxisLabel", seriesOneLabel: "seriesOneLabel", seriesTwoLabel: "seriesTwoLabel" }[id];
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
    chartState.rows.push({ label: `Item ${next}`, x: String(next), value: "0", value2: "0" });
    chartState.chartCreated = false;
    saveChartState();
    renderDataRows();
  });

  document.querySelector("#createChartBtn").addEventListener("click", createChart);
  if (chartState.chartCreated) renderChart();
}

function updateChartTypeUI() {
  const isScatter = chartState.chartType === "scatter";
  const isStacked = chartState.chartType === "stackedBar";
  const isHistogram = chartState.chartType === "histogram";
  document.querySelectorAll(".x-value-column").forEach(cell => cell.hidden = !isScatter);
  document.querySelectorAll(".stack-value-column").forEach(cell => cell.hidden = !isStacked);
  document.querySelectorAll(".stack-series-control").forEach(control => control.classList.toggle("visible", isStacked));
  document.querySelector("#labelColumnHeading").textContent = isHistogram ? "Numerical range" : "Label";
  document.querySelector("#valueColumnHeading").textContent = isHistogram ? "Frequency" : isStacked ? "Series 1" : "Value / Y";
  const tips = {
    bar: "Vertical or column charts compare values across categories.",
    horizontalBar: "Horizontal bar charts are especially useful for rankings and long category labels.",
    stackedBar: "Stacked bar charts compare totals and show the parts inside each total. Enter values for both series.",
    histogram: "Histograms show a numerical distribution. Enter ordered ranges as labels; the bars will touch.",
    pie: "Pie charts show parts of a whole. Use non-negative values that belong to the same total.",
    scatter: "Scatter plots need an X value and a Y value for every point.",
    line: "Line charts show change over time or another meaningful ordered sequence."
  };
  document.querySelector("#chartTypeTip").textContent = tips[chartState.chartType];
}

function createChart() {
  const title = chartState.title.trim();
  const rowsReady = chartState.rows.every(row => row.label.trim() && row.value !== "" && Number.isFinite(Number(row.value)) && Number(row.value) >= 0);
  const xReady = chartState.chartType !== "scatter" || chartState.rows.every(row => row.x !== "" && Number.isFinite(Number(row.x)));
  const secondSeriesReady = chartState.chartType !== "stackedBar" || chartState.rows.every(row => row.value2 !== "" && Number.isFinite(Number(row.value2)) && Number(row.value2) >= 0);
  if (!title) return showChartMessage("Add a clear chart title before creating the chart.", "warning");
  if (!rowsReady) return showChartMessage("Every row needs a label and a non-negative numerical value.", "warning");
  if (!xReady) return showChartMessage("Every scatter point needs a numerical X value.", "warning");
  if (!secondSeriesReady) return showChartMessage("Every stacked-bar row needs a non-negative value for both series.", "warning");
  if (chartState.chartType === "stackedBar" && (!chartState.seriesOneLabel.trim() || !chartState.seriesTwoLabel.trim())) return showChartMessage("Add a clear label for both stacked-bar series.", "warning");
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
  else if (chartState.chartType === "horizontalBar") renderHorizontalBarChart(preview);
  else renderSvgChart(preview);
  const rowSummary = chartState.rows.map(row => chartState.chartType === "stackedBar"
    ? `${row.label}: ${chartState.seriesOneLabel} ${row.value}, ${chartState.seriesTwoLabel} ${row.value2}`
    : `${row.label}: ${row.value}`).join("; ");
  document.querySelector("#chartSummary").textContent = `${chartState.title}. ${chartState.chartType} chart. ${rowSummary}.`;
}

function renderSvgChart(preview) {
  const width = 760, height = 390, left = 68, right = 26, top = chartState.chartType === "stackedBar" ? 80 : 52, bottom = 72;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const svg = svgElement("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": chartState.title });
  svg.appendChild(svgElement("text", { x: width / 2, y: 25, "text-anchor": "middle", "font-size": 18, "font-weight": 700, fill: "#1d2433" }, chartState.title));
  svg.appendChild(svgElement("line", { x1: left, y1: top, x2: left, y2: top + plotHeight, stroke: "#667085" }));
  svg.appendChild(svgElement("line", { x1: left, y1: top + plotHeight, x2: left + plotWidth, y2: top + plotHeight, stroke: "#667085" }));

  const values = chartState.rows.map(row => chartState.chartType === "stackedBar" ? Number(row.value) + Number(row.value2) : Number(row.value));
  const maxValue = Math.max(...values, 1);
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = (maxValue / 4) * tick;
    const y = top + plotHeight - (value / maxValue) * plotHeight;
    svg.appendChild(svgElement("line", { x1: left, y1: y, x2: left + plotWidth, y2: y, stroke: "#d8deea", "stroke-width": .8 }));
    svg.appendChild(svgElement("text", { x: left - 9, y: y + 4, "text-anchor": "end", "font-size": 11, fill: "#667085" }, formatNumber(value)));
  }

  if (chartState.chartType === "bar") renderBars(svg, { left, top, plotWidth, plotHeight, maxValue });
  if (chartState.chartType === "stackedBar") renderStackedBars(svg, { left, top, plotWidth, plotHeight, maxValue });
  if (chartState.chartType === "histogram") renderHistogram(svg, { left, top, plotWidth, plotHeight, maxValue });
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

function renderStackedBars(svg, dims) {
  const gap = 14;
  const slot = dims.plotWidth / chartState.rows.length;
  const barWidth = Math.max(14, slot - gap);
  chartState.rows.forEach((row, index) => {
    const first = Number(row.value), second = Number(row.value2);
    const firstHeight = (first / dims.maxValue) * dims.plotHeight;
    const secondHeight = (second / dims.maxValue) * dims.plotHeight;
    const x = dims.left + index * slot + (slot - barWidth) / 2;
    const firstY = dims.top + dims.plotHeight - firstHeight;
    const secondY = firstY - secondHeight;
    svg.appendChild(svgElement("rect", { x, y: firstY, width: barWidth, height: firstHeight, fill: "#3157d5" }));
    svg.appendChild(svgElement("rect", { x, y: secondY, width: barWidth, height: secondHeight, fill: "#df8a3d" }));
    svg.appendChild(svgElement("text", { x: x + barWidth / 2, y: secondY - 6, "text-anchor": "middle", "font-size": 11, fill: "#1d2433" }, formatNumber(first + second)));
    svg.appendChild(svgElement("text", { x: x + barWidth / 2, y: dims.top + dims.plotHeight + 18, "text-anchor": "middle", "font-size": 10, fill: "#465168" }, shortLabel(row.label)));
  });
  const legendY = 43;
  svg.appendChild(svgElement("rect", { x: dims.left + dims.plotWidth - 220, y: legendY - 10, width: 12, height: 12, fill: "#3157d5" }));
  svg.appendChild(svgElement("text", { x: dims.left + dims.plotWidth - 202, y: legendY, "font-size": 11, fill: "#465168" }, chartState.seriesOneLabel));
  svg.appendChild(svgElement("rect", { x: dims.left + dims.plotWidth - 105, y: legendY - 10, width: 12, height: 12, fill: "#df8a3d" }));
  svg.appendChild(svgElement("text", { x: dims.left + dims.plotWidth - 87, y: legendY, "font-size": 11, fill: "#465168" }, chartState.seriesTwoLabel));
}

function renderHistogram(svg, dims) {
  const slot = dims.plotWidth / chartState.rows.length;
  chartState.rows.forEach((row, index) => {
    const value = Number(row.value);
    const barHeight = (value / dims.maxValue) * dims.plotHeight;
    const x = dims.left + index * slot;
    const y = dims.top + dims.plotHeight - barHeight;
    svg.appendChild(svgElement("rect", { x, y, width: slot, height: barHeight, fill: "#3157d5", stroke: "white", "stroke-width": 1 }));
    svg.appendChild(svgElement("text", { x: x + slot / 2, y: y - 6, "text-anchor": "middle", "font-size": 11, fill: "#1d2433" }, formatNumber(value)));
    svg.appendChild(svgElement("text", { x: x + slot / 2, y: dims.top + dims.plotHeight + 18, "text-anchor": "middle", "font-size": 10, fill: "#465168" }, shortLabel(row.label)));
  });
}

function renderHorizontalBarChart(preview) {
  const width = 760, height = 410, left = 130, right = 42, top = 55, bottom = 58;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const values = chartState.rows.map(row => Number(row.value));
  const maxValue = Math.max(...values, 1);
  const svg = svgElement("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": chartState.title });
  svg.appendChild(svgElement("text", { x: width / 2, y: 25, "text-anchor": "middle", "font-size": 18, "font-weight": 700, fill: "#1d2433" }, chartState.title));
  for (let tick = 0; tick <= 4; tick += 1) {
    const value = (maxValue / 4) * tick;
    const x = left + (tick / 4) * plotWidth;
    svg.appendChild(svgElement("line", { x1: x, y1: top, x2: x, y2: top + plotHeight, stroke: "#d8deea", "stroke-width": .8 }));
    svg.appendChild(svgElement("text", { x, y: top + plotHeight + 18, "text-anchor": "middle", "font-size": 11, fill: "#667085" }, formatNumber(value)));
  }
  const slot = plotHeight / chartState.rows.length;
  const barHeight = Math.max(16, slot - 12);
  chartState.rows.forEach((row, index) => {
    const value = Number(row.value);
    const y = top + index * slot + (slot - barHeight) / 2;
    const barWidth = (value / maxValue) * plotWidth;
    svg.appendChild(svgElement("rect", { x: left, y, width: barWidth, height: barHeight, rx: 3, fill: chartColors[index % chartColors.length] }));
    svg.appendChild(svgElement("text", { x: left - 10, y: y + barHeight / 2 + 4, "text-anchor": "end", "font-size": 11, fill: "#465168" }, shortLabel(row.label)));
    svg.appendChild(svgElement("text", { x: left + barWidth + 7, y: y + barHeight / 2 + 4, "font-size": 11, fill: "#1d2433" }, formatNumber(value)));
  });
  svg.appendChild(svgElement("text", { x: left + plotWidth / 2, y: height - 10, "text-anchor": "middle", "font-size": 12, fill: "#465168" }, chartState.yAxisLabel || "Value"));
  preview.appendChild(svg);
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

function setupLessonNavigation() {
  const previousButton = document.querySelector("#previousStepBtn");
  const nextButton = document.querySelector("#nextStepBtn");
  previousButton.addEventListener("click", () => {
    const currentIndex = lessonSteps.findIndex(step => step.id === chartState.currentStep);
    if (currentIndex > 0) showLessonStep(currentIndex - 1, "push");
  });
  nextButton.addEventListener("click", () => {
    const currentIndex = lessonSteps.findIndex(step => step.id === chartState.currentStep);
    if (!validateLessonStep(lessonSteps[currentIndex].id)) return;
    if (currentIndex < lessonSteps.length - 1) {
      showLessonStep(currentIndex + 1, "push");
    } else {
      chartState.lessonFinished = true;
      saveChartState();
      updateLessonNavigation(currentIndex);
      document.querySelector("#navigationMessage").textContent = "Chart Lab complete—your work is saved in this browser.";
    }
  });

  window.addEventListener("popstate", () => {
    const hashIndex = lessonSteps.findIndex(step => `#${step.id}` === window.location.hash);
    showLessonStep(hashIndex >= 0 ? hashIndex : 0, "none");
  });

  const hashIndex = lessonSteps.findIndex(step => `#${step.id}` === window.location.hash);
  const savedIndex = lessonSteps.findIndex(step => step.id === chartState.currentStep);
  showLessonStep(hashIndex >= 0 ? hashIndex : Math.max(savedIndex, 0), "replace", false);
}

function validateLessonStep(stepId) {
  const message = document.querySelector("#navigationMessage");
  message.textContent = "";
  if (stepId === "video") chartState.videoWatched = true;
  if (stepId === "examples") chartState.examplesReviewed = true;
  if (stepId === "identify" && !checkIdentifications()) {
    message.textContent = "Review the highlighted displays before continuing.";
    return false;
  }
  if (stepId === "matching" && !checkJudgments()) {
    message.textContent = "Read the explanations and correct your choices before continuing.";
    return false;
  }
  if (stepId === "builder" && !chartState.chartCreated) {
    showChartMessage("Create the chart and check its title, labels, and values before continuing.", "warning");
    message.textContent = "Create or update your chart first.";
    return false;
  }
  if (stepId === "interpret" && !sentenceKeys.every(key => chartState.sentences[key].trim().length >= 10)) {
    message.textContent = "Write all four evidence sentences before continuing.";
    return false;
  }
  if (stepId === "evidence" && !(chartState.strongest && chartState.sentences[chartState.strongest]?.trim())) {
    message.textContent = "Select your strongest evidence sentence before finishing.";
    return false;
  }
  saveChartState();
  updateClassProgress();
  return true;
}

function showLessonStep(index, historyMode = "push", scroll = true) {
  const safeIndex = Math.max(0, Math.min(index, lessonSteps.length - 1));
  const active = lessonSteps[safeIndex];
  document.querySelectorAll("[data-lesson-step]").forEach(section => {
    section.hidden = section.dataset.lessonStep !== active.id;
  });
  chartState.currentStep = active.id;
  saveChartState();
  document.querySelector("#stepCount").textContent = `Step ${safeIndex + 1} of ${lessonSteps.length}`;
  document.querySelector("#stepName").textContent = active.name;
  document.querySelector("#navigationMessage").textContent = "Your work saves automatically.";
  updateLessonNavigation(safeIndex);
  const nextUrl = `${window.location.pathname}#${active.id}`;
  if (historyMode === "push") window.history.pushState({ chartStep: active.id }, "", nextUrl);
  if (historyMode === "replace") window.history.replaceState({ chartStep: active.id }, "", nextUrl);
  if (scroll) document.querySelector(".chart-main").scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateLessonNavigation(index) {
  const previousButton = document.querySelector("#previousStepBtn");
  const nextButton = document.querySelector("#nextStepBtn");
  const nextNames = ["Explore examples", "Identify chart types", "Answer use questions", "Build a chart", "Interpret the chart", "Choose strongest evidence"];
  previousButton.disabled = index === 0;
  if (index === lessonSteps.length - 1) {
    nextButton.textContent = chartState.lessonFinished ? "Activity complete ✓" : "Finish activity ✓";
    nextButton.disabled = chartState.lessonFinished;
  } else {
    nextButton.textContent = `Next: ${nextNames[index]} →`;
    nextButton.disabled = false;
  }
}

function resetChartActivity() {
  chartState = defaultChartState();
  try { localStorage.removeItem(chartStorageKey); } catch {}
  window.history.replaceState(null, "", window.location.pathname);
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
setupIdentification();
setupMatching();
setupChartBuilder();
setupSentences();
updateClassProgress();
setupLessonNavigation();
document.querySelector("#resetChartActivityBtn").addEventListener("click", resetChartActivity);
