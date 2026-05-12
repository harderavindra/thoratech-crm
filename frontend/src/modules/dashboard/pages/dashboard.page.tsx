import { useHealth } from "../../../hooks/useHealth";
import { PageHeader } from "../../../components/ui/page-header";
import { Spinner } from "../../../components/ui/loader";
import { Alert } from "../../../components/ui/alert";

export const DashboardPage = () => {
  const { data, isLoading, error } = useHealth();

  return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="w-full max-w-md rounded-xl bg-white p-8">
        <h2 className="mb-4 text-lg font-semibold">Backend Status</h2>

        <div className="rounded-lg bg-gray-50 p-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Spinner size={16} />
              Checking connection…
            </div>
          )}
          {error && <Alert variant="error">API connection failed</Alert>}
          {data && <Alert variant="success">{data.message}</Alert>}
        </div>
      </div>
    </div>
  );
};
