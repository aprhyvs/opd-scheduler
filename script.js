import { setupControls } from "./calendar/controls.js";
import { renderCalendar } from "./calendar/render.js";

setupControls(() => {
  renderCalendar();
});

renderCalendar();