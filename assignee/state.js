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

export function assignToDate(name, dateString) {
  const assignees = getAssignees();
  const assignee = assignees.find(a => a.name === name);
  if (assignee && !assignee.schedule.includes(dateString)) {
    assignee.schedule.push(dateString);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignees));
  }
}

export function removeFromDate(name, dateString) {
  const assignees = getAssignees();
  const assignee = assignees.find(a => a.name === name);
  if (assignee) {
    assignee.schedule = assignee.schedule.filter(d => d !== dateString);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignees));
  }
}

export function moveAssigneeDate(name, oldDate, newDate) {
  const assignees = getAssignees();
  const assignee = assignees.find(a => a.name === name);
  if (assignee) {
    assignee.schedule = assignee.schedule.filter(d => d !== oldDate);
    if (!assignee.schedule.includes(newDate)) {
      assignee.schedule.push(newDate);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignees));
  }
}