import { RouterProvider } from "react-router-dom";

import { router } from "./routes";
import { useAuth } from "./modules/auth/hooks/use-auth";

function App() {
  useAuth();

  return (
     <RouterProvider
      router={router}
    />
    
  )
}

export default App
