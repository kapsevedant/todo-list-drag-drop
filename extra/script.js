// Load todos
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";
let dragged = null; // {type:'todo'|'sub', pid?, id}

const listEl = document.getElementById("list");
const saveTodos = () => localStorage.setItem("todos", JSON.stringify(todos));
const makeId = () => Date.now() + Math.random().toString().slice(2, 6);

// ================= RENDER =================
function render() {
  let visible = todos.filter(t => {
    if (currentFilter === "all") return true;
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "completed") return t.done;
  });

  if (visible.length === 0) {
    listEl.innerHTML = `<div>No Items are present</div>`;
  } else {
    listEl.innerHTML = visible.map(todoTemplate).join("");
  }

  document.getElementById("count").innerText =
    todos.filter(t => !t.done).length + " items left";

  document.querySelectorAll(".filters button").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.f === currentFilter)
  );
}

// ================= TEMPLATE =================
function todoTemplate(todo) {
  return `
<li class="todo-item" data-id="${todo.id}">
  <div class="todo-row" draggable="true" data-type="todo" data-id="${todo.id}">
    <input type="checkbox" ${todo.done ? "checked" : ""} onclick="toggleTodo('${todo.id}')">
    <span>${todo.text}</span>
    <button onclick="addSub('${todo.id}')">＋</button>
    <button onclick="deleteTodo('${todo.id}')">✕</button>
  </div>

  <ul class="sub-list" data-parent="${todo.id}">
    ${todo.subs.map(sub => `
      <li>
        <div class="todo-row sub" draggable="true" data-type="sub" data-pid="${todo.id}" data-id="${sub.id}">
          <input type="checkbox" ${sub.done ? "checked" : ""} onclick="toggleSub('${todo.id}','${sub.id}')">
          <span>${sub.text}</span>
          <button onclick="deleteSub('${todo.id}','${sub.id}')">✕</button>
        </div>
      </li>
    `).join("")}
  </ul>
</li>`;
}

