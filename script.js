
// =============================
// ACTIVITY SYSTEM
// =============================
const activityLevels = {
1:{start:"a",end:"s"},
2:{start:"a",end:"o"},
3:{start:"a",end:"h"},
4:{start:"a",end:"k"},
5:{start:"a",end:"h"},
6:{start:"a",end:"u"},
7:{start:"a",end:"r"},
8:{start:"a",end:"m"},
9:{start:"a",end:"o"},
10:{start:"a",end:"t"},
11:{start:"a",end:"p"},
12:{start:"a",end:"q"},
13:{start:"a",end:"q"},
14:{start:"a",end:"q"},
15:{start:"a",end:"n"},
16:{start:"a",end:"o"},
17:{start:"a",end:"i"},
18:{start:"a",end:"i"},
19:{start:"a",end:"r"},
20:{start:"a",end:"t"},
21:{start:"a",end:"s"},
22:{start:"a",end:"q"},
23:{start:"a",end:"p"},
24:{start:"a",end:"p"}
};

// =============================
// STORAGE
// =============================
let students = JSON.parse(localStorage.getItem("typingStudents")) || [];

// =============================
// DOM SAFE INIT
// =============================
let activitySelect;
let subLevelSelect;

// =============================
// INIT AFTER DOM LOAD
// =============================
window.addEventListener("DOMContentLoaded", () => {

activitySelect = document.getElementById("activity");

if(!activitySelect){
console.error("Missing #activity in HTML");
return;
}

// create sublevel dropdown safely
subLevelSelect = document.createElement("select");
subLevelSelect.id = "subLevelSelect";

activitySelect.parentNode.insertBefore(
subLevelSelect,
activitySelect.nextSibling
);

// populate activity dropdown
for(let i=1;i<=24;i++){
let opt = document.createElement("option");
opt.value = i;
opt.textContent = "Activity " + i;
activitySelect.appendChild(opt);
}

// events
activitySelect.addEventListener("change", updateSubLevel);

// initial load
updateSubLevel();

// render UI
renderAll();

});

// =============================
// SUBLEVEL GENERATION
// =============================
function updateSubLevel(){

if(!activitySelect || !subLevelSelect) return;

const activity = Number(activitySelect.value);
const level = activityLevels[activity];

if(!level) return;

subLevelSelect.innerHTML = "";

for(let i=level.start.charCodeAt(0); i<=level.end.charCodeAt(0); i++){

let letter = String.fromCharCode(i);

let opt = document.createElement("option");
opt.value = letter;
opt.textContent = letter;

subLevelSelect.appendChild(opt);

}

}

// =============================
// HELPERS
// =============================
function letterIndex(l){
return l.charCodeAt(0) - 97;
}

function safe(el){
return document.getElementById(el);
}

function now(){
return new Date().toLocaleString();
}

// =============================
// SAVE STUDENT (FIXED)
// =============================
function saveStudent(){

try{

const name = safe("studentName")?.value?.trim();
const grade = safe("studentGrade")?.value;
const activity = Number(activitySelect?.value);
const subLevel = subLevelSelect?.value || activityLevels[activity].start;

if(!name){
alert("Enter student name");
return;
}

let student = students.find(
s => s.name.toLowerCase() === name.toLowerCase()
);

if(!student){

students.push({
id: Date.now(),
name,
grade,
activity,
subLevel,
ninjaAttempts:[]
});

}else{

student.grade = grade;
student.activity = activity;
student.subLevel = subLevel;

}

save();

}catch(err){
console.error("saveStudent error:", err);
}

}

// =============================
// SAVE NINJA
// =============================
function saveNinja(){

const id = safe("ninjaStudent")?.value;
const wpm = Number(safe("wpm")?.value);
const accuracy = Number(safe("accuracy")?.value);

let student = students.find(s => s.id == id);
if(!student) return;

student.ninjaAttempts.push({
wpm,
accuracy,
time: now()
});

save();
}

