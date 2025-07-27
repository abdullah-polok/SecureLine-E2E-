import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "../../../../firebase.config";
import logo from "../../../assets/wmremove-transformed-removebg-preview.png";
const Register = () => {
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (!email.includes("@gmail.com") && !email.includes("@ukh.edu.krd")) {
      setRegisterError(() => {
        toast("Please write a valid email");
        return "Please write a valid email";
      });
      return;
    }
    ///Check password length
    if (password.length < 6) {
      setRegisterError(() => {
        toast("Password should be at least six character or longer");
        return "Password should be at least six character or longer";
      });
      return;
    }
    // ///check password have any capital letter or not
    if (!/[A-Z]/.test(password)) {
      setRegisterError(() => {
        toast("Password should have at least one upper case letter");
        return "Password should have at least one upper case letter";
      });

      return;
    }
    // ///check password have any special character or not
    if (!/[$&+,:;=?@#|'<>.^*()%!-]/.test(password)) {
      setRegisterError(() => {
        toast("Password should have at least one special character");
        return "Password should have at least one special character";
      });

      return;
    }

    if (password !== confirmPassword) {
      setRegisterError(() => {
        toast("Password not match");
        return "Password not match";
      });
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then((res) => {
        // console.log(res.user);
        const user = res.user;
        toast("User created successfully");
        //Reset login form
        e.target.reset();
        ///Navigate to Home
        navigate("/");
      })
      .catch((err) => {
        console.log(err.message);
        setRegisterError(err.message);
        toast(err.message);
      });
  };

  return (
    <div className="">
      <div className="hero-content flex-col lg:flex-row-reverse mx-auto">
        <div className="card  w-full max-w-sm shrink-0 shadow-lg bg-white rounded-lg border border-gray-200">
          <div className="w-full flex justify-center mt-2">
            <img
              className="xl:w-2/4 lg:w-2/4 w-1/3
                    "
              src={logo}
              alt=""
            />
          </div>
          <form onSubmit={handleRegister} className="card-body text-black">
            <div className="form-control">
              <label className="label text-xs">
                <span className="label-text text-xs">Full name</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="full name"
                className="input input-bordered input-xs py-4"
                required
              />
            </div>
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
              <label className="label  text-xs">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="password"
                className="input input-bordered input-sm py-4"
                required
              />
            </div>
            <div className="form-control">
              <label className="label  text-xs">
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                className="input input-bordered input-sm py-4"
                required
              />
            </div>

            <div className="form-control mt-3 text-center">
              <button className="btn bg-[#3799db] text-white btn-sm">
                Register
              </button>
              <ToastContainer></ToastContainer>
            </div>
          </form>
          <div className="px-7 pb-3">
            <Link to={"/"} className="text-[#3799db] font-bold text-xs">
              Already,have a account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
