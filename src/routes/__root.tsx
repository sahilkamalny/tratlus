import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SoundProvider } from "@/contexts/SoundContext";

export const Route = createRootRoute({
	component: Root,
});

function Root() {
	return (
		<ThemeProvider>
			<SoundProvider>
				<div className="flex flex-col min-h-screen">
					<ErrorBoundary tagName="main" className="flex-1">
						<Outlet />
					</ErrorBoundary>
				</div>
			</SoundProvider>
		</ThemeProvider>
	);
}
