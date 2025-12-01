import TratlusLogo from "@/assets/tratlus_logo.svg?react";
useTratlusAuth } from "@/sdk/core/auth";
import { useState } from "react";

interface FloatingBannerProps {
	position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
}

export function FloatingBanner({
	position = "bottom-left",
}: FloatingBannerProps) {
	const [isVisible, setIsVisible] = useState(true);
	const { status } = useCreaoAuth();

	const handleClose = () => {
		setIsVisible(false);
	};

	if (!isVisible) {
		return null;
	}

	// Position classes mapping
	const positionClasses = {
		"bottom-left": "bottom-4 left-4",
		"bottom-right": "bottom-4 right-4",
		"top-left": "top-4 left-4",
		"top-right": "top-4 right-4",
	};

	// Auth status indicator styles
	const getAuthIndicatorClass = () => {
		switch (status) {
			case "authenticated":
				return "bg-green-500 shadow-green-500/50";
			case "invalid_token":
				return "bg-red-500 shadow-red-500/50";
			case "loading":
				return "bg-yellow-500 shadow-yellow-500/50";
			default:
				return "bg-red-500 shadow-red-500/50";
		}
	};

	return (
		<div
			className={`fixed ${positionClasses[position]} z-50 bg-black text-white px-3 py-1 rounded-full flex items-center space-x-1.5 shadow-lg`}
			role="banner"
			aria-label="Tratlus branding banner"
		>
			{/* Auth status indicator dot */}
			<div className="relative">
				<div
					className={`h-2 w-2 rounded-full ${getAuthIndicatorClass()} animate-pulse shadow-lg`}
					aria-label={`Authentication status: ${status}`}
				/>
			</div>

			<span className="flex items-center space-x-1 text-sm">
				<TratlusLogo
					className="h-2.5 w-auto align-middle fill-current text-white"
					aria-label="Tratlus Logo"
				/>
			</span>
			<button
				type="button"
				className="ml-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
				onClick={handleClose}
				aria-label="Close banner"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>
	);
}
