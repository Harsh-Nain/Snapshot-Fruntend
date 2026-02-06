import "../App.css";

const DotSpinner = ({ size = "1rem", color = "#ff1d1d", speed = "0.9s", visible = true, className = "", }) => {
    return (
        <span className={`dot-spinner ${!visible ? "invisible" : ""} ${className}`} style={{ "--uib-size": size, "--uib-color": color, "--uib-speed": speed, }}>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="dot-spinner__dot"></div>
            ))}
        </span>
    );
};

export default DotSpinner;