export const today = new Date();

export const state = { 
  year: today.getFullYear(), 
  month: today.getMonth() 
};

export function setState(newState) {
  Object.assign(state, newState);
}