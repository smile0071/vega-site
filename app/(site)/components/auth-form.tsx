"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import type { FieldValues, SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { BsGithub, BsGoogle } from "react-icons/bs";

import Input from "@/app/components/inputs/input";
import Button from "@/app/components/button";
import AuthSocialButton from "./auth-social-button";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
	const session = useSession();
	const router = useRouter();

	const [variant, setVariant] = useState<Variant>("LOGIN");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (session?.status === "authenticated") {
			router.push("/users");
		}
	}, [session?.status, router]);

	const toggleVariant = useCallback(() => {
		if (variant === "LOGIN") setVariant("REGISTER");
		else setVariant("LOGIN");
	}, [variant]);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FieldValues>({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: "student", // добавляем роль по умолчанию
		},
	});

	const onSubmit: SubmitHandler<FieldValues> = (data) => {
		setIsLoading(true);

		if (variant === "REGISTER") {
			axios
				.post("/api/register", data)
				.then(() => signIn("credentials", data))
				.catch(() => toast.error("Something went wrong."))
				.finally(() => setIsLoading(false));
		}

		if (variant === "LOGIN") {
			signIn("credentials", {
				...data,
				redirect: false,
			})
				.then((callback) => {
					if (callback?.error) {
						toast.error("Invalid credentials.");
					}

					if (callback?.ok && !callback?.error) {
						toast.success("You are logged in.");
						router.push("/users");
					}
				})
				.finally(() => setIsLoading(false));
		}
	};

	const socialAction = (action: "github" | "google") => {
		setIsLoading(true);

		signIn(action, {
			redirect: false,
		})
			.then((callback) => {
				if (callback?.error) toast.error("Invalid credentials.");

				if (callback?.ok && !callback?.error)
					toast.success("You are logged in.");
			})
			.finally(() => setIsLoading(false));
	};

	return (
		<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
			<div className="bg-white px-4 py-8 shadow-sm rounded-lg sm:px-10">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					{variant === "REGISTER" && (
						<>
							<Input
								type="text"
								id="name"
								label="Введите имя"
								placeholder="James Bond"
								register={register}
								errors={errors}
								disabled={isLoading}
							/>
						</>
					)}
					<Input
						type="email"
						id="email"
						label="Введите почту"
						placeholder="example@email.com"
						register={register}
						errors={errors}
						disabled={isLoading}
					/>

					<Input
						type="password"
						id="password"
						label="Введите пароль"
						placeholder="••••••••••"
						register={register}
						errors={errors}
						disabled={isLoading}
					/>

					{variant === "REGISTER" && (
						<div className="flex gap-4 mt-2">
							<label className="flex-1 cursor-pointer">
								<input
									type="radio"
									value="student"
									{...register("role")}
									disabled={isLoading}
									className="peer hidden"
								/>
								<div
									className={`
                flex items-center justify-center rounded-md py-2 px-4 text-sm font-semibold shadow-sm
                border transition-colors
                ${
									isLoading
										? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
										: "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
								}
                peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600
            `}
								>
									Студент
								</div>
							</label>
							<label className="flex-1 cursor-pointer">
								<input
									type="radio"
									value="teacher"
									{...register("role")}
									disabled={isLoading}
									className="peer hidden"
								/>
								<div
									className={`
                flex items-center justify-center rounded-md py-2 px-4 text-sm font-semibold shadow-sm
                border transition-colors
                ${
									isLoading
										? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
										: "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400"
								}
                peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600
            `}
								>
									Преподаватель
								</div>
							</label>
						</div>
					)}

					<Button type="submit" disabled={isLoading} fullWidth>
						{variant === "LOGIN" ? "Войти" : "Регистрация"}
					</Button>
				</form>

				<div className="mt-6">
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div
								role="separator"
								className="w-full border-t border-gray-300"
								aria-hidden
							/>
						</div>

						<div className="relative flex justify-center text-sm">
							<span className="bg-white px-2 text-gray-500">
								Или продолжи с
							</span>
						</div>
					</div>

					<div className="mt-6 flex gap-2">
						<AuthSocialButton
							icon={BsGithub}
							isLoading={isLoading}
							onClick={() => socialAction("github")}
						/>
						<AuthSocialButton
							icon={BsGoogle}
							isLoading={isLoading}
							onClick={() => socialAction("google")}
						/>
					</div>
				</div>

				<div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
					<p>{variant === "LOGIN" ? "Нет аккаунта?" : "Уже есть аккаунт?"}</p>

					<a onClick={toggleVariant} className="underline cursor-pointer">
						{variant === "LOGIN" ? "Создать аккаунт" : "Войти"}
					</a>
				</div>
			</div>
		</div>
	);
};

export default AuthForm;
