const { useState, useEffect } = React;

function AnalogClock({ time }) {
  return (
    <div className="clock" id="analog-clock">
      <svg width="200" height="200">
        <circle cx="100" cy="100" r="95" fill="none" stroke="#fff" strokeWidth="2" />
        {[...Array(12)].map((_, i) => {
          const angle = ((i * 30 - 90) * Math.PI) / 180;
          return <line key={i} x1={100 + Math.cos(angle) * 90} y1={100 + Math.sin(angle) * 90} x2={100 + Math.cos(angle) * 100} y2={100 + Math.sin(angle) * 100} stroke="#000" strokeWidth="2" />;
        })}
        {["hour", "minute", "second"].map((hand) => {
          const value = hand === "hour" ? time.getHours() % 12 : time[`get${hand.charAt(0).toUpperCase() + hand.slice(1)}s`]();
          const angle = (((value + (hand === "hour" ? time.getMinutes() / 60 : 0)) * (hand === "hour" ? 30 : 6) - 90) * Math.PI) / 180;
          const length = hand === "hour" ? 60 : hand === "minute" ? 80 : 90;
          return (
            <line
              key={hand}
              x1="100"
              y1="100"
              x2={100 + Math.cos(angle) * length}
              y2={100 + Math.sin(angle) * length}
              stroke={hand === "second" ? "red" : "#fff"}
              strokeWidth={hand === "hour" ? 5 : hand === "minute" ? 3 : 2}
            />
          );
        })}
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
      const now = new Date();
      const delay = 1000 - now.getMilliseconds();
      setTimeout(() => setTime(new Date()), delay);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="clock-container">
      <AnalogClock time={time} />
      <DigitalClock time={time} />
    </div>
  );
}

ReactDOM.render(<Clock />, document.getElementById("app"));
