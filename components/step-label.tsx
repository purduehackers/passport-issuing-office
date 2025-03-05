export function StepLabel({
	stepNumber,
	stepName,
	className = "",
}: {
	stepNumber: string;
	stepName: string;
	className?: string;
}) {
	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<div className="w-4 h-4 p-4 border-2 border-amber-400 rounded-full flex justify-center items-center">
				<h2 className="text-amber-400 text-xl font-bold">{stepNumber}</h2>
			</div>
			<h2 className="text-amber-400 text-2xl font-bold">{stepName}</h2>
		</div>
	);
}
