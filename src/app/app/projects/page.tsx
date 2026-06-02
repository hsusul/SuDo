import { WorkspaceRoute } from "@/app/app/workspace-route";

export const dynamic = "force-dynamic";

type ProjectsPageProps = {
  searchParams?: Promise<{
    workspace?: string;
    project?: string;
  }>;
};

export default function ProjectsPage({ searchParams }: ProjectsPageProps) {
  return <WorkspaceRoute view="projects" searchParams={searchParams} />;
}
