import React, { useState, useEffect } from "react";
import { calculateLifeSatisfaction } from "../utils/gameData";

const MainGameArena = ({
  stats,
  setStats,
  player,
  areas,
  onEnterArea,
  visitedAreas,
  setVisitedAreas,
}) => {
  const [position, setPosition] = useState({ x: 500, y: 300 });

  useEffect(() => {
    console.log("MainGameArena mounted with props:", {
      stats,
      player,
      areas,
      visitedAreas,
    });
    if (
      !stats.lifeSatisfaction ||
      !stats.lifeSatisfaction.details ||
      typeof Number(stats.lifeSatisfaction.details["Stat Balance"]) !==
        "number" ||
      isNaN(Number(stats.lifeSatisfaction.details["Stat Balance"]))
    ) {
      console.warn("Invalid stats.lifeSatisfaction, recalculating...");
      setStats((prev) => ({
        ...prev,
        lifeSatisfaction: calculateLifeSatisfaction(
          prev,
          Array.isArray(visitedAreas) ? visitedAreas : []
        ),
      }));
    }
  }, [stats, setStats, visitedAreas]);

  const checkCollision = (x, y, target) => {
    if (!target) return false;
    return target.some(
      (t) => Math.sqrt((x - t.x) ** 2 + (y - t.y) ** 2) < t.radius
    );
  };

  const handleKeyDown = (e) => {
    let newX = position.x;
    let newY = position.y;

    switch (e.key) {
      case "w":
        newY -= 50;
        break;
      case "a":
        newX -= 50;
        break;
      case "s":
        newY += 50;
        break;
      case "d":
        newX += 50;
        break;
      default:
        break;
    }

    newX = Math.max(0, Math.min(newX, 1000));
    newY = Math.max(0, Math.min(newY, 600));
    setPosition({ x: newX, y: newY });
    console.log("Player moved to:", { x: newX, y: newY });
  };

  const handleAreaClick = (area) => {
    console.log("Area clicked:", area.name);
    if (checkCollision(position.x, position.y, [area])) {
      console.log("Player is in area:", area.name);
      try {
        onEnterArea(area.name);
      } catch (error) {
        console.error("Error entering area:", error);
      }
    } else {
      console.log("Player not in area:", area.name);
      alert("Kamu harus berada di zona area untuk masuk! Bocchi panik...");
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    const statDepletionInterval = setInterval(() => {
      console.log("Depleting stats in MainGameArena");
      setStats((prev) => {
        const newStats = {
          ...prev,
          Meal: Math.max(0, prev.Meal - 1),
          Sleep: Math.max(0, prev.Sleep - 1),
          Happiness: Math.max(0, prev.Happiness - 1),
          Cleanliness: Math.max(0, prev.Cleanliness - 1),
          lifeSatisfaction: calculateLifeSatisfaction(
            {
              ...prev,
              Meal: Math.max(0, prev.Meal - 1),
              Sleep: Math.max(0, prev.Sleep - 1),
              Happiness: Math.max(0, prev.Happiness - 1),
              Cleanliness: Math.max(0, prev.Cleanliness - 1),
            },
            Array.isArray(visitedAreas) ? visitedAreas : []
          ),
        };
        return newStats;
      });
    }, 2000); // Changed from 5000 to 2000 ms (2 seconds)

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(statDepletionInterval);
    };
  }, [position, setStats, visitedAreas]);

  const currentTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  const formatScoreValue = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num.toFixed(1) : "0.0";
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="p-4 bg-white shadow-md flex justify-between items-center">
        <div className="text-pink-600">
          Good Morning, {player?.name || "Player"}
        </div>
        <div className="text-pink-600">{currentTime}</div>
        <div className="text-pink-600">Money: ${stats.Money || 0}</div>
      </div>

      <div className="absolute top-[100px] left-2 w-1/6 max-w-xs bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-pink-600 mb-2">Stats</h2>
        {["Meal", "Sleep", "Happiness", "Cleanliness"].map((stat) => (
          <div key={stat} className="mb-2">
            <div className="flex justify-between">
              <span className="text-gray-800">{stat}:</span>
              <span className="text-pink-600">{stats[stat] || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  stat === "Meal"
                    ? "bg-green-600"
                    : stat === "Sleep"
                    ? "bg-blue-600"
                    : stat === "Happiness"
                    ? "bg-yellow-600"
                    : "bg-purple-600"
                }`}
                style={{ width: `${stats[stat] || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute top-[340px] left-2 w-1/6 max-w-xs bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-pink-600 mb-2">Score</h2>
        <p className="text-pink-600 font-semibold">
          Life Satisfaction: {stats.lifeSatisfaction?.total || 0}
        </p>
        <div className="text-sm text-gray-800 mt-2">
          <p>
            Stat Balance:{" "}
            {formatScoreValue(
              stats.lifeSatisfaction?.details?.["Stat Balance"]
            )}
          </p>
          <p>Activities: {stats.lifeSatisfaction?.details?.Activities || 0}</p>
          <p>
            Items Collected & Used:{" "}
            {formatScoreValue(
              stats.lifeSatisfaction?.details?.["Items Collected & Used"]
            )}
          </p>
          <p>
            Area Variety:{" "}
            {stats.lifeSatisfaction?.details?.["Area Variety"] || 0}
          </p>
        </div>
      </div>

      <div className="flex flex-1 h-[calc(100vh-64px)] items-stretch justify-center">
        <div className="w-1/6 max-w-xs"></div>
        <div className="flex-1 flex flex-col justify-center items-center">
          <div
            className="relative w-full max-w-3xl h-[80vh] min-h-[500px] flex-1 bg-white rounded-lg shadow-lg overflow-hidden m-4 flex items-center justify-center"
            style={{
              backgroundImage: `url(${player?.bgImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-200 via-pink-100 to-blue-200 rounded-lg shadow-lg opacity-50"></div>
            <img
              src={player?.avatar || "/src/assets/images/avatars/bocchi.jpg"}
              alt={player?.name || "Player"}
              className="absolute w-16 h-16 rounded-full shadow-md"
              style={{
                left: `${position.x - 25}px`,
                top: `${position.y - 25}px`,
                transition: "all 0.2s ease",
              }}
            />
            {areas.map((area, index) => (
              <div
                key={index}
                className="absolute bg-blue-300 rounded-full opacity-50 cursor-pointer"
                style={{
                  width: `${area.radius * 2}px`,
                  height: `${area.radius * 2}px`,
                  left: `${area.x - area.radius}px`,
                  top: `${area.y - area.radius}px`,
                }}
                onClick={() => handleAreaClick(area)}
              >
                <span className="text-center text-black block pt-3 text-xs">
                  {area.name}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/6 max-w-xs"></div>
      </div>
    </div>
  );
};

export default MainGameArena;
