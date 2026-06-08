"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Command,
  FolderKanban,
  ListTodo,
  Plus,
  Search,
  Settings,
  Users,
  Workflow,
} from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import {
  commandEvents,
  dispatchCommandEvent,
} from "@/lib/command-events";

type CommandItem = {
  id: string;
  label: string;
  description: string;
  group: "Navigate" | "Create" | "Workspace";
  keywords: string;
  icon: React.ReactNode;
  run: () => void;
};

export type CommandMenuWorkspace = {
  id: string;
  name: string;
  slug: string;
};

export function CommandMenu({
  activeView,
  currentWorkspace,
  currentProjectKey,
  workspaces,
}: {
  activeView?: "projects" | "issues" | "views" | "settings";
  currentWorkspace?: CommandMenuWorkspace | null;
  currentProjectKey?: string | null;
  workspaces: CommandMenuWorkspace[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const commands = useMemo<CommandItem[]>(() => {
    if (!currentWorkspace) {
      return [];
    }

    const workspaceParam = `workspace=${encodeURIComponent(currentWorkspace.slug)}`;
    const projectParam = currentProjectKey
      ? `&project=${encodeURIComponent(currentProjectKey)}`
      : "";
    const items: CommandItem[] = [
      navigationCommand({
        id: "go-issues",
        label: "Go to Issues",
        description: "Open the current workspace issue pipeline.",
        icon: <ListTodo />,
        run: () =>
          router.push(`/app/issues?${workspaceParam}${projectParam}`),
      }),
      navigationCommand({
        id: "go-projects",
        label: "Go to Projects",
        description: "Open workspace project management.",
        icon: <FolderKanban />,
        run: () => router.push(`/app/projects?${workspaceParam}`),
      }),
      navigationCommand({
        id: "go-views",
        label: "Go to Views",
        description: "Open saved and generated issue views.",
        icon: <Workflow />,
        run: () =>
          router.push(`/app/views?${workspaceParam}${projectParam}`),
      }),
      navigationCommand({
        id: "go-settings",
        label: "Go to Settings",
        description: "Open workspace settings and controls.",
        icon: <Settings />,
        run: () => router.push(`/app/settings?${workspaceParam}`),
      }),
      navigationCommand({
        id: "open-members",
        label: "Open Workspace Members",
        description: "Manage roles, invitations, and active members.",
        icon: <Users />,
        run: () => router.push(`/app/settings?${workspaceParam}`),
      }),
      {
        id: "create-project",
        label: "Create Project",
        description: "Add a project to the current workspace.",
        group: "Create",
        keywords: "new add project",
        icon: <Plus />,
        run: () => {
          if (activeView === "projects") {
            dispatchCommandEvent(commandEvents.createProject);
            return;
          }

          router.push(`/app/projects?${workspaceParam}&command=create-project`);
        },
      },
    ];

    if (currentProjectKey) {
      items.push(
        {
          id: "create-issue",
          label: "Create Issue",
          description: "Add an issue to the selected project.",
          group: "Create",
          keywords: "new add issue task",
          icon: <Plus />,
          run: () => {
            if (activeView === "issues") {
              dispatchCommandEvent(commandEvents.createIssue);
              return;
            }

            router.push(
              `/app/issues?${workspaceParam}${projectParam}&command=create-issue`,
            );
          },
        },
        {
          id: "search-issues",
          label: "Search Issues",
          description: "Focus the current project issue search.",
          group: "Navigate",
          keywords: "find query issues",
          icon: <Search />,
          run: () => {
            if (activeView === "issues") {
              dispatchCommandEvent(commandEvents.searchIssues);
              return;
            }

            router.push(
              `/app/issues?${workspaceParam}${projectParam}&command=search-issues`,
            );
          },
        },
      );
    }

    if (activeView === "issues" && currentProjectKey) {
      items.push({
        id: "save-current-view",
        label: "Save Current View",
        description: "Persist the current project filters for the workspace.",
        group: "Create",
        keywords: "bookmark filters saved view",
        icon: <Bookmark />,
        run: () => dispatchCommandEvent(commandEvents.saveView),
      });
    }

    for (const workspace of workspaces) {
      if (workspace.id === currentWorkspace.id) {
        continue;
      }

      items.push({
        id: `workspace-${workspace.id}`,
        label: `Switch to ${workspace.name}`,
        description: "Change the active workspace context.",
        group: "Workspace",
        keywords: `workspace switch ${workspace.name}`,
        icon: <Command />,
        run: () =>
          router.push(
            `/app/${activeView ?? "issues"}?workspace=${encodeURIComponent(workspace.slug)}`,
          ),
      });
    }

    return items;
  }, [
    activeView,
    currentProjectKey,
    currentWorkspace,
    router,
    workspaces,
  ]);

  const filteredCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return commands;
    }

    return commands.filter((command) =>
      `${command.label} ${command.description} ${command.keywords}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [commands, query]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  function runCommand(command: CommandItem) {
    handleOpenChange(false);
    command.run();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setQuery("");
      setActiveIndex(0);
    }
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        filteredCommands.length === 0
          ? 0
          : (current + 1) % filteredCommands.length,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        filteredCommands.length === 0
          ? 0
          : (current - 1 + filteredCommands.length) %
            filteredCommands.length,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const command = filteredCommands[activeIndex];

      if (command) {
        runCommand(command);
      }
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          className="hidden h-8 gap-2 px-2.5 text-xs text-[#8a8f98] sm:inline-flex"
          aria-label="Open command menu"
        >
          <Search className="size-3.5" aria-hidden="true" />
          <span className="hidden md:inline">Commands</span>
          <kbd className="rounded-[3px] border border-[#323334] bg-[#0c0d0e] px-1.5 py-0.5 font-mono text-[0.58rem] text-[#62666d]">
            ⌘K
          </kbd>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/65 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby="command-menu-description"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
          className="fixed left-1/2 top-[14vh] z-[100] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-[#323334] bg-[#111214] shadow-[0_30px_100px_rgb(0_0_0_/_62%)] outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <Dialog.Title className="sr-only">Command menu</Dialog.Title>
          <Dialog.Description id="command-menu-description" className="sr-only">
            Search and run workspace commands.
          </Dialog.Description>
          <div className="flex items-center gap-3 border-b border-[#23252a] px-4">
            <Search
              className="size-4 shrink-0 text-[#62666d]"
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Type a command..."
              aria-label="Search commands"
              aria-controls="command-menu-list"
              aria-activedescendant={
                filteredCommands[activeIndex]
                  ? `command-${filteredCommands[activeIndex].id}`
                  : undefined
              }
              className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#f7f8f8] outline-none placeholder:text-[#62666d]"
            />
            <kbd className="rounded-[3px] border border-[#323334] px-1.5 py-0.5 font-mono text-[0.58rem] text-[#62666d]">
              ESC
            </kbd>
          </div>

          <div
            id="command-menu-list"
            role="listbox"
            aria-label="Commands"
            className="max-h-[min(28rem,62vh)] overflow-y-auto p-2"
          >
            {filteredCommands.length === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-[#8a8f98]">
                No matching commands.
              </div>
            ) : (
              filteredCommands.map((command, index) => (
                <button
                  key={command.id}
                  id={`command-${command.id}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runCommand(command)}
                  className="group grid w-full grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 py-2.5 text-left outline-none transition data-[active=true]:bg-[#1b1c1f]"
                  data-active={index === activeIndex}
                >
                  <span className="flex size-8 items-center justify-center rounded-md border border-[#323334] bg-[#161718] text-[#8a8f98] [&_svg]:size-3.5">
                    {command.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-[#d0d6e0]">
                      {command.label}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[#62666d]">
                      {command.description}
                    </span>
                  </span>
                  <span className="font-mono text-[0.58rem] uppercase text-[#62666d]">
                    {command.group}
                  </span>
                </button>
              ))
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function navigationCommand({
  id,
  label,
  description,
  icon,
  run,
}: Omit<CommandItem, "group" | "keywords">): CommandItem {
  return {
    id,
    label,
    description,
    group: "Navigate",
    keywords: `go open ${label}`,
    icon,
    run,
  };
}
