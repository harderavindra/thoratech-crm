import { useHealth } from "./hooks/useHealth";


function App() {
const {
    data,
    isLoading,
    error,
  } = useHealth();
  return (
    
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">
          Thoratech CRM
        </h1>

        <div className="rounded bg-gray-100 p-4">
          <h2 className="mb-2 font-semibold">
            Backend Status
          </h2>

          {isLoading && (
            <p className="text-gray-500">
              Loading...
            </p>
          )}

          {error && (
            <p className="text-red-500">
              API Connection Failed
            </p>
          )}

          {data && (
            <p className="text-green-600">
              {data.message}
            </p>
          )}
        </div>
      </div>
    </div>
    
  )
}

export default App
