import { React, useEffect } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, } = useForm();

    const onSubmit = async (formData) => {
        try {
            const res = await fetch("https://snapshot-backend0-2.onrender.com/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            console.log("Login response:", data);

            if (!res.ok) {
                throw new Error(data.message || "Login failed");
            }

            navigate("/");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-100 w-full">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">

                    <h1 className="text-3xl font-semibold text-center text-zinc-800">
                        Snapshot
                    </h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <input type="text" placeholder="Username or Email" className={`w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-100 border focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${errors.username ? "border-red-500" : "border-zinc-300"}`}
                                {...register("username", {
                                    required: "Username or Email is required",
                                    minLength: { value: 3, message: "Minimum 3 characters required", },
                                })}
                            />
                            {errors.username && (<p className="text-xs text-red-500"> {errors.username.message}</p>)}
                        </div>

                        <div className="flex flex-col gap-1">
                            <input type="password" placeholder="Password" className={`w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-100 border focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${errors.password ? "border-red-500" : "border-zinc-300"}`}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Password must be at least 6 characters", },
                                })}
                            />
                            {errors.password && (<p className="text-xs text-red-500">{errors.password.message}</p>)}
                        </div>

                        <button type="submit" className="mt-2 bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white py-2.5 rounded-lg text-sm font-medium transition">
                            Login
                        </button>
                    </form>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-zinc-200" />
                        <span className="text-xs text-zinc-400">OR</span>
                        <div className="flex-1 h-px bg-zinc-200" />
                    </div>

                    <NavLink to="/api/auth/register" className="text-sm text-center text-zinc-600 hover:text-sky-500 transition">
                        Signup & create new account
                    </NavLink>

                </div>
            </div>

        </>
    );
}