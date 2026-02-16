import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import DotSpinner from "../components/dot-spinner-anim";
import { MdOutlineDoneOutline, MdErrorOutline } from "react-icons/md";

export default function Signup() {
    const API_URL = import.meta.env.VITE_BACKEND_API_URL
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = async (formData) => {
        setLoading(true)
        setAlert(null)
        setAlert({ message: "Data submited Successfully", success: "Success" })
        const res = await fetch(`${API_URL}/api/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(formData),
        });

        const data = await res.json();
        console.log("Signup response:", data);

        if (!res.success) {
            return setAlert({ err: "Error", message: data.message || "Signup failed" });
        }

        setAlert({ success: "Success", message: data.message || "Account created successfully" });

        setTimeout(() => {
            setLoading(false)
            navigate("/api/auth/login");
        }, 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-100 w-full">

            <div class={`fixed z-99999 flex w-3/4 h-17 overflow-hidden top-7 ${!alert && "translate-x-120"}  transition duration-300 ease-in-out right-9 bg-white shadow-lg max-w-96 rounded-xl`}>
                {alert && <> <svg xmlns="http://www.w3.org/2000/svg" height="96" width="16">    <path stroke-linecap="round" stroke-width="2" stroke={alert.err ? "indianred" : "lightgreen"} fill={alert.err ? "indianred" : "lightgreen"} d="M 8 0 Q 4 4.8, 8 9.6 T 8 19.2 Q 4 24, 8 28.8 T 8 38.4 Q 4 43.2, 8 48 T 8 57.6 Q 4 62.4, 8 67.2 T 8 76.8 Q 4 81.6, 8 86.4 T 8 96 L 0 96 L 0 0 Z"    ></path> </svg>

                    <div class="mx-2.5 overflow-hidden w-full">
                        {alert.err && <p class="mt-1.5 text-xl flex items-center gap-2 font-bold text-[indianred] leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap">    {alert.err} <MdErrorOutline color="red" /></p>}
                        {alert.success && <p class="flex items-center gap-2 mt-1.5 text-xl font-bold text-green-400 leading-8 mr-3 overflow-hidden text-ellipsis whitespace-nowrap">    {alert.success}<MdOutlineDoneOutline color="lightgreen" /></p>}
                        <p class="overflow-hidden leading-5 break-all text-zinc-400 max-h-10">{alert.message} </p>
                    </div>

                    <button onClick={() => setAlert(null)} class="w-16 cursor-pointer focus:outline-none">
                        <svg class="w-7 h-7" fill="none" stroke="indianred" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button></>}
            </div>


            {loading && (
                <div className="flex justify-center items-center fixed top-0 left-0 h-[100vh] w-[100vw] bg-black/70 z-9999">
                    <DotSpinner size="3rem" color="white" />
                </div>
            )}

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">

                <h1 className="text-3xl font-semibold text-center text-zinc-800">
                    Snapshot
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="flex flex-col gap-1">
                        <input type="text" placeholder="Full name" className={`w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-100 border focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${errors.fullname ? "border-red-500" : "border-zinc-300"}`}    {...register("fullname", { required: "Full name is required", minLength: { value: 3, message: "Minimum 3 characters required", }, })} />
                        {errors.fullname && (<p className="text-xs text-red-500">{errors.fullname.message}</p>)}
                    </div>

                    <div className="flex flex-col gap-1">
                        <input type="text" placeholder="Username" className={`w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-100 border focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${errors.username ? "border-red-500" : "border-zinc-300"}`}
                            {...register("username", {
                                required: "Username is required",
                                minLength: { value: 5, message: "Minimum 5 characters required", },
                            })}
                        />
                        {errors.username && (<p className="text-xs text-red-500">{errors.username.message}</p>)}
                    </div>

                    <div className="flex flex-col gap-1">
                        <input type="email" placeholder="Email address" className={`w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-100 border focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${errors.email ? "border-red-500" : "border-zinc-300"}`} {...register("email", {
                            required: "Email is required",
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email address", },
                        })}
                        />
                        {errors.email && (<p className="text-xs text-red-500">  {errors.email.message} </p>)}
                    </div>

                    <div className="flex flex-col gap-1">
                        <input type="password" placeholder="Password" className={`w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-100 border focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${errors.password ? "border-red-500" : "border-zinc-300"}`}
                            {...register("password", {
                                required: "Password is required",
                                minLength: { value: 6, message: "Password must be at least 6 characters", },
                            })}
                        />
                        {errors.password && (<p className="text-xs text-red-500">  {errors.password.message}</p>)}
                    </div>

                    <button type="submit" className="mt-2 bg-sky-500 hover:bg-sky-600 active:scale-[0.98] text-white py-2.5 rounded-lg text-sm font-medium transition" >
                        Create Account
                    </button>
                </form>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-zinc-200" />
                    <span className="text-xs text-zinc-400">OR</span>
                    <div className="flex-1 h-px bg-zinc-200" />
                </div>

                <NavLink to="/api/auth/login" className="text-sm text-center text-zinc-600 hover:text-sky-500 transition">
                    Login & already have an account
                </NavLink>

            </div>
        </div>

    );
}