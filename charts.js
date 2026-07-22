const chartStorageKey = "chartPracticeStateV1";
const chartLessons = {
  column: {
    title: "Vertical / column chart", shortTitle: "Column chart", start: 16, end: 54,
    purpose: "compare numerical values across separate categories",
    exampleQuestion: "Which category has the highest value?",
    questions: [
      { id: "purpose", prompt: "What is the best use of a vertical or column chart?", options: [["categories", "Compare values across categories"], ["distribution", "Show a numerical distribution"], ["correlation", "Look for correlation"]], correct: "categories", explanation: "Separate columns make category values easy to compare." },
      { id: "shape", prompt: "What should appear along the horizontal axis in this example?", options: [["categories", "Separate categories"], ["percentages", "Only percentages"], ["pairs", "Pairs of numerical variables"]], correct: "categories", explanation: "Each column belongs to one category on the horizontal axis." },
      { id: "gaps", prompt: "Should category columns normally have gaps between them?", options: [["yes", "Yes"], ["no", "No"]], correct: "yes", explanation: "Gaps show that the categories are separate rather than continuous ranges." }
    ]
  },
  horizontal: {
    title: "Horizontal bar chart", shortTitle: "Horizontal bars", start: 54, end: 73,
    purpose: "show a ranking and make long category labels easy to read",
    exampleQuestion: "What is the highest-to-lowest ranking?",
    questions: [
      { id: "purpose", prompt: "When is a horizontal bar chart especially useful?", options: [["ranking", "Showing a ranking"], ["time", "Showing change over time"], ["whole", "Showing one whole as slices"]], correct: "ranking", explanation: "Horizontal bars make a highest-to-lowest ranking easy to scan." },
      { id: "labels", prompt: "Why can horizontal bars help when category names are long?", options: [["space", "There is more room for labels"], ["touch", "The bars must touch"], ["connect", "The bars are connected"]], correct: "space", explanation: "Labels can sit beside the bars with more horizontal space." },
      { id: "order", prompt: "For a ranking, how should the bars usually be ordered?", options: [["ranked", "Highest to lowest or lowest to highest"], ["random", "Randomly"], ["time", "Only by date"]], correct: "ranked", explanation: "Sorting the bars reveals the ranking immediately." }
    ]
  },
  stacked: {
    title: "Stacked bar chart", shortTitle: "Stacked bars", start: 73, end: 113,
    purpose: "compare totals while also showing the parts inside each total",
    exampleQuestion: "Which total is largest, and how is it divided?",
    questions: [
      { id: "purpose", prompt: "What does a stacked bar chart show at the same time?", options: [["parts", "Totals and the parts inside them"], ["correlation", "Correlation between two variables"], ["distribution", "Only a distribution"]], correct: "parts", explanation: "The full bar shows the total and each colored segment shows one part." },
      { id: "segments", prompt: "What does each colored segment represent?", options: [["part", "A part of the category total"], ["date", "A date on a timeline"], ["bin", "A numerical range"]], correct: "part", explanation: "Segments divide each category total into meaningful parts." },
      { id: "compare", prompt: "Can stacked bars compare both total size and composition?", options: [["yes", "Yes"], ["no", "No"]], correct: "yes", explanation: "You can compare full bar lengths and the segments within them." }
    ]
  },
  histogram: {
    title: "Histogram", shortTitle: "Histogram", start: 113, end: 158,
    purpose: "show how numerical data is distributed across continuous ranges",
    exampleQuestion: "Which numerical range occurs most often?",
    questions: [
      { id: "purpose", prompt: "What is a histogram used to show?", options: [["distribution", "A numerical distribution"], ["ranking", "A category ranking"], ["whole", "Parts of one whole"]], correct: "distribution", explanation: "Histograms show how often numerical values fall into ranges." },
      { id: "touch", prompt: "Why do histogram bars normally touch?", options: [["continuous", "The numerical ranges are continuous"], ["decoration", "It is only decorative"], ["ranking", "The values are ranked"]], correct: "continuous", explanation: "One range continues directly into the next, so the bars touch." },
      { id: "axis", prompt: "What belongs along a histogram’s horizontal axis?", options: [["ranges", "Numerical ranges or bins"], ["names", "Unordered names"], ["percentOnly", "Only percentages"]], correct: "ranges", explanation: "The horizontal axis is divided into ordered numerical intervals." }
    ]
  },
  pie: {
    title: "Pie chart", shortTitle: "Pie chart", start: 158, end: 221,
    purpose: "show how one whole is divided into a small number of parts",
    exampleQuestion: "What percentage of the whole belongs to each part?",
    questions: [
      { id: "purpose", prompt: "What should all slices of a pie chart represent together?", options: [["whole", "One complete whole"], ["timeline", "A timeline"], ["correlation", "A correlation"]], correct: "whole", explanation: "Every slice is one part of the same complete whole." },
      { id: "total", prompt: "What should all pie-chart percentages add up to?", options: [["100", "100%"], ["50", "50%"], ["any", "Any unrelated total"]], correct: "100", explanation: "The complete circle represents 100% of the whole." },
      { id: "categories", prompt: "Is a pie chart clearest with a small number of meaningful slices?", options: [["yes", "Yes"], ["no", "No"]], correct: "yes", explanation: "Too many slices are difficult to compare and label clearly." }
    ]
  },
  scatter: {
    title: "Scatter chart", shortTitle: "Scatter chart", start: 221, end: 241,
    purpose: "look for a relationship or correlation between two numerical variables",
    exampleQuestion: "Do quiz scores tend to rise as study hours rise?",
    questions: [
      { id: "purpose", prompt: "What does a scatter chart help you investigate?", options: [["correlation", "A possible correlation"], ["whole", "Parts of one whole"], ["ranking", "A simple ranking"]], correct: "correlation", explanation: "The pattern of points can reveal a relationship between two variables." },
      { id: "point", prompt: "What does one point represent?", options: [["pair", "A pair of numerical values"], ["slice", "A percentage slice"], ["total", "A stacked total"]], correct: "pair", explanation: "Each point has one x-value and one y-value." },
      { id: "connect", prompt: "Should scatter points normally be connected in time order?", options: [["no", "No"], ["yes", "Yes"]], correct: "no", explanation: "Scatter points show paired observations, not a time sequence." }
    ]
  },
  line: {
    title: "Line chart", shortTitle: "Line chart", start: 241, end: 269,
    purpose: "show change over time or another meaningful ordered sequence",
    exampleQuestion: "How did the value change from one time period to the next?",
    questions: [
      { id: "purpose", prompt: "What is the best use of a line chart?", options: [["time", "Show change over time"], ["whole", "Show parts of one whole"], ["distribution", "Group values into ranges"]], correct: "time", explanation: "Connected points make a trend across time easy to follow." },
      { id: "order", prompt: "Why are the points connected?", options: [["sequence", "They follow a meaningful order"], ["categories", "They are unrelated categories"], ["slices", "They form a whole"]], correct: "sequence", explanation: "The line connects consecutive positions in an ordered sequence." },
      { id: "unordered", prompt: "Is a line chart usually the best choice for unrelated categories such as favorite colors?", options: [["no", "No"], ["yes", "Yes"]], correct: "no", explanation: "A bar chart is clearer for unrelated categories because a line suggests continuity." }
    ]
  }
};
const chartLessonOrder = ["column", "horizontal", "stacked", "histogram", "pie", "scatter", "line"];
const lessonSteps = chartLessonOrder.flatMap(key => [
  { id: `${key}-learn`, name: `Learn: ${chartLessons[key].shortTitle}`, screen: "microLearn", chartKey: key, phase: "learn" },
  { id: `${key}-check`, name: `Check: ${chartLessons[key].shortTitle}`, screen: "microCheck", chartKey: key, phase: "check" }
]).concat([
  { id: "builder", name: "Build a chart", screen: "builder" },
  { id: "interpret", name: "Interpret the chart", screen: "interpret" },
  { id: "evidence", name: "Highlight strong evidence", screen: "evidence" }
]);
const builderChartTypes = ["bar", "horizontalBar", "stackedBar", "histogram", "pie", "scatter", "line"];
const sentenceKeys = ["pattern", "comparison", "outlier", "conclusion"];
const chartColors = ["#3157d5", "#2c7f8f", "#df8a3d", "#7b61b3", "#3b9b68", "#c85367", "#6b7280", "#a66b2b"];

