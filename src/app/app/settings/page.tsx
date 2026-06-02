import { WorkspaceRoute } from "@/app/app/workspace-route";

export const dynamic = "force-dynamic";

type AppSettingsPageProps = {
  searchParams?: Promise<{
    workspace?: string;
  }>;
};

export default function AppSettingsPage({ searchParams }: AppSettingsPageProps) {
  return <WorkspaceRoute view="settings" searchParams={searchParams} />;
}
