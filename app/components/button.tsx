"use client";

import clsx from "clsx";

type ButtonProps = {
	type?: "submit" | "reset" | "button" | undefined;
	fullWidth?: boolean;
	children?: React.ReactNode;
	onClick?: () => void;
	secondary?: boolean;
	danger?: boolean;
	disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
	type,
	fullWidth,
	children,
	onClick,
	secondary,
	danger,
	disabled,
}) => {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={clsx(
				"flex justify-center rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
				disabled && "opacity-50 cursor-default",
				fullWidth && "w-full",
				secondary ? "text-gray-900" : "text-white",
				danger &&
					"bg-rose-500 hover:bg-rose-600 focus-visible:outline-rose-600",
				!secondary &&
					!danger &&
					"bg-[#021786] hover:bg-[#021170] focus-visible:outline-[#021786]"
			)}
		>
			{children}
		</button>
	);
};

export default Button;
