import { WorkspaceRoute } from "@/app/app/workspace-route";

export const dynamic = "force-dynamic";

type AppViewsPageProps = {
  searchParams?: Promise<{
    workspace?: string;
    project?: string;
  }>;
};

export default function AppViewsPage({ searchParams }: AppViewsPageProps) {
  return <WorkspaceRoute view="views" searchParams={searchParams} />;
}
