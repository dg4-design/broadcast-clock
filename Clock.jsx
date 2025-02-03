const { useState, useEffect } = React;

function AnalogClock({ time }) {
  return (
    <div className="clock" id="analog-clock">
      <svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="95" fill="none" stroke="#fff" strokeWidth="2" />
        {[...Array(60)].map((_, i) => {
          const angle = ((i * 6 - 90) * Math.PI) / 180;
          const radius = i % 5 === 0 ? 85 : 90;
          return i % 5 === 0 ? <circle key={i} cx={100 + Math.cos(angle) * radius} cy={100 + Math.sin(angle) * radius} r="2" fill="#fff" /> : null;
        })}
        {["hour", "minute", "second"].map((hand) => {
          const milliseconds = time.getMilliseconds() / 1000;
          const seconds = time.getSeconds() + milliseconds;
          const minutes = time.getMinutes() + seconds / 60;
          const hours = (time.getHours() % 12) + minutes / 60;

          const value = hand === "hour" ? hours : hand === "minute" ? minutes : seconds;
          const angle = value * (hand === "hour" ? 30 : 6);
          const length = hand === "hour" ? 60 : hand === "minute" ? 80 : 90;

          return (
            <line
              key={hand}
              x1="100"
              y1="100"
              x2="100"
              y2={100 - length}
              stroke={hand === "second" ? "red" : "#fff"}
              strokeWidth={hand === "hour" ? 5 : hand === "minute" ? 3 : 2}
              transform={`rotate(${angle}, 100, 100)`}
            />
          );
        })}
        <circle cx="100" cy="100" r="4" fill="#f00" />
      </svg>
    </div>
  );
}

function DigitalClock({ time }) {
  const options = {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  return (
    <div className="clock" id="digital-clock">
      {time.toLocaleTimeString("ja-JP", options)}
    </div>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date());
      requestAnimationFrame(updateTime);
    };

    const animationId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="clock-container">
      <AnalogClock time={time} />
      <DigitalClock time={time} />
    </div>
  );
}

ReactDOM.render(<Clock />, document.getElementById("app"));
