import React from "react";
import { createBrowserRouter } from "react-router";
import Main from "../Layout/Main";
import Home from "../Pages/Home/Home";
import Login from "../Pages/Auth/Login/Login";
import Register from "../Pages/Auth/Register/Register";
import User from "../Pages/SepecPerson/User";

const routers = createBrowserRouter([
  {
    path: "/",
    element: <Main></Main>,
    children: [
      {
        path: "/",
        element: <Login></Login>,
      },
      {
        path: "/register",
        element: <Register></Register>,
      },
      {
        path: "/home",
        element: <Home></Home>,
      },
      {
        path: "/users/user",
        element: <User></User>,
      },
    ],
  },
]);

export default routers;
