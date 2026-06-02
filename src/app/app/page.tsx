import { WorkspaceRoute } from "@/app/app/workspace-route";

export const dynamic = "force-dynamic";

type AppDashboardPageProps = {
  searchParams?: Promise<{
    workspace?: string;
    project?: string;
  }>;
};

export default function AppDashboardPage({ searchParams }: AppDashboardPageProps) {
  return <WorkspaceRoute view="issues" searchParams={searchParams} />;
}