// =============================
// PROGRESS
// =============================
function progress(s){

let total=0, done=0;

for(let i=1;i<=24;i++){

const lvl = activityLevels[i];
const start = letterIndex(lvl.start);
const end = letterIndex(lvl.end);

const size = end - start + 1;

total += size;

if(i < s.activity){
done += size;
}
else if(i === s.activity && s.subLevel){
  done += (letterIndex(s.subLevel) - start + 1);
}


}

return ((done / total) * 100).toFixed(1);
}

// =============================
// REMAINING
// =============================
function remaining(s){
return (100 - progress(s)).toFixed(1);
}

// =============================
// RENDER STUDENTS
// =============================
function renderStudents(){
  const tbody = safe("studentTable");
  if(!tbody) return;

  tbody.innerHTML = "";

  const search = safe("searchInput")?.value?.toLowerCase() || "";
  const gradeFilter = safe("gradeFilter")?.value || "All Grades";

  students
    .filter(s =>
      s.name.toLowerCase().includes(search) &&
      (gradeFilter === "All Grades" || s.grade === gradeFilter)
    )
    .forEach(s => {
      const lvl = activityLevels[s.activity];
      const isNinja = (s.activity === 24 && s.subLevel === activityLevels[24].end);

      if(isNinja){
        // Ninja Mode row
        tbody.innerHTML += `
          <tr class="border-b border-gray-500">
            <td class="px-3 py-2">${s.name}</td>
            <td class="px-3 py-2">${s.grade}</td>
            <td class="px-3 py-2">${progress(s)}%</td>
            <td class="px-3 py-2">${remaining(s)}%</td>
            <td class="px-3 py-2">
              🥷 Ninja Mode<br>
              <input type="number" id="wpm-${s.id}" placeholder="WPM"
                class="px-2 py-1 border border-gray-500 rounded bg-gray-100 dark_bg-gray-900"
                value="${s.ninjaAttempts.at(-1)?.wpm || ''}">
              <input type="number" id="acc-${s.id}" placeholder="Accuracy %"
                class="px-2 py-1 border border-gray-500 rounded bg-gray-100 dark_bg-gray-900"
                value="${s.ninjaAttempts.at(-1)?.accuracy || ''}">
              <button onclick="updateNinja('${s.id}')"
                class="mt-2 px-3 py-1 bg-blue-200 dark_bg-blue-700 hover_bg-blue-300 dark_hover_bg-blue-600 rounded shadow">
                Update Ninja
              </button>
            </td>
          </tr>
        `;
      } else {
        // Activity + Sublevel dropdowns
        let activityDropdown = `<select onchange="updateActivityDropdown('${s.id}', this.value)"
          class="px-2 py-1 border border-gray-500 rounded bg-gray-100 dark_bg-gray-900">`;
        for(let i=1;i<=24;i++){
          activityDropdown += `<option value="${i}" ${i===s.activity?"selected":""}>Activity ${i}</option>`;
        }
        activityDropdown += `</select>`;

        let subDropdown = `<select id="sub-${s.id}" onchange="updateSubLevelDropdown('${s.id}', this.value)"
          class="px-2 py-1 border border-gray-500 rounded bg-gray-100 dark_bg-gray-900">`;
        for(let i=lvl.start.charCodeAt(0); i<=lvl.end.charCodeAt(0); i++){
          let letter = String.fromCharCode(i);
          subDropdown += `<option value="${letter}" ${letter===s.subLevel?"selected":""}>${letter}</option>`;
        }
        subDropdown += `</select>`;

        tbody.innerHTML += `
          <tr class="border-b border-gray-500">
            <td class="px-3 py-2">${s.name}</td>
            <td class="px-3 py-2">${s.grade}</td>
            <td class="px-3 py-2">${progress(s)}%</td>
            <td class="px-3 py-2">${remaining(s)}%</td>
            <td class="px-3 py-2">${activityDropdown}<br>${subDropdown}</td>
          </tr>
        `;
      }
    });
}



// =============================
// NINJA DROPDOWN
// =============================
function renderNinjaDropdown(){

const sel = safe("ninjaStudent");
if(!sel) return;

sel.innerHTML = "";

students
.filter(s => s.activity === 24)
.forEach(s => {

let opt = document.createElement("option");
opt.value = s.id;
opt.textContent = `${s.name} (${s.grade})`;

sel.appendChild(opt);

});

}

