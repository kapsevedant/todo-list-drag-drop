# Take-Home: Todo List (Vanilla JS)

**Goal**: Build a todo app with **1-level nested drag & drop**, filters, and persistence — **no frameworks, no libraries**.

---

# 📝 Todo App

A responsive, single-page **Nested Todo App** built with vanilla JavaScript, featuring **1-level nesting**, **drag & drop**, **filters**, and **persistent storage**.

---

## 🎯 Overview

This project allows users to manage tasks and subtasks in an intuitive interface.  
You can add todos, nest subtasks, reorder items with drag-and-drop, and filter by completion status.  
All data is saved in **localStorage** for persistence between sessions.

---

### 🧰 Tech Stack

-   HTML
-   CSS
-   JavaScript (Vanilla)

## 🚀 Core Requirements (Must-Have)

### 1. Add Todos

-   Add **top-level todos** by typing into an input and pressing **Enter**.
-   Each todo has a button or icon to **add a sub-task** beneath it.
-   Sub-tasks are displayed visually indented below their parent.
    Example

```
-   Buy groceries
    -   Buy milk
    -   Buy eggs
-   Read a book
    -   Chapter 1: Introduction
```

---

### 2. Drag & Drop (1-Level Nested)

Uses the **HTML5 Drag API** (`draggable`, `dragstart`, `dragover`, `drop`) to reorder tasks.

-   **Drag parent task:** Moves along with all its sub-tasks.
-   **Drag sub-task:** Can be dropped under a different parent or promoted to top-level.
-   **Visual indent:** Sub-tasks appear slightly indented for clarity.

---

### 3. Mark Complete / Delete

-   Each todo has a **checkbox** to mark completion.
-   Completed tasks are shown with a **strikethrough**.
-   A **delete icon** removes a task (and its sub-tasks, if any).

---

### 4. Filter Tabs

Toggle between task views:

-   **All**
-   **Active**
-   **Completed**

When filters are selected, the **URL hash** updates automatically:

-   `#all` → Show all tasks
-   `#active` → Show uncompleted tasks
-   `#completed` → Show completed tasks

---

### 5. Persistence (Local Storage)

-   Todos are **saved to localStorage** on every change.
-   On refresh, data is automatically reloaded.

---

### 6. Responsive Design

-   Works on both **desktop and mobile**.
-   Touch drag-and-drop is optional but considered a bonus.

---

## 📦 Deliverables

-   **Live Demo:** Hosted on [Vercel](https://vercel.com) / [Netlify](https://www.netlify.com) / [Github Pages](https://github.com)
-   **GitHub Repository:** With clean, descriptive commit messages and organized code.
