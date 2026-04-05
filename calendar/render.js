import { buildGrid } from "./utils.js";
import { today, state } from "./state.js";
import { MONTHS, DOWS } from "./config.js";
import { getAssignees, assignToDate, moveAssigneeDate } from "../assignee/state.js";

export function renderCalendar() {
  const { year, month } = state;
  const cells = buildGrid(year, month);
  const rows = cells.length / 7;

  const wrap = document.getElementById("calendar-wrap");
  wrap.innerHTML = ""; // Clear existing

  // 1. Header
  const header = document.createElement("div");
  header.className = "calendar__header";
  
  const monthLabel = document.createElement("div");
  monthLabel.className = "calendar__month-label";
  monthLabel.textContent = MONTHS[month];
  
  const yearLabel = document.createElement("div");
  yearLabel.className = "calendar__year-label";
  yearLabel.textContent = year;
  
  header.appendChild(monthLabel);
  header.appendChild(yearLabel);
  wrap.appendChild(header);

  // 2. Days of week row
  const dowsContainer = document.createElement("div");
  dowsContainer.className = "calendar__dows";
  
  DOWS.forEach((d, i) => {
    const isWeekend = (i === 0 || i === 6);
    const dow = document.createElement("div");
    dow.className = `calendar__dow ${isWeekend ? "calendar__dow--weekend" : ""}`;
    dow.textContent = d;
    dowsContainer.appendChild(dow);
  });
  wrap.appendChild(dowsContainer);

  // 3. Grid container
  const grid = document.createElement("div");
  grid.className = "calendar__grid";
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  const isToday = (d) =>
    d !== null &&
    year === today.getFullYear() &&
    month === today.getMonth() &&
    d === today.getDate();

  const isWeekendCell = (idx) => idx % 7 === 0 || idx % 7 === 6;

  cells.forEach((day, idx) => {
    const weekendCell = isWeekendCell(idx);
    const emptyCell = day === null;

    const cellEl = document.createElement("div");
    cellEl.className = "calendar__day-cell";
    if (emptyCell) {
      cellEl.classList.add("calendar__day-cell--empty");
      grid.appendChild(cellEl);
      return; // Skip filling empty cells
    }
    
    if (weekendCell) {
      cellEl.classList.add("calendar__day-cell--weekend");
    }

    // Date String 
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Day Number
    const numEl = document.createElement("div");
    numEl.className = `calendar__day-num ${weekendCell ? "calendar__day-num--weekend" : ""}`;
    numEl.textContent = day;
    cellEl.appendChild(numEl);

    // Assignees Container
    const assigneesForDay = getAssignees().filter(a => a.schedule && a.schedule.includes(dateString));
    const assigneesContainer = document.createElement("div");
    assigneesContainer.className = "calendar__assignees";

    assigneesForDay.forEach(assignee => {
      const chip = document.createElement("div");
      chip.className = "calendar__assignee-chip";
      chip.textContent = assignee.name;
      chip.draggable = true;

      chip.addEventListener("dragstart", (e) => {
        e.stopPropagation();
        e.dataTransfer.setData("text/plain", JSON.stringify({
          name: assignee.name,
          source: "calendar",
          date: dateString
        }));
        e.dataTransfer.dropEffect = "move";
      });

      assigneesContainer.appendChild(chip);
    });

    cellEl.appendChild(assigneesContainer);

    // Drag / Drop Events for the Cell
    cellEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      cellEl.classList.add("calendar__day-cell--dragover");
    });

    cellEl.addEventListener("dragleave", () => {
      cellEl.classList.remove("calendar__day-cell--dragover");
    });

    cellEl.addEventListener("drop", (e) => {
      e.preventDefault();
      cellEl.classList.remove("calendar__day-cell--dragover");

      const data = e.dataTransfer.getData("text/plain");
      if (data) {
        try {
          const payload = JSON.parse(data);
          if (payload.name) {
            if (payload.source === 'sidebar') {
              assignToDate(payload.name, dateString);
            } else if (payload.source === 'calendar' && payload.date !== dateString) {
              moveAssigneeDate(payload.name, payload.date, dateString);
            }
            renderCalendar();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });

    grid.appendChild(cellEl);
  });

  wrap.appendChild(grid);
}