import { setupControls } from "./controls.js";
import { renderCalendar } from "./render.js";

setupControls(() => {
  renderCalendar();
});

renderCalendar();