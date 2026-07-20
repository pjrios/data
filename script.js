const originalRows = [
  { student: "Ana", time: "30 min", subject: "Math" },
  { student: "Luis", time: "", subject: "Science" },
  { student: "Carlos", time: "900 hours", subject: "English" },
  { student: "Ana", time: "30 min", subject: "Math" },
  { student: "Sofía", time: "45", subject: "Scince" },
  { student: "Mateo", time: "60 minutes", subject: "P.E." },
  { student: "Isabella", time: "-20 min", subject: "Art" },
  { student: "Diego", time: "1 hour", subject: "math" },
  { student: "Valeria", time: "25 min", subject: "Social Studys" },
  { student: "Andrés", time: "40", subject: "Technology" },
  { student: "Camila", time: "50 min", subject: "Spanish" },
  { student: "José", time: "35 min", subject: "English" }
];

const problemRows = [2, 3, 4, 5, 7, 8, 9, 10];
let rows = structuredClone(originalRows);
let changes = [];
let selectedIssues = {};

const tbody = document.querySelector("#dataTable tbody");
const logBody = document.querySelector("#logTable tbody");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const result = document.querySelector("#result");

function renderTable() {
  tbody.innerHTML = "";
  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    const tr = document.createElement("tr");
    tr.dataset.tableRow = rowNumber;
    if (changes.some(change => change.row === rowNumber)) tr.classList.add("changed");
    tr.innerHTML = `
      <td>${rowNumber}</td>
      <td><input type="text" value="${escapeHtml(row.student)}" data-row="${index}" data-key="student" aria-label="Student row ${rowNumber}"></td>
      <td><input type="text" value="${escapeHtml(row.time)}" data-row="${index}" data-key="time" aria-label="Study time row ${rowNumber}"></td>
      <td><input type="text" value="${escapeHtml(row.subject)}" data-row="${index}" data-key="subject" aria-label="Favorite subject row ${rowNumber}"></td>
      <td><select data-issue-row="${index}" aria-label="Issue found row ${rowNumber}">
        <option value="">Choose an issue</option>
        ${["Blank cell","Repeated answer","Impossible number","Spelling difference","Missing unit","Format difference","No problem"].map(issue => `<option${selectedIssues[rowIndexKey(index)] === issue ? " selected" : ""}>${issue}</option>`).join("")}
      </select></td>
      <td><button type="button" data-save-row="${index}">${changes.some(c => c.row === rowNumber) ? "Update" : "Save"}</button></td>`;
    tbody.appendChild(tr);
  });

  document.querySelectorAll("[data-save-row]").forEach(button => button.addEventListener("click", saveRow));
  updateProgress();
}

function preserveDraft(event) {
  const target = event.target;
  if (target.matches("[data-row]")) {
    rows[Number(target.dataset.row)][target.dataset.key] = target.value;
  }
  if (target.matches("[data-issue-row]")) {
    selectedIssues[rowIndexKey(Number(target.dataset.issueRow))] = target.value;
  }
}

function saveRow(event) {
  const rowIndex = Number(event.currentTarget.dataset.saveRow);
  const rowNumber = rowIndex + 1;
  const issue = document.querySelector(`[data-issue-row="${rowIndex}"]`).value;
  if (!issue) return showMessage("Choose the issue you found before saving.", "warning");

  const current = rows[rowIndex];
  const original = originalRows[rowIndex];
  const updates = [];
  ["student", "time", "subject"].forEach(key => {
    if (current[key].trim() !== original[key].trim()) {
      updates.push({ row: rowNumber, column: labelFor(key), original: original[key] || "(blank)", updated: current[key].trim() || "(blank)", reason: issue });
    }
  });

  if (issue === "Repeated answer" && updates.length === 0) {
    updates.push({ row: rowNumber, column: "Entire row", original: `${current.student}, ${current.time}, ${current.subject}`, updated: "Marked as repeated", reason: issue });
  }
  if (updates.length === 0) return showMessage("Edit at least one value, or mark a repeated row.", "warning");

  changes = changes.filter(change => change.row !== rowNumber);
  changes.push(...updates);
  const tr = document.querySelector(`[data-table-row="${rowNumber}"]`);
  tr.classList.add("changed");
  event.currentTarget.textContent = "Update";
  renderLog();
  updateProgress();
  showMessage(`Row ${rowNumber} was recorded. Your other unfinished edits were kept.`, "success");
}

function renderLog() {
  logBody.innerHTML = "";
  if (!changes.length) {
    logBody.innerHTML = '<tr class="empty-row"><td colspan="5">No changes recorded yet.</td></tr>';
    return;
  }
  [...changes].sort((a,b) => a.row-b.row).forEach(change => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${change.row}</td><td>${escapeHtml(change.column)}</td><td>${escapeHtml(change.original)}</td><td>${escapeHtml(change.updated)}</td><td>${escapeHtml(change.reason)}</td>`;
    logBody.appendChild(tr);
  });
}

function updateProgress() {
  const corrected = new Set(changes.map(change => change.row));
  const count = problemRows.filter(row => corrected.has(row)).length;
  progressText.textContent = `${count} of ${problemRows.length} problem rows recorded.`;
  progressBar.style.width = `${(count / problemRows.length) * 100}%`;
}

function checkWork() {
  const checked = [...document.querySelectorAll('.check-grid input[type="checkbox"]')].filter(box => box.checked).length;
  const reflection = document.querySelector("#reflection").value.trim();
  const questions = [...document.querySelectorAll("[data-question]")].filter(q => q.value.trim().length >= 10).length;
  const changedRows = new Set(changes.map(change => change.row));
  const allLogged = problemRows.every(row => changedRows.has(row));

  if (allLogged && checked === 5 && reflection.length >= 10 && questions === 3) {
    showMessage("Excellent work! You cleaned and documented eight problem rows, answered the data-care questions, and completed the teamwork reflection.", "success");
  } else {
    const needs = [];
    if (!allLogged) needs.push("record all eight problem rows");
    if (questions < 3) needs.push("answer all three data-care questions");
    if (checked < 5) needs.push("complete every teamwork statement");
    if (reflection.length < 10) needs.push("write the final reflection");
    showMessage(`Almost finished: ${needs.join(", ")}.`, "warning");
  }
}

function resetActivity() {
  rows = structuredClone(originalRows);
  changes = [];
  selectedIssues = {};
  document.querySelectorAll('input[type="checkbox"]').forEach(box => box.checked = false);
  document.querySelectorAll("textarea").forEach(area => area.value = "");
  result.textContent = "";
  result.className = "result";
  renderLog();
  renderTable();
}

function rowIndexKey(index) { return String(index); }
function labelFor(key) { return { student: "Student", time: "Study Time", subject: "Favorite Subject" }[key]; }
function escapeHtml(value) { return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"); }
function showMessage(message, type) { result.textContent = message; result.className = `result ${type}`; }

tbody.addEventListener("input", preserveDraft);
tbody.addEventListener("change", preserveDraft);
renderTable();
renderLog();
document.querySelector("#checkBtn").addEventListener("click", checkWork);
document.querySelector("#resetBtn").addEventListener("click", resetActivity);
