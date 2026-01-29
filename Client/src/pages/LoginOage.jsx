import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginOage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    const payload =
      currState === "Sign up"
        ? { fullName, email, password, bio }
        : { email, password };
    const success = await login(currState === "Sign up" ? "signup" : "login",payload);
    console.log("LOGIN SUCCESS:", success); // 👈 ADD THIS

    if (success) {
      console.log("NAVIGATING TO HOME"); // 👈 ADD THIS
      navigate("/");
    }
  };
  return (
    <div className=" min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      {/* left */}
      <img src={assets.logo_big} alt="" className="w-[min(30vw,250px)]" />
      {/* right */}
      <form
        onSubmit={onSubmitHandler}
        className=" border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg"
      >
        <h2 className=" font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              src={assets.arrow_icon}
              onClick={() => setIsDataSubmitted(false)}
              alt=""
              className=" w-5 cursor-pointer"
            />
          )}
        </h2>
        {currState === "Sign up" && !isDataSubmitted && (
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            className=" p-2 border border-gray-500 rounded-md focus:outline-none"
            placeholder="Full Name"
            required
          />
        )}
        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="Email Address"
              required
              className=" p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Password"
              required
              className=" p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </>
        )}
        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className=" p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Provide a short bio"
            required
          ></textarea>
        )}
        <button className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer ">
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>
        <div className=" flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy</p>
        </div>
        <div className=" flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p>
              Already have an account?{" "}
              <span
                className=" text-purple-500 cursor-pointer"
                onClick={() => setCurrState("Login")}
              >
                Login
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <span
                className=" text-purple-500 cursor-pointer"
                onClick={() => setCurrState("Sign up")}
              >
                Sign up
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginOage;
