import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { buildGrid } from "./utils.js";
import { today, state } from "./state.js";
import { MONTHS, DOWS, COL, CELL, ROW_H, PAD_X, HEADER_H, DOW_H, PAD_TOP, PAD_BOT, SVG_W } from "./config.js";
import { getAssignees, assignToDate, moveAssigneeDate, removeFromDate } from "../assignee/state.js";

export function renderCalendar() {
  const { year, month } = state;
  const cells = buildGrid(year, month);
  const rows = cells.length / 7;

  const SVG_H = HEADER_H + DOW_H + PAD_TOP + rows * ROW_H + PAD_BOT;

  // Clear
  d3.select("#calendar-wrap").selectAll("*").remove();

  const svg = d3.select("#calendar-wrap")
    .append("svg")
    .attr("width", "100%")
    .attr("viewBox", `0 0 ${SVG_W} ${SVG_H}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("display", "block");

  // Banner
  svg.append("rect")
    .attr("x", 0).attr("y", 0)
    .attr("width", SVG_W).attr("height", HEADER_H)
    .attr("fill", "var(--header-bg)");

  svg.append("text")
    .attr("class", "calendar__month-label")
    .attr("x", PAD_X)
    .attr("y", HEADER_H / 2)
    .attr("font-size", 32)
    .text(MONTHS[month]);

  svg.append("text")
    .attr("class", "calendar__year-label")
    .attr("x", SVG_W - PAD_X)
    .attr("y", HEADER_H / 2)
    .attr("font-size", 22)
    .attr("text-anchor", "end")
    .text(year);

  // Accent
  svg.append("rect")
    .attr("x", 0).attr("y", HEADER_H - 4)
    .attr("width", SVG_W).attr("height", 4)
    .attr("fill", "var(--accent)");

  // Day of week row
  const dowY = HEADER_H + DOW_H / 2;
  DOWS.forEach((d, i) => {
    const cx = PAD_X + i * CELL + CELL / 2;
    const isWeekend = (i === 0 || i === 6);
    svg.append("text")
      .attr("class", "calendar__dow")
      .attr("x", cx).attr("y", dowY)
      .attr("fill", isWeekend ? "var(--weekend)" : "var(--ink-muted)")
      .text(d);
  });

  // Divider
  svg.append("line")
    .attr("x1", PAD_X).attr("x2", SVG_W - PAD_X)
    .attr("y1", HEADER_H + DOW_H - 1).attr("y2", HEADER_H + DOW_H - 1)
    .attr("stroke", "var(--border)").attr("stroke-width", 1);

  // Cell groups
  const gridTop = HEADER_H + DOW_H + PAD_TOP;
  const CELL_PAD = 5;

  const isToday = (d) =>
    d !== null &&
    year === today.getFullYear() &&
    month === today.getMonth() &&
    d === today.getDate();

  const isWeekendCell = (idx) => idx % 7 === 0 || idx % 7 === 6;

  cells.forEach((day, idx) => {
    const col = idx % 7;
    const row = Math.floor(idx / 7);
    const cx = PAD_X + col * CELL + CELL / 2;
    const cy = gridTop + row * ROW_H + ROW_H / 2;

    const g = svg.append("g")
      .attr("class", "calendar__day-cell")
      .attr("transform", `translate(${PAD_X + col * CELL + CELL_PAD}, ${gridTop + row * ROW_H + CELL_PAD})`);

    const cellW = CELL - CELL_PAD * 2;
    const cellH = ROW_H - CELL_PAD * 2;

    // Determine look
    const todayCell = isToday(day);
    const weekendCell = isWeekendCell(idx);
    const emptyCell = day === null;

    let bgFill = "transparent";
    let numFill = "var(--ink)";
    let numWeight = "400";

    if (todayCell) {
      bgFill = "var(--today-bg)";
      numFill = "var(--today-fg)";
      numWeight = "600";
    } else if (weekendCell && !emptyCell) {
      numFill = "var(--weekend)";
    }

    // Background rect
    g.append("rect")
      .attr("class", "calendar__day-bg")
      .attr("width", cellW)
      .attr("height", cellH)
      .attr("rx", 8).attr("ry", 8)
      .attr("fill", bgFill)
      .style("transition", "fill 0.15s");

    if (!emptyCell) {
      // Today accent ring
      if (todayCell) {
        g.append("rect")
          .attr("width", cellW).attr("height", cellH)
          .attr("rx", 8).attr("ry", 8)
          .attr("fill", "none")
          .attr("stroke", "var(--accent)")
          .attr("stroke-width", 2);
      }

      // Day number - positioned top right
      g.append("text")
        .attr("class", "calendar__day-num")
        .attr("x", cellW - 12)
        .attr("y", 20)
        .attr("fill", numFill)
        .attr("font-weight", numWeight)
        .attr("text-anchor", "end")
        .text(day);

      // Date string for this cell matching schedule structure
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Render scheduled assignees natively using HTML inside foreignObject
      const assigneesForDay = getAssignees().filter(a => a.schedule && a.schedule.includes(dateString));

      if (assigneesForDay.length > 0) {
        const fo = g.append("foreignObject")
          .attr("x", 4)
          .attr("y", 30) // Below the day number
          .attr("width", cellW - 8)
          .attr("height", cellH - 34)
          .style("pointer-events", "auto"); // ensure inner contents catch pointers

        const container = fo.append("xhtml:div")
          .style("width", "100%")
          .style("height", "100%")
          .style("display", "flex")
          .style("flex-direction", "column")
          .style("gap", "4px")
          .style("overflow-y", "auto")
          .style("align-items", "center");

        assigneesForDay.forEach(assignee => {
          const chip = container.append("xhtml:div")
            .style("background", "var(--surface)")
            .style("border", "1px solid var(--border)")
            .style("border-radius", "4px")
            .style("padding", "2px 6px")
            .style("font-size", "11px")
            .style("color", "var(--ink)")
            .style("display", "flex")
            .style("justify-content", "space-between")
            .style("align-items", "center")
            .style("width", "100%")
            .style("box-sizing", "border-box")
            .style("box-shadow", "0 1px 2px rgba(0,0,0,0.05)")
            .style("cursor", "move")
            .attr("draggable", "true");

          chip.on("dragstart", function(event) {
            event.stopPropagation();
            event.dataTransfer.setData("text/plain", JSON.stringify({ 
              name: assignee.name, 
              source: "calendar",
              date: dateString 
            }));
            event.dataTransfer.dropEffect = "move";
          });

          // Text centered 
          chip.append("xhtml:span")
            .style("flex-grow", "1")
            .style("text-align", "center")
            .style("white-space", "nowrap")
            .style("overflow", "hidden")
            .style("text-overflow", "ellipsis")
            .text(assignee.name);

          // Delete button
          const delBtn = chip.append("xhtml:button")
            .style("background", "transparent")
            .style("border", "none")
            .style("color", "var(--ink-muted)")
            .style("cursor", "pointer")
            .style("font-size", "14px")
            .style("line-height", "1")
            .style("padding", "0 2px")
            .html("&times;");

          delBtn.on("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            removeFromDate(assignee.name, dateString);
            renderCalendar();
          });
          
          delBtn.on("mouseenter", function() {
            d3.select(this).style("color", "#e63946");
          }).on("mouseleave", function() {
            d3.select(this).style("color", "var(--ink-muted)");
          });
        });
      }

      // Allow dragging OVER calendar cell
      g.on("dragover", function(event) {
        event.preventDefault();
        d3.select(this).select("rect.calendar__day-bg").attr("fill", "var(--accent-light)");
      });

      g.on("dragleave", function(event) {
        if (!todayCell) d3.select(this).select("rect.calendar__day-bg").attr("fill", "transparent");
        else d3.select(this).select("rect.calendar__day-bg").attr("fill", "var(--today-bg)");
      });

      g.on("drop", function(event) {
        event.preventDefault();
        
        if (!todayCell) d3.select(this).select("rect.calendar__day-bg").attr("fill", "transparent");
        else d3.select(this).select("rect.calendar__day-bg").attr("fill", "var(--today-bg)");

        const data = event.dataTransfer.getData("text/plain");
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

      // Hover highlight 
      g.on("mouseenter", function () {
        if (!todayCell) d3.select(this).select("rect.calendar__day-bg").attr("fill", "var(--accent-light)");
      }).on("mouseleave", function () {
        if (!todayCell) d3.select(this).select("rect.calendar__day-bg").attr("fill", "transparent");
      });
    }
  });

  // Row separators
  for (let r = 1; r < rows; r++) {
    svg.append("line")
      .attr("x1", PAD_X).attr("x2", SVG_W - PAD_X)
      .attr("y1", gridTop + r * ROW_H).attr("y2", gridTop + r * ROW_H)
      .attr("stroke", "var(--border)").attr("stroke-width", 0.75);
  }
}