// =============================
// SCORE
// =============================
function score(s){

if(!s.ninjaAttempts.length) return 0;

const last = s.ninjaAttempts.at(-1);

return (last.wpm * last.accuracy) / 100;

}

// =============================
// OVERALL LEADERBOARD
// =============================
function renderOverallLeaderboard(){

const board = safe("overallBoard");
if(!board) return;

board.innerHTML = "";

students
.filter(s => s.ninjaAttempts.length)
.sort((a,b) => score(b) - score(a))
.forEach(s => {

const last = s.ninjaAttempts.at(-1);

board.innerHTML += `
<li>${s.name} (${s.grade}) - ${last.wpm} WPM - ${last.accuracy}%</li>
`;

});

}

// =============================
// GRADE LEADERBOARD
// =============================
function renderGradeLeaderboard(){
  const grade = safe("leaderGrade")?.value;
  const board = safe("gradeBoard");
  if(!board) return;

  board.innerHTML = "";

  students
    .filter(s => s.grade === grade && (s.ninjaAttempts.length || s.activity > 0))
    .sort((a,b) => combinedScore(b) - combinedScore(a))
    .forEach(s => {
      const prog = progress(s);
      const ninja = s.ninjaAttempts.length
        ? (s.ninjaAttempts.at(-1).wpm * s.ninjaAttempts.at(-1).accuracy / 100).toFixed(1)
        : "No attempt";

      board.innerHTML += `
        <li>${s.name} - Progress: ${prog}% - Ninja: ${ninja}</li>
      `;
    });
}


// =============================
// IMPROVEMENT
// =============================
function renderImprovedLeaderboard(){
  const board = safe("improvedBoard");
  if(!board) return;

  board.innerHTML = "";

  let list = [];

  students.forEach(s => {
    let ninjaImprovement = 0;
    let activityImprovement = 0;

    // Ninja improvement (first vs last WPM)
    if(s.ninjaAttempts.length >= 2){
      const firstWpm = s.ninjaAttempts[0].wpm;
      const lastWpm = s.ninjaAttempts.at(-1).wpm;
      ninjaImprovement = lastWpm - firstWpm;
    }

    // Activity improvement (progress % difference)
    if(s.ninjaAttempts.length === 0){ // only consider activity if not in ninja mode
      const progNow = Number(progress(s));
      const progStart = s.activity > 1 ? 0 : progNow;
      activityImprovement = progNow - progStart;
    }

    if(ninjaImprovement !== 0 || activityImprovement !== 0){
      list.push({
        name: s.name,
        ninjaImprovement,
        activityImprovement
      });
    }
  });

  // sort by whichever improvement applies
  list.sort((a,b) => {
    const aImp = a.ninjaImprovement || a.activityImprovement;
    const bImp = b.ninjaImprovement || b.activityImprovement;
    return bImp - aImp;
  })
  .slice(0,3) // only top 3
  .forEach(i => {
    let display = i.name + " ";

    if(i.ninjaImprovement !== 0){
      display += `+${i.ninjaImprovement} WPM`;
    } else if(i.activityImprovement !== 0){
      display += `+${i.activityImprovement.toFixed(1)}%`;
    }

    board.innerHTML += `<li>${display}</li>`;
  });
}


// =============================
// DASHBOARD (FIXED)
// =============================
function renderDashboard(){
  safe("totalStudents").innerText = students.length;

  // Ninja ready count
  const ninjaReady = students.filter(
    s => s.activity === 24 && s.subLevel === activityLevels[24].end
  ).length;
  safe("ninjaReady").innerText = ninjaReady;

  // Average WPM (last attempt per student)
  let totalWpm = 0, wpmCount = 0;
  students.forEach(s => {
    if(s.ninjaAttempts.length){
      totalWpm += s.ninjaAttempts.at(-1).wpm;
      wpmCount++;
    }
  });
  safe("avgWpm").innerText = wpmCount ? (totalWpm / wpmCount).toFixed(1) : 0;

  // Average Progress (percentage across all students)
  let totalProg = 0;
  students.forEach(s => {
    totalProg += Number(progress(s));
  });
  const avgProg = students.length ? (totalProg / students.length).toFixed(1) : 0;
  safe("avgProgress").innerText = avgProg + "%";
}


