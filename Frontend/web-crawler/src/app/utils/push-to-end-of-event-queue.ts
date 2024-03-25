export function pushToTheEndOfEventQueue(job: () => void) {
  setTimeout(job, 1);
}
