const STORAGE_KEY = 'assignees';

export function getAssignees() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addAssignee(name) {
  const assignees = getAssignees();
  assignees.push({
    name,
    schedule: []
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assignees));
}

export function deleteAssignee(name) {
  const assignees = getAssignees();
  const updated = assignees.filter(a => a.name !== name);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}