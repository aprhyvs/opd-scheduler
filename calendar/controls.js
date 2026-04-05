import { MONTHS } from "./config.js";
import { state, setState } from "./state.js";
import { today } from "./state.js";

export function setupControls(onStateChange) {
  const monthSelect = document.getElementById("month-select");
  const yearSelect  = document.getElementById("year-select");

  MONTHS.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index; option.textContent = month;
    if (index === state.month) option.selected = true;
    monthSelect.appendChild(option);
  });

  const Y_RANGE = 10;
  for (let y = state.year - Y_RANGE; y <= state.year + Y_RANGE; y++) {
    const option = document.createElement("option");
    option.value = y; option.textContent = y;
    if (y === state.year) option.selected = true;
    yearSelect.appendChild(option);
  }

  monthSelect.addEventListener("change", () => { 
    setState({ month: +monthSelect.value }); 
    onStateChange(); 
  });
  
  yearSelect.addEventListener("change", () => { 
    setState({ year: +yearSelect.value });  
    onStateChange(); 
  });

}