// ================= TODO ACTIONS =================
function toggleTodo(id) {
  let todo = todos.find(t => t.id === id);
  todo.done = !todo.done;
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

function addSub(id) {
  let text = prompt("Subtask:");
  if (!text) return;
  todos.find(t => t.id === id).subs.push({ id: makeId(), text, done: false });
  saveTodos(); render();
}

function toggleSub(pid, sid) {
  let sub = todos.find(t => t.id === pid).subs.find(s => s.id === sid);
  sub.done = !sub.done;
  saveTodos();
  render();
}

function deleteSub(pid, sid) {
  let p = todos.find(t => t.id === pid);
  p.subs = p.subs.filter(s => s.id !== sid);
  saveTodos(); render();
}

// ================= ADD TODO =================
document.getElementById("new-todo").onkeydown = e => {
  if (e.key === "Enter" && e.target.value.trim()) {
    todos.push({ id: makeId(), text: e.target.value, done: false, subs: [] });
    e.target.value = "";
    saveTodos(); render();
  }
};

// ================= FILTERS =================
document.querySelectorAll(".filters button").forEach(btn => {
  btn.onclick = () => { currentFilter = btn.dataset.f; render(); };
});

// ================= CLEAR DONE =================
// function clearDone() {
//   todos = todos.map(t => ({ ...t, subs: t.subs.filter(s => s.done === true) }))
//                .filter(t => t.done === true);
//   saveTodos();
//   render();
// }

// ================= SHARED DROP LOGIC =================
function handleDrop(targetEl) {
  if (!dragged) return;

  const todoRow = targetEl.closest(".todo-row[data-type='todo']");
  const subList = targetEl.closest(".sub-list");

  // ===== SUB -> ANOTHER PARENT TODO =====
  if (dragged.type === "sub" && (todoRow || subList)) {
    let newParentId = (todoRow && todoRow.dataset.id) || (subList && subList.dataset.parent);
    if (!newParentId || newParentId === dragged.pid) return;

    let oldParent = todos.find(t => t.id === dragged.pid);
    let subItem = oldParent.subs.find(s => s.id === dragged.id);
    oldParent.subs = oldParent.subs.filter(s => s.id !== dragged.id);
    todos.find(t => t.id === newParentId).subs.push(subItem);
  }

  // ===== TODO REORDER =====
  if (dragged.type === "todo" && todoRow) {
    let targetId = todoRow.dataset.id;
    if (targetId === dragged.id) return;

    let from = todos.findIndex(t => t.id === dragged.id);
    let to = todos.findIndex(t => t.id === targetId);
    let item = todos.splice(from, 1)[0];
    todos.splice(to, 0, item);
  }

  dragged = null;
  saveTodos();
  render();
}

// ================= MOUSE DRAG & DROP =================

document.addEventListener("dragstart", e => {
  let row = e.target.closest(".todo-row");
  if (!row) return;

  dragged = {
    type: row.dataset.type,
    id: row.dataset.id,
    pid: row.dataset.pid || null
  };

  row.classList.add("dragging");
});

document.addEventListener("dragend", e => {
  let row = e.target.closest(".todo-row");
  if (row) row.classList.remove("dragging");
  dragged = null;
});

listEl.addEventListener("dragover", e => {
  e.preventDefault();
});

document.addEventListener("drop", e => {
  handleDrop(e.target);
});

// ================= TOUCH DRAG & DROP =================

let touchGhost = null;      // floating clone shown while dragging
let touchSourceRow = null;  // the original row element
let touchMoved = false;     // distinguish tap vs drag

function createGhost(row) {
  const ghost = row.cloneNode(true);
  const rect = row.getBoundingClientRect();

  ghost.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    width: ${rect.width}px;
    opacity: 0.75;
    pointer-events: none;
    z-index: 9999;
    background: #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    border-radius: 6px;
  `;

  document.body.appendChild(ghost);
  return ghost;
}

function cleanupTouch() {
  if (touchGhost) { touchGhost.remove(); touchGhost = null; }
  if (touchSourceRow) touchSourceRow.classList.remove("dragging");
  document.querySelectorAll(".todo-row.drop-target").forEach(r =>
    r.classList.remove("drop-target")
  );
  touchSourceRow = null;
  touchMoved = false;
  dragged = null;
}

document.addEventListener("touchstart", e => {
  const row = e.target.closest(".todo-row");
  // Let taps on buttons/checkboxes work normally
  if (!row || e.target.closest("button, input, a")) return;

  touchMoved = false;
  touchSourceRow = row;

  // Wait briefly before committing to a drag, so taps still feel instant
  touchSourceRow._touchTimer = setTimeout(() => {
    dragged = {
      type: row.dataset.type,
      id: row.dataset.id,
      pid: row.dataset.pid || null
    };
    touchGhost = createGhost(row);
    row.classList.add("dragging");
  }, 200);
}, { passive: true });

document.addEventListener("touchmove", e => {
  if (!touchSourceRow) return;

  touchMoved = true;

  // If the long-press timer hasn't fired yet, cancel — this was a scroll
  if (!dragged) {
    clearTimeout(touchSourceRow._touchTimer);
    touchSourceRow = null;
    return;
  }

  e.preventDefault(); // block page scroll while actively dragging

  const touch = e.touches[0];

  // Reposition ghost under finger
  if (touchGhost) {
    touchGhost.style.left = touch.clientX - touchGhost.offsetWidth / 2 + "px";
    touchGhost.style.top  = touch.clientY - 24 + "px";
  }

  // Highlight the row the finger is hovering over
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  const overRow = el && el.closest(".todo-row");

  document.querySelectorAll(".todo-row.drop-target").forEach(r =>
    r.classList.remove("drop-target")
  );
  if (overRow && overRow !== touchSourceRow) {
    overRow.classList.add("drop-target");
  }
}, { passive: false }); // must be non-passive to call preventDefault

document.addEventListener("touchend", e => {
  if (!touchSourceRow) return;

  clearTimeout(touchSourceRow._touchTimer);

  if (dragged && touchMoved) {
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el) handleDrop(el);
  }

  cleanupTouch();
}, { passive: true });

document.addEventListener("touchcancel", () => {
  if (touchSourceRow) clearTimeout(touchSourceRow._touchTimer);
  cleanupTouch();
}, { passive: true });

// ================= START =================
render();