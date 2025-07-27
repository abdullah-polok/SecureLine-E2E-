import { RouterProvider } from "react-router";
import routers from "./RouterProvider/RouterProvider";
import AuthProvider from "./AuthProvider/AuthProvider";
function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={routers}></RouterProvider>
      </AuthProvider>
    </>
  );
}

export default App;
