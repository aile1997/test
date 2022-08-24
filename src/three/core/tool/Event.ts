/* eslint-disable import/no-mutable-exports */
let beforeX: number; let beforeY: number; let afterX: number; let afterY: number; let even: any;

const eventGudge = (container: HTMLElement, Fun: (option: any) => void, option?: any) => {
  container.addEventListener('mousedown', (e) => {
    [beforeX, beforeY] = [e.offsetX, e.offsetY];
  });

  container.addEventListener('mouseup', (e) => {
    [afterX, afterY] = [e.offsetX, e.offsetY];
  });

  container.addEventListener('click', (e) => {
    even = e;
    if (beforeX === afterX && beforeY === afterY) {
      Fun(option);
    }
  });
};
export { eventGudge, even };
