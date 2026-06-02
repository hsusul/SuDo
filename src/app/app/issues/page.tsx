import { WorkspaceRoute } from "@/app/app/workspace-route";

export const dynamic = "force-dynamic";

type IssuesPageProps = {
  searchParams?: Promise<{
    workspace?: string;
    project?: string;
    issue?: string;
    status?: string;
    priority?: string;
    label?: string;
    q?: string;
  }>;
};

export default function IssuesPage({ searchParams }: IssuesPageProps) {
  return <WorkspaceRoute view="issues" searchParams={searchParams} />;
}
