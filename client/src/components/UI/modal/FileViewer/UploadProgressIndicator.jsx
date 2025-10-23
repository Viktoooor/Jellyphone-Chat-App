import { FiX } from "react-icons/fi";

const UploadProgressIndicator = ({ status, progress, onCancel }) => {
	const radius = 35;
	const stroke = 8;
	const normalizedRadius = radius - stroke * 2;
	const circumference = normalizedRadius * 2 * Math.PI;
	const strokeDashoffset = circumference - (progress / 100) * circumference;

	return (
		<div className={`progress-container status-${status}`}>
			<svg height={radius * 2} width={radius * 2} className="progress-svg">
				<circle
					stroke="#e6e6e6"
					fill="transparent"
					strokeWidth={stroke}
					r={normalizedRadius}
					cx={radius}
					cy={radius}
				/>
				{status === 'uploading' && (
					<circle
						className="progress-ring"
						stroke="#4c8bf5"
						fill="transparent"
						strokeWidth={stroke}
						strokeDasharray={`${circumference} ${circumference}`}
						style={{ strokeDashoffset }}
						r={normalizedRadius}
						cx={radius}
						cy={radius}
					/>
				)}
				{status === 'success' && (
					<circle
						className="status-ring success"
						stroke="#28a745"
						fill="transparent"
						strokeWidth={stroke}
						r={normalizedRadius}
						cx={radius}
						cy={radius}
					/>
				)}
				{(status === 'error' || status === 'cancelled') && (
					<circle
						className="status-ring error"
						stroke="#dc3545"
						fill="transparent"
						strokeWidth={stroke}
						r={normalizedRadius}
						cx={radius}
						cy={radius}
					/>
				)}
			</svg>
			
			<div className="center-icon">
				{status === 'uploading' && (
					<button className="cancel-button" onClick={onCancel} title="Cancel Upload">
						<FiX/>
					</button>
				)}
				{status === 'success' && (
					<svg className="checkmark" viewBox="0 0 52 52">
						<path className="checkmark-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
					</svg>
				)}
				{(status === 'error' || status === 'cancelled') && (
					<svg className="cross" viewBox="0 0 52 52">
						<path className="cross-path" fill="none" d="M16 16 36 36 M36 16 16 36" />
					</svg>
				)}
			</div>
		</div>
	);
};

export default UploadProgressIndicator;