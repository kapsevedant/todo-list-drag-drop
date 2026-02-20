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

    if(visible.length === 0) {
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

// ================= DRAG & DROP =================

// Drag start
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

// Drag end
document.addEventListener("dragend", e => {
  let row = e.target.closest(".todo-row");
  if (row) row.classList.remove("dragging");
});

// Drag over parent todo list to allow drop
listEl.addEventListener("dragover", e => {
  e.preventDefault();
});

// Drop on todo or sub-list
document.addEventListener("drop", e => {
  let todoRow = e.target.closest(".todo-row[data-type='todo']");
  let subList = e.target.closest(".sub-list");

  if (!dragged) return;

  // ===== SUB -> ANOTHER PARENT TODO =====
  if (dragged.type === "sub" && (todoRow || subList)) {
    let newParentId = (todoRow && todoRow.dataset.id) || (subList && subList.dataset.parent);
    let oldParent = todos.find(t => t.id === dragged.pid);
    let subItem = oldParent.subs.find(s => s.id === dragged.id);

    // remove from old parent
    oldParent.subs = oldParent.subs.filter(s => s.id !== dragged.id);

    // add to new parent
    todos.find(t => t.id === newParentId).subs.push(subItem);
  }

  // ===== TODO REORDER =====
  if (dragged.type === "todo" && todoRow) {
    let from = todos.findIndex(t => t.id === dragged.id);
    let to = todos.findIndex(t => t.id === todoRow.dataset.id);
    let item = todos.splice(from, 1)[0];
    todos.splice(to, 0, item);
  }

  dragged = null;
  saveTodos();
  render();
});

// Start
render();
