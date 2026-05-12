import { RouterProvider } from "react-router-dom";

import { router } from "./routes";
import { useAuth } from "./modules/auth/hooks/use-auth";
import { Toaster } from "./components/ui/toast";

function App() {
  useAuth();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App