// =============================
// SAVE
// =============================
function save(){

try{

localStorage.setItem("typingStudents", JSON.stringify(students));

renderAll();

}catch(e){
console.error("Save failed:", e);
}

}

// =============================
// MASTER RENDER
// =============================
function renderAll(){
  renderStudents();
  renderDashboard();
  renderOverallLeaderboard();
  renderGradeLeaderboard();
  renderImprovedLeaderboard();
  renderNinjaDropdown();
  renderCombinedScore(); // new
}

function resetStudents(){
  localStorage.removeItem("typingStudents");
  students = [];
  renderAll();
}
function toggleForm(id){
  const form = document.getElementById(id);
  if(form.style.display === "none"){
    form.style.display = "block";
  } else {
    form.style.display = "none";
  }
}
function updateStudentActivity(){
  const name = safe("updateName")?.value?.trim();
  const activity = Number(safe("updateActivity")?.value);

  if(!name || !activity){
    alert("Enter student name and activity");
    return;
  }

  let student = students.find(
    s => s.name.toLowerCase() === name.toLowerCase()
  );

  if(!student){
    alert("Student not found in selected grade");
    return;
  }

  student.activity = activity;
  student.subLevel = activityLevels[activity].start; // default sublevel
  save();
}



function showPage(id){
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  document.getElementById(id).style.display = 'block';
}
function populateStudentsByGrade(){
  const grade = safe("updateGrade")?.value;
  const list = safe("studentList");
  list.innerHTML = "";

  students
    .filter(s => s.grade === grade)
    .forEach(s => {
      let opt = document.createElement("option");
      opt.value = s.name;
      list.appendChild(opt);
    });
}
function combinedScore(s){
  const prog = Number(progress(s)); // activity progress %
  let ninja = 0;

  if(s.ninjaAttempts.length){
    const last = s.ninjaAttempts.at(-1);
    ninja = (last.wpm * last.accuracy) / 100;
  }

  // weight equally (you can adjust)
  return prog + ninja;
}
function openUpdateActivity(id){
  const student = students.find(s => s.id == id);
  if(!student) return;

  const newActivity = prompt(`Update activity for ${student.name} (current: ${student.activity})`, student.activity);
  if(!newActivity) return;

  const activityNum = Number(newActivity);
  if(activityNum < 1 || activityNum > 24){
    alert("Invalid activity number (must be 1–24)");
    return;
  }

  student.activity = activityNum;
  student.subLevel = activityLevels[activityNum].start; // reset sublevel
  save();
}
function updateActivityDropdown(id, newActivity){
  const student = students.find(s => s.id == id);
  if(!student) return;

  student.activity = Number(newActivity);

  // Reset sublevel dropdown with valid letters
  const lvl = activityLevels[student.activity];
  const subSelect = document.getElementById("sub-" + id);
  subSelect.innerHTML = "";
  for(let i=lvl.start.charCodeAt(0); i<=lvl.end.charCodeAt(0); i++){
    let letter = String.fromCharCode(i);
    let opt = document.createElement("option");
    opt.value = letter;
    opt.textContent = letter;
    subSelect.appendChild(opt);
  }
  student.subLevel = lvl.start; // default first letter
  save();
}

function updateSubLevelDropdown(id, newSub){
  const student = students.find(s => s.id == id);
  if(!student) return;

  student.subLevel = newSub;
  save();
}
function updateNinja(id){
  const student = students.find(s => s.id == id);
  if(!student) return;

  const wpm = Number(document.getElementById("wpm-" + id).value);
  const acc = Number(document.getElementById("acc-" + id).value);

  if(!wpm || !acc){
    alert("Enter both WPM and Accuracy");
    return;
  }

  student.ninjaAttempts.push({ wpm, accuracy: acc });
  save();
}
