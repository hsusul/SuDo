export const commandEvents = {
  createIssue: "sudo:command:create-issue",
  createProject: "sudo:command:create-project",
  searchIssues: "sudo:command:search-issues",
  saveView: "sudo:command:save-view",
} as const;

export function dispatchCommandEvent(
  eventName: (typeof commandEvents)[keyof typeof commandEvents],
) {
  window.dispatchEvent(new CustomEvent(eventName));
}