function defaultChartState() {
  return {
    lessonViewed: {},
    videoWatched: {},
    videoWatchSeconds: {},
    lessonAnswers: {},
    lessonChecks: {},
    currentStep: "column-learn",
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
let segmentPlayer = null;
let segmentWatchTimer = null;
let activeVideoChartKey = null;
let lastVideoTime = null;

function loadChartState() {
  try {
    const saved = JSON.parse(localStorage.getItem(chartStorageKey));
    if (!saved || typeof saved !== "object") return;
    const defaults = defaultChartState();
    chartState = {
      ...defaults,
      ...saved,
      lessonViewed: saved.lessonViewed && typeof saved.lessonViewed === "object" ? saved.lessonViewed : {},
      videoWatched: saved.videoWatched && typeof saved.videoWatched === "object" ? saved.videoWatched : {},
      videoWatchSeconds: saved.videoWatchSeconds && typeof saved.videoWatchSeconds === "object" ? saved.videoWatchSeconds : {},
      lessonAnswers: saved.lessonAnswers && typeof saved.lessonAnswers === "object" ? saved.lessonAnswers : {},
      lessonChecks: saved.lessonChecks && typeof saved.lessonChecks === "object" ? saved.lessonChecks : {},
      chartType: builderChartTypes.includes(saved.chartType) ? saved.chartType : defaults.chartType,
      currentStep: lessonSteps.some(step => step.id === saved.currentStep) ? saved.currentStep : defaults.currentStep,
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
  const completedChecks = chartLessonOrder.filter(key => chartState.lessonChecks[key]).length;
  const completedActivities = completedChecks
    + Number(chartState.chartCreated)
    + Number(sentenceKeys.every(key => chartState.sentences[key].trim().length >= 10))
    + Number(Boolean(chartState.strongest && chartState.sentences[chartState.strongest]?.trim()));
  document.body.dataset.completedActivities = String(completedActivities);
}

function loadYouTubeApi() {
  if (window.YT?.Player) return initializeCurrentSegmentPlayer();
  if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return;
  const script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
}

window.onYouTubeIframeAPIReady = initializeCurrentSegmentPlayer;

function initializeCurrentSegmentPlayer() {
  const step = lessonSteps.find(item => item.id === chartState.currentStep);
  if (!step || step.phase !== "learn" || !window.YT?.Player) return;
  initializeSegmentPlayer(step.chartKey);
}

function initializeSegmentPlayer(chartKey) {
  if (activeVideoChartKey !== chartKey || !document.querySelector("#segmentVideo")) return;
  const lesson = chartLessons[chartKey];
  segmentPlayer = new YT.Player("segmentVideo", {
    width: "100%",
    height: "100%",
    videoId: "o7F-tbBl_hA",
    playerVars: { start: lesson.start, end: lesson.end, rel: 0, modestbranding: 1, playsinline: 1 },
    events: {
      onReady: updateVideoWatchStatus,
      onStateChange: event => {
        if (event.data === YT.PlayerState.PLAYING) startSegmentWatchTracking(chartKey);
        else stopSegmentWatchTracking();
        if (event.data === YT.PlayerState.ENDED) recordSegmentWatchProgress(chartKey);
      }
    }
  });
}

function startSegmentWatchTracking(chartKey) {
  stopSegmentWatchTracking();
  lastVideoTime = null;
  segmentWatchTimer = window.setInterval(() => recordSegmentWatchProgress(chartKey), 500);
}

function stopSegmentWatchTracking() {
  if (segmentWatchTimer) window.clearInterval(segmentWatchTimer);
  segmentWatchTimer = null;
  lastVideoTime = null;
}

function recordSegmentWatchProgress(chartKey) {
  if (!segmentPlayer?.getCurrentTime || activeVideoChartKey !== chartKey || chartState.videoWatched[chartKey]) return;
  const lesson = chartLessons[chartKey];
  const currentTime = Number(segmentPlayer.getCurrentTime());
  if (lastVideoTime !== null) {
    const delta = currentTime - lastVideoTime;
    if (delta > 0 && delta <= 1.5 && currentTime >= lesson.start - 1 && currentTime <= lesson.end + 1) {
      const duration = lesson.end - lesson.start;
      chartState.videoWatchSeconds[chartKey] = Math.min(duration, Number(chartState.videoWatchSeconds[chartKey] || 0) + delta);
      if (chartState.videoWatchSeconds[chartKey] >= requiredWatchSeconds(chartKey)) {
        chartState.videoWatched[chartKey] = true;
        stopSegmentWatchTracking();
      }
      saveChartState();
      updateVideoWatchStatus();
    }
  }
  lastVideoTime = currentTime;
}

function requiredWatchSeconds(chartKey) {
  return Math.max(1, (chartLessons[chartKey].end - chartLessons[chartKey].start) * .8);
}

function updateVideoWatchStatus() {
  const status = document.querySelector("#videoWatchStatus");
  if (!status || !activeVideoChartKey) return;
  if (!chartState.videoWatched[activeVideoChartKey]
      && Number(chartState.videoWatchSeconds[activeVideoChartKey] || 0) >= requiredWatchSeconds(activeVideoChartKey)) {
    chartState.videoWatched[activeVideoChartKey] = true;
    saveChartState();
  }
  const watched = chartState.videoWatched[activeVideoChartKey];
  const required = Math.ceil(requiredWatchSeconds(activeVideoChartKey));
  const seconds = Math.min(required, Math.floor(Number(chartState.videoWatchSeconds[activeVideoChartKey] || 0)));
  status.textContent = watched ? "Video complete ✓ You may continue." : `Video required · ${seconds} of ${required} seconds watched.`;
  status.classList.toggle("complete", Boolean(watched));
}

function destroySegmentPlayer() {
  stopSegmentWatchTracking();
  if (segmentPlayer?.destroy) {
    try { segmentPlayer.destroy(); } catch {}
  }
  segmentPlayer = null;
}

function renderMicroLearn(chartKey, stepIndex) {
  const lesson = chartLessons[chartKey];
  destroySegmentPlayer();
  activeVideoChartKey = chartKey;
  document.querySelector("#microLearnStep").textContent = `Step ${stepIndex + 1} of ${lessonSteps.length} · Learn`;
  document.querySelector("#microLearnTitle").textContent = lesson.title;
  document.querySelector("#examplePanelTitle").textContent = `${lesson.title} example`;
  document.querySelector("#microPurpose").textContent = lesson.purpose;
  document.querySelector("#microQuestion").textContent = lesson.exampleQuestion;
  document.querySelector("#microExample").innerHTML = microExampleMarkup(chartKey);
  document.querySelector("#microVideoTime").textContent = `${formatTimestamp(lesson.start)}–${formatTimestamp(lesson.end)}`;
  document.querySelector("#segmentVideoFrame").innerHTML = '<div id="segmentVideo"></div>';
  updateVideoWatchStatus();
  if (window.YT?.Player) initializeSegmentPlayer(chartKey);
  const videoLink = document.querySelector("#segmentVideoLink");
  videoLink.href = `https://www.youtube.com/watch?v=o7F-tbBl_hA&t=${lesson.start}s`;
  videoLink.textContent = `Open the ${formatTimestamp(lesson.start)} segment on YouTube`;
}

function renderMicroCheck(chartKey, stepIndex) {
  const lesson = chartLessons[chartKey];
  const savedAnswers = chartState.lessonAnswers[chartKey] || {};
  document.querySelector("#microCheckStep").textContent = `Step ${stepIndex + 1} of ${lessonSteps.length} · Check your understanding`;
  document.querySelector("#microCheckTitle").textContent = `${lesson.title}: three quick questions`;
  const list = document.querySelector("#microQuestionList");
  list.innerHTML = lesson.questions.map((question, index) => `
    <fieldset class="micro-question-card" data-micro-card="${question.id}">
      <legend><span>${index + 1}</span>${escapeHtml(question.prompt)}</legend>
      <div class="micro-options">${question.options.map(([value, label]) => `
        <label><input type="radio" name="${chartKey}-${question.id}" data-micro-question="${question.id}" value="${value}"${savedAnswers[question.id] === value ? " checked" : ""}> <span>${escapeHtml(label)}</span></label>`).join("")}
      </div>
      <p class="micro-answer-feedback" aria-live="polite"></p>
    </fieldset>`).join("");
  list.querySelectorAll("[data-micro-question]").forEach(radio => radio.addEventListener("change", () => {
    chartState.lessonAnswers[chartKey] = { ...(chartState.lessonAnswers[chartKey] || {}), [radio.dataset.microQuestion]: radio.value };
    chartState.lessonChecks[chartKey] = false;
    const card = radio.closest(".micro-question-card");
    card.classList.remove("correct", "incorrect");
    card.querySelector(".micro-answer-feedback").textContent = "";
    const result = document.querySelector("#microCheckResult");
    result.textContent = "";
    result.className = "result";
    saveChartState();
    updateClassProgress();
  }));
  if (chartState.lessonChecks[chartKey]) checkMicroQuestions(chartKey);
}

function checkMicroQuestions(chartKey) {
  const lesson = chartLessons[chartKey];
  const answers = chartState.lessonAnswers[chartKey] || {};
  let score = 0;
  lesson.questions.forEach(question => {
    const card = document.querySelector(`[data-micro-card="${question.id}"]`);
    const isCorrect = answers[question.id] === question.correct;
    card.classList.toggle("correct", isCorrect);
    card.classList.toggle("incorrect", !isCorrect);
    card.querySelector(".micro-answer-feedback").textContent = !answers[question.id]
      ? "Choose an answer."
      : `${isCorrect ? "Correct." : "Try again."} ${question.explanation}`;
    if (isCorrect) score += 1;
  });
  const passed = score === lesson.questions.length;
  chartState.lessonChecks[chartKey] = passed;
  saveChartState();
  updateClassProgress();
  const result = document.querySelector("#microCheckResult");
  result.textContent = passed ? `Excellent—you understand the ${lesson.title.toLowerCase()}.` : `${score} of ${lesson.questions.length} correct. Review the feedback and try again.`;
  result.className = `result ${passed ? "success" : "warning"}`;
  return passed;
}

function microExampleMarkup(chartKey) {
  const examples = {
    column: `<svg class="micro-svg" viewBox="0 0 480 300" role="img" aria-label="Column chart comparing books read by four classes"><text x="240" y="25" text-anchor="middle">Books read by class</text><line x1="58" y1="250" x2="450" y2="250"/><line x1="58" y1="48" x2="58" y2="250"/><g class="blue-fill"><rect x="90" y="160" width="52" height="90"/><rect x="180" y="105" width="52" height="145"/><rect x="270" y="135" width="52" height="115"/><rect x="360" y="72" width="52" height="178"/></g><g class="axis-label"><text x="116" y="273">9A</text><text x="206" y="273">9B</text><text x="296" y="273">9C</text><text x="386" y="273">9D</text></g></svg>`,
    horizontal: `<svg class="micro-svg" viewBox="0 0 480 300" role="img" aria-label="Horizontal bar chart ranking four school clubs"><text x="240" y="25" text-anchor="middle">Most popular clubs</text><g class="teal-fill"><rect x="130" y="58" width="285" height="34"/><rect x="130" y="112" width="220" height="34"/><rect x="130" y="166" width="160" height="34"/><rect x="130" y="220" width="105" height="34"/></g><g class="left-label"><text x="120" y="80">Robotics</text><text x="120" y="134">Art</text><text x="120" y="188">Chess</text><text x="120" y="242">Drama</text></g></svg>`,
    stacked: `<svg class="micro-svg" viewBox="0 0 480 300" role="img" aria-label="Stacked bars comparing completed and remaining tasks"><text x="240" y="25" text-anchor="middle">Project tasks</text><line x1="55" y1="250" x2="450" y2="250"/><g><rect x="92" y="118" width="62" height="132" fill="#3157d5"/><rect x="92" y="72" width="62" height="46" fill="#df8a3d"/><rect x="208" y="145" width="62" height="105" fill="#3157d5"/><rect x="208" y="96" width="62" height="49" fill="#df8a3d"/><rect x="324" y="92" width="62" height="158" fill="#3157d5"/><rect x="324" y="60" width="62" height="32" fill="#df8a3d"/></g><g class="axis-label"><text x="123" y="273">A</text><text x="239" y="273">B</text><text x="355" y="273">C</text></g></svg>`,
    histogram: `<svg class="micro-svg" viewBox="0 0 480 300" role="img" aria-label="Histogram of quiz score ranges"><text x="240" y="25" text-anchor="middle">Quiz score distribution</text><line x1="55" y1="250" x2="450" y2="250"/><g class="blue-fill"><rect x="75" y="205" width="72" height="45"/><rect x="147" y="150" width="72" height="100"/><rect x="219" y="75" width="72" height="175"/><rect x="291" y="115" width="72" height="135"/><rect x="363" y="185" width="72" height="65"/></g><g class="small-label"><text x="111" y="273">50–59</text><text x="183" y="273">60–69</text><text x="255" y="273">70–79</text><text x="327" y="273">80–89</text><text x="399" y="273">90–99</text></g></svg>`,
    pie: `<div class="micro-pie-wrap" role="img" aria-label="Pie chart showing how class time is divided"><h4>Class time</h4><div class="micro-pie"></div><div class="micro-legend"><span><i class="practice"></i>Practice 50%</span><span><i class="discussion"></i>Discussion 30%</span><span><i class="reflection"></i>Reflection 20%</span></div></div>`,
    scatter: `<svg class="micro-svg" viewBox="0 0 480 300" role="img" aria-label="Scatter chart comparing study hours and quiz scores"><text x="240" y="25" text-anchor="middle">Study time and quiz score</text><line x1="65" y1="250" x2="445" y2="250"/><line x1="65" y1="48" x2="65" y2="250"/><g class="orange-fill"><circle cx="102" cy="220" r="8"/><circle cx="145" cy="195" r="8"/><circle cx="195" cy="202" r="8"/><circle cx="245" cy="155" r="8"/><circle cx="310" cy="132" r="8"/><circle cx="365" cy="84" r="8"/><circle cx="410" cy="68" r="8"/></g><text class="axis-title" x="255" y="285">Study hours</text><text class="axis-title" transform="translate(22 180) rotate(-90)">Quiz score</text></svg>`,
    line: `<svg class="micro-svg" viewBox="0 0 480 300" role="img" aria-label="Line chart showing temperature from Monday to Friday"><text x="240" y="25" text-anchor="middle">Temperature by day</text><line x1="60" y1="250" x2="450" y2="250"/><line x1="60" y1="48" x2="60" y2="250"/><polyline points="92,205 175,152 258,170 341,95 424,68" fill="none" stroke="#2c7f8f" stroke-width="7"/><g class="orange-fill"><circle cx="92" cy="205" r="8"/><circle cx="175" cy="152" r="8"/><circle cx="258" cy="170" r="8"/><circle cx="341" cy="95" r="8"/><circle cx="424" cy="68" r="8"/></g><g class="axis-label"><text x="92" y="274">Mon</text><text x="175" y="274">Tue</text><text x="258" y="274">Wed</text><text x="341" y="274">Thu</text><text x="424" y="274">Fri</text></g></svg>`
  };
  return examples[chartKey];
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
    if (!validateLessonStep(lessonSteps[currentIndex])) return;
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

function validateLessonStep(step) {
  const message = document.querySelector("#navigationMessage");
  message.textContent = "";
  if (step.phase === "learn" && !chartState.videoWatched[step.chartKey]) {
    message.textContent = "Watch the complete video segment before continuing.";
    updateVideoWatchStatus();
    return false;
  }
  if (step.phase === "learn") chartState.lessonViewed[step.chartKey] = true;
  if (step.phase === "check" && !checkMicroQuestions(step.chartKey)) {
    message.textContent = "Correct all three answers before continuing.";
    return false;
  }
  if (step.id === "builder" && !chartState.chartCreated) {
    showChartMessage("Create the chart and check its title, labels, and values before continuing.", "warning");
    message.textContent = "Create or update your chart first.";
    return false;
  }
  if (step.id === "interpret" && !sentenceKeys.every(key => chartState.sentences[key].trim().length >= 10)) {
    message.textContent = "Write all four evidence sentences before continuing.";
    return false;
  }
  if (step.id === "evidence" && !(chartState.strongest && chartState.sentences[chartState.strongest]?.trim())) {
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
  document.querySelectorAll("[data-lesson-screen]").forEach(section => {
    section.hidden = section.dataset.lessonScreen !== active.screen;
  });
  if (active.phase === "learn") renderMicroLearn(active.chartKey, safeIndex);
  else if (active.phase === "check") renderMicroCheck(active.chartKey, safeIndex);
  else destroySegmentPlayer();
  chartState.currentStep = active.id;
  saveChartState();
  document.querySelector("#navigationMessage").textContent = `Step ${safeIndex + 1} of ${lessonSteps.length} · Your work saves automatically.`;
  updateLessonNavigation(safeIndex);
  const nextUrl = `${window.location.pathname}#${active.id}`;
  if (historyMode === "push") window.history.pushState({ chartStep: active.id }, "", nextUrl);
  if (historyMode === "replace") window.history.replaceState({ chartStep: active.id }, "", nextUrl);
  if (scroll) document.querySelector(".chart-main").scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateLessonNavigation(index) {
  const previousButton = document.querySelector("#previousStepBtn");
  const nextButton = document.querySelector("#nextStepBtn");
  previousButton.disabled = index === 0;
  if (index === lessonSteps.length - 1) {
    nextButton.textContent = chartState.lessonFinished ? "Activity complete ✓" : "Finish activity ✓";
    nextButton.disabled = chartState.lessonFinished;
  } else {
    const current = lessonSteps[index];
    const next = lessonSteps[index + 1];
    if (current.phase === "learn") nextButton.textContent = "Next: Answer 3 questions →";
    else if (current.phase === "check" && next.phase === "learn") nextButton.textContent = `Next: Learn ${chartLessons[next.chartKey].shortTitle} →`;
    else nextButton.textContent = `Next: ${next.name} →`;
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
function formatTimestamp(seconds) { return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`; }
function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

loadChartState();
loadYouTubeApi();
setupChartBuilder();
setupSentences();
updateClassProgress();
setupLessonNavigation();
document.querySelector("#resetChartActivityBtn").addEventListener("click", resetChartActivity);
