import { getAssignees, deleteAssignee, removeFromDate } from "./state.js";
import { renderCalendar } from "../calendar/render.js";

let assigneeToDelete = null;

// Setup delete modal handlers
const deleteModal = document.getElementById("delete-confirm-modal");
const btnCancelDelete = document.getElementById("btn-cancel-delete");
const btnConfirmDelete = document.getElementById("btn-confirm-delete");
const deleteNameEl = document.getElementById("delete-assignee-name");

if (btnCancelDelete && btnConfirmDelete && deleteModal) {
  btnCancelDelete.addEventListener("click", () => {
    deleteModal.close();
    assigneeToDelete = null;
  });

  btnConfirmDelete.addEventListener("click", () => {
    if (assigneeToDelete) {
      deleteAssignee(assigneeToDelete);
      renderAssignees();
      renderCalendar(); // Also re-render calendar in case they were removed from schedule
      deleteModal.close();
      assigneeToDelete = null;
    }
  });
}

const container = document.getElementById("assignee-list");

if (container) {
  container.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  container.addEventListener("drop", (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (data) {
      try {
        const payload = JSON.parse(data);
        if (payload.name && payload.source === 'calendar') {
          removeFromDate(payload.name, payload.date);
          renderCalendar();
        }
      } catch (err) { }
    }
  });
}

export function renderAssignees() {
  if (!container) return;

  const assignees = getAssignees();
  container.innerHTML = "";

  assignees.forEach(({ name }) => {
    const chip = document.createElement("div");
    chip.className = "assignee-chip";
    chip.draggable = true;

    chip.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify({ name, source: "sidebar" }));
      e.dataTransfer.dropEffect = "copy";
    });

    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;
    chip.appendChild(nameSpan);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "assignee-chip__delete";
    deleteBtn.innerHTML = "&times;";
    deleteBtn.title = "Delete " + name;

    deleteBtn.addEventListener("click", () => {
      assigneeToDelete = name;
      if (deleteNameEl) {
        deleteNameEl.textContent = name;
      }
      deleteModal?.showModal();
    });

    chip.appendChild(deleteBtn);
    container.appendChild(chip);
  });
}

// Initial render
renderAssignees();
