import { addAssignee } from "./state.js";
import { renderAssignees } from "./render.js";

export function setupAssigneeModal() {
  const btnAdd = document.getElementById("btn-add-assignee");
  const modal = document.getElementById("assignee-modal");
  const form = document.getElementById("assignee-form");
  const btnCancel = document.getElementById("btn-close-modal");

  if (!btnAdd || !modal || !form || !btnCancel) return;

  btnAdd.addEventListener("click", () => {
    form.reset();
    modal.showModal();
  });

  btnCancel.addEventListener("click", () => {
    form.reset();
    modal.close();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name").trim();

    if (name) {
      addAssignee(name);
      renderAssignees();
      form.reset();
      modal.close();
    }
  });
}

setupAssigneeModal()