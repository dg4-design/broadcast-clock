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
  const [showChildElements, setShowChildElements] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date());
      requestAnimationFrame(updateTime);
    };

    const animationId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationId);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === "e") {
        setShowChildElements((prev) => !prev);
      }
    };

    let touchStartTime = 0;
    let initialPinchDistance = 0;
    const DOUBLE_TAP_DELAY = 300; // 300ms以内のタップを判定
    const PINCH_THRESHOLD = 50; // ピンチの最小距離

    const getTouchDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch((err) => {
            console.error("フルスクリーンに切り替えできませんでした:", err);
          });
      } else {
        document
          .exitFullscreen()
          .then(() => {
            setIsFullscreen(false);
          })
          .catch((err) => {
            console.error("フルスクリーンを終了できませんでした:", err);
          });
      }
    };

    const handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        touchStartTime = Date.now();
        initialPinchDistance = getTouchDistance(event.touches[0], event.touches[1]);
        event.preventDefault(); // ピンチズームを無効化
      }
    };

    const handleTouchMove = (event) => {
      if (event.touches.length === 2) {
        event.preventDefault(); // ピンチズームを無効化
      }
    };

    const handleTouchEnd = (event) => {
      if (event.changedTouches.length === 2 && touchStartTime > 0) {
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;

        // 短時間のタッチ（タップ）かつ二本指の場合
        if (touchDuration < DOUBLE_TAP_DELAY) {
          event.preventDefault();
          setShowChildElements((prev) => !prev);
        }

        touchStartTime = 0;
        initialPinchDistance = 0;
      } else if (event.touches.length === 0 && initialPinchDistance > 0) {
        // ピンチ操作の終了時にフルスクリーン切り替え
        const currentPinchDistance = getTouchDistance(event.changedTouches[0], event.changedTouches[1]);

        const pinchDelta = Math.abs(currentPinchDistance - initialPinchDistance);

        if (pinchDelta > PINCH_THRESHOLD) {
          event.preventDefault();
          toggleFullscreen();
        }

        initialPinchDistance = 0;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    const linkWrapper = document.querySelector('div[style*="position: fixed"][style*="bottom: 16px"][style*="right: 16px"]');
    if (linkWrapper) {
      linkWrapper.style.display = showChildElements ? "flex" : "none";
    }
  }, [showChildElements]);

  return (
    <div className="clock-container">
      <AnalogClock time={time} />
      <DigitalClock time={time} />
    </div>
  );
}

ReactDOM.render(<Clock />, document.getElementById("app"));
