import React from "react";
import { Link, useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import logo from "../../../assets/wmremove-transformed.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../../firebase.config";
const Login = () => {
  const navigate = useNavigate();
  const handleSignIn = (e) => {
    e.preventDefault();
    const form = e.target;

    const email = form.email.value;
    const password = form.password.value;

    navigate("/home");
    // console.log(email, password);
    // signInWithEmailAndPassword(auth, email, password);
  };
  return (
    <div className="">
      <div className="hero-content flex-col lg:flex-row-reverse mx-auto">
        <div className="card w-full max-w-sm shrink-0 shadow-lg bg-white rounded-lg border border-gray-200">
          <div className="w-full flex justify-center mt-2">
            <img
              className="xl:w-2/4 lg:w-2/4 w-1/3
            "
              src={logo}
              alt=""
            />
          </div>
          <form
            onSubmit={handleSignIn}
            className="card-body dark:text-gray-600"
          >
            <div className="form-control">
              <label className="label text-xs">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="email"
                className="input input-bordered input-xs py-4"
                required
              />
            </div>
            <div className="form-control">
              <label className="label text-xs">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="password"
                className="input input-bordered input-xs py-4 "
                required
              />
              <label className="label">
                <Link
                  to={"/resetpassword"}
                  className="label-text-alt link link-hover  text-[#3799db] text-xs font-semibold"
                >
                  Forgot password
                </Link>
              </label>
            </div>
            <div className="form-control mt-6 w-full text-center">
              <button className="btn bg-[#3799db] text-white btn-sm  ">
                Login
              </button>
            </div>
            <ToastContainer></ToastContainer>
          </form>
          <div className="px-7 pb-3">
            <Link to={"/register"} className="text-[#3799db] text-xs font-bold">
              Create an account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
