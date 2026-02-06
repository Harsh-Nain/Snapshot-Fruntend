import { NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function Signup() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    
    const onSubmit = (data) => { console.log("Form Data:", data); };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-100 w-full">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-5">

                <h1 className="text-3xl font-semibold text-center text-zinc-800">
                    Snapshot
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="flex flex-col gap-1">
                        <input type="text" placeholder="Full name" className={`w-full px-4 py-2.5 text-sm rounded-lg bg-zinc-100 border focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${errors.fullname ? "border-red-500" : "border-zinc-300"}`}
                            {...register("fullname", {
                                required: "Full name is required",
                                minLength: { value: 3, message: "Minimum 3 characters required", },
                            })}
                        />
                        {errors.fullname && (<p className="text-xs text-red-500">  {errors.fullname.message}</p>)}
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