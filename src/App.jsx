import { RouterProvider } from "react-router";
import routers from "./RouterProvider/RouterProvider";
function App() {
  return (
    <>
      <RouterProvider router={routers}></RouterProvider>
    </>
  );
}

export default App;
