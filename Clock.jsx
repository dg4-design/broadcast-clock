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
      } else if (event.key.toLowerCase() === "f") {
        // デバッグ用：Fキーでもフルスクリーン切り替え
        toggleFullscreen();
      }
    };

    let touchStartTime = 0;
    let initialPinchDistance = 0;
    let currentPinchDistance = 0;
    const DOUBLE_TAP_DELAY = 300; // 300ms以内のタップを判定
    const PINCH_THRESHOLD = 50; // ピンチの最小距離

    const getTouchDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const toggleFullscreen = () => {
      console.log("フルスクリーン切り替え実行中...");

      // ブラウザ対応チェック
      if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled && !document.mozFullScreenEnabled) {
        console.error("このブラウザはフルスクリーンAPIをサポートしていません");
        return;
      }

      const requestFullscreen = document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen || document.documentElement.mozRequestFullScreen;

      const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;

      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;

      if (!isFullscreen) {
        if (requestFullscreen) {
          requestFullscreen
            .call(document.documentElement)
            .then(() => {
              console.log("フルスクリーンに切り替わりました");
              setIsFullscreen(true);
            })
            .catch((err) => {
              console.error("フルスクリーンに切り替えできませんでした:", err);
            });
        } else {
          console.error("requestFullscreen APIが利用できません");
        }
      } else {
        if (exitFullscreen) {
          exitFullscreen
            .call(document)
            .then(() => {
              console.log("フルスクリーンを終了しました");
              setIsFullscreen(false);
            })
            .catch((err) => {
              console.error("フルスクリーンを終了できませんでした:", err);
            });
        } else {
          console.error("exitFullscreen APIが利用できません");
        }
      }
    };

    const handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        touchStartTime = Date.now();
        initialPinchDistance = getTouchDistance(event.touches[0], event.touches[1]);
        console.log("ピンチ開始:", initialPinchDistance);
        event.preventDefault(); // ピンチズームを無効化
      }
    };

    const handleTouchMove = (event) => {
      if (event.touches.length === 2) {
        currentPinchDistance = getTouchDistance(event.touches[0], event.touches[1]);
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
          console.log("二本指タップ検出: childElements切り替え");
        }

        touchStartTime = 0;
        initialPinchDistance = 0;
        currentPinchDistance = 0;
      } else if (event.touches.length === 0 && initialPinchDistance > 0 && currentPinchDistance > 0) {
        // ピンチ操作の終了時にフルスクリーン切り替え
        const pinchDelta = Math.abs(currentPinchDistance - initialPinchDistance);
        console.log("ピンチ終了:", { initialPinchDistance, currentPinchDistance, pinchDelta });

        if (pinchDelta > PINCH_THRESHOLD) {
          event.preventDefault();
          console.log("ピンチ検出: フルスクリーン切り替え");
          toggleFullscreen();
        }

        initialPinchDistance = 0;
        currentPinchDistance = 0;
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
