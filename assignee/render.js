import { getAssignees, deleteAssignee } from "./state.js";

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
      deleteModal.close();
      assigneeToDelete = null;
    }
  });
}

export function renderAssignees() {
  const container = document.getElementById("assignee-list");
  if (!container) return;

  const assignees = getAssignees();
  container.innerHTML = "";

  assignees.forEach(({ name }) => {
    const chip = document.createElement("div");
    chip.className = "assignee-chip";

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
