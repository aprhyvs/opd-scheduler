import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { buildGrid } from "./utils.js";
import { today, state } from "./state.js";
import { MONTHS, DOWS, COL, CELL, ROW_H, PAD_X, HEADER_H, DOW_H, PAD_TOP, PAD_BOT, SVG_W } from "./config.js";

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

      // Day number
      g.append("text")
        .attr("class", "calendar__day-num")
        .attr("x", cellW / 2)
        .attr("y", cellH / 2)
        .attr("fill", numFill)
        .attr("font-weight", numWeight)
        .text(day);

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