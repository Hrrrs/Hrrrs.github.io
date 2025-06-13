import React, { useState, useEffect } from "react";
import { activityZones, itemEffects } from "../utils/gameData";

const SpecificAreaStage = ({
  area,
  stats,
  setStats,
  onReturn,
  player,
  areaDetails,
  areaActivities,
  visitedAreas,
  setVisitedAreas,
}) => {
  const [position, setPosition] = useState({ x: 500, y: 300 });
  const [isActivityRunning, setIsActivityRunning] = useState(false);
  const [activityProgress, setActivityProgress] = useState(0);
  const [fastForward, setFastForward] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [spawnedItem, setSpawnedItem] = useState(null);

  useEffect(() => {
    console.log("SpecificAreaStage props:", {
      area,
      player,
      areaDetails,
      areaActivities,
    });
    if (!visitedAreas.includes(area)) {
      setVisitedAreas([...visitedAreas, area]);
    }
  }, [area, visitedAreas, setVisitedAreas]);

  const checkCollision = (x, y, target) => {
    if (!target) return false;
    return target.some(
      (t) => Math.sqrt((x - t.x) ** 2 + (y - t.y) ** 2) < t.radius
    );
  };

  const handleKeyDown = (e) => {
    if (isActivityRunning) return;
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
    collectSpawnedItem();
  };

  const startActivity = (activityName) => {
    if (isActivityRunning) return;
    const selectedActivity = areaActivities.find(
      (a) => a.name === activityName
    );
    const zone = activityZones[area]?.find(
      (z) => z.name === `${activityName} Spot` || z.name === activityName
    );
    const requiredItems = areaDetails?.lockedActivities?.[activityName];

    if (!selectedActivity) {
      alert("Aktivitas tidak ditemukan!");
      return;
    }
    if (
      requiredItems &&
      !requiredItems.every((item) => stats.Items.includes(item))
    ) {
      alert("Butuh item untuk membuka aktivitas ini!");
      return;
    }
    if (!zone || !checkCollision(position.x, position.y, [zone])) {
      alert("Kamu harus berada di zona aktivitas yang benar!");
      return;
    }
    if (stats.Money < selectedActivity.cost) {
      alert("Uang tidak cukup! Bocchi panik...");
      return;
    }

    setIsActivityRunning(true);
    setCurrentActivity(activityName);
    setStats((prev) => ({
      ...prev,
      Money: prev.Money - selectedActivity.cost,
      activitiesPerformed: (prev.activitiesPerformed || 0) + 1,
    }));

    let progress = 0;
    const totalDuration = selectedActivity.duration || 2000;
    const intervalSpeed = fastForward ? 20 : 40;
    const statDecreaseRate = fastForward ? 2 : 1;

    const interval = setInterval(() => {
      progress += 5;
      setActivityProgress(progress);

      if (progress % 50 === 0) {
        setStats((prev) => ({
          ...prev,
          Sleep: Math.max(0, prev.Sleep - statDecreaseRate),
          Happiness: Math.max(0, prev.Happiness - statDecreaseRate),
        }));
      }

      if (progress >= 100) {
        clearInterval(interval);
        setStats((prev) => {
          const newStats = {
            ...prev,
            Meal: Math.min(
              100,
              Math.max(0, prev.Meal + (selectedActivity.statChanges.Meal || 0))
            ),
            Sleep: Math.min(
              100,
              Math.max(
                0,
                prev.Sleep + (selectedActivity.statChanges.Sleep || 0)
              )
            ),
            Happiness: Math.min(
              100,
              Math.max(
                0,
                prev.Happiness + (selectedActivity.statChanges.Happiness || 0)
              )
            ),
            Cleanliness: Math.min(
              100,
              Math.max(
                0,
                prev.Cleanliness +
                  (selectedActivity.statChanges.Cleanliness || 0)
              )
            ),
            Money: prev.Money + (selectedActivity.statChanges.Money || 0),
            Items: selectedActivity.itemsGained
              ? [...prev.Items, ...selectedActivity.itemsGained]
              : prev.Items,
          };
          return newStats;
        });
        setIsActivityRunning(false);
        setActivityProgress(0);
        setFastForward(false);
        setCurrentActivity(null);
      }
    }, intervalSpeed);
  };

  const fastForwardActivity = () => {
    if (!isActivityRunning) return;
    setFastForward(true);
  };

  const useItem = (itemName) => {
    const itemEffect = itemEffects[itemName];
    if (!itemEffect || !stats.Items.includes(itemName)) {
      alert("Item tidak ditemukan di inventori!");
      return;
    }
    setStats((prev) => {
      const newStats = {
        ...prev,
        Meal: Math.min(
          100,
          Math.max(0, (prev.Meal || 0) + (itemEffect.statChanges?.Meal || 0))
        ),
        Sleep: Math.min(
          100,
          Math.max(0, (prev.Sleep || 0) + (itemEffect.statChanges?.Sleep || 0))
        ),
        Happiness: Math.min(
          100,
          Math.max(
            0,
            (prev.Happiness || 0) + (itemEffect.statChanges?.Happiness || 0)
          )
        ),
        Cleanliness: Math.min(
          100,
          Math.max(
            0,
            (prev.Cleanliness || 0) + (itemEffect.statChanges?.Cleanliness || 0)
          )
        ),
        Items: prev.Items.filter((i) => i !== itemName),
        totalItemsUsed: (prev.totalItemsUsed || 0) + 1,
      };
      if (itemEffect.unlocks) {
        console.log(`Unlocked activities for ${itemName}:`, itemEffect.unlocks);
      }
      return newStats;
    });
  };

  const collectSpawnedItem = () => {
    if (
      spawnedItem &&
      Math.sqrt(
        (position.x - spawnedItem.x) ** 2 + (position.y - spawnedItem.y) ** 2
      ) < 20
    ) {
      setStats((prev) => ({
        ...prev,
        Items: [...prev.Items, "Broken Apple"],
      }));
      setSpawnedItem(null);
    }
  };

  const calculateLifeSatisfaction = () => {
    const statBalance =
      (stats.Meal + stats.Sleep + stats.Happiness + stats.Cleanliness) / 4;
    const activityBonus = (stats.activitiesPerformed || 0) * 10;
    const itemCollectedBonus = stats.Items.length * 5;
    const itemUsedBonus = (stats.totalItemsUsed || 0) * 10;
    const areaVarietyBonus = new Set(visitedAreas).size * 7;
    return Math.ceil(
      statBalance +
        activityBonus +
        itemCollectedBonus +
        itemUsedBonus +
        areaVarietyBonus
    );
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // Depleksi stats alami
    const statDepletionInterval = setInterval(() => {
      if (!isActivityRunning) {
        console.log("Depleting stats in SpecificAreaStage");
        setStats((prev) => ({
          ...prev,
          Meal: Math.max(0, prev.Meal - 5),
          Sleep: Math.max(0, prev.Sleep - 5),
          Happiness: Math.max(0, prev.Happiness - 5),
          Cleanliness: Math.max(0, prev.Cleanliness - 5),
        }));
      }
    }, 5000); // Setiap 5 detik

    const spawnInterval = setInterval(() => {
      if (!spawnedItem && Math.random() < 0.01) {
        setSpawnedItem({
          x: Math.random() * 1000,
          y: Math.random() * 600,
        });
      }
    }, 1000);

    const timer = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        lifeSatisfaction: calculateLifeSatisfaction(),
      }));
    }, 1000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(statDepletionInterval);
      clearInterval(spawnInterval);
      clearInterval(timer);
    };
  }, [position, isActivityRunning, spawnedItem, visitedAreas]);

  const currentTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .animate-spin {
            animation: spin 2s linear infinite;
          }
        `}
      </style>
      {/* Header */}
      <div className="p-4 bg-white shadow-md flex justify-between items-center">
        <div className="text-pink-600">
          Good Morning, {player?.name || "Player"}
        </div>
        <div className="text-pink-600">{currentTime}</div>
        <div className="text-pink-600 flex items-center gap-2">
          Money: ${stats.Money}
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm"
            onClick={onReturn}
            disabled={isActivityRunning}
          >
            Back
          </button>
          {isActivityRunning && (
            <button
              className="px-2 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 text-sm"
              onClick={fastForwardActivity}
            >
              Fast Forward 🎵
            </button>
          )}
        </div>
      </div>

      {/* Stats Panel */}
      <div className="absolute top-[100px] left-2 w-1/6 max-w-xs bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-pink-600 mb-2">Stats</h2>
        {["Meal", "Sleep", "Happiness", "Cleanliness"].map((stat) => (
          <div key={stat} className="mb-2">
            <div className="flex justify-between">
              <span>{stat}:</span>
              <span className="text-pink-600">{stats[stat]}</span>
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
                style={{ width: `${stats[stat]}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Score Display */}
      <div className="absolute top-[340px] left-2 w-1/6 max-w-xs bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-pink-600 mb-2">Score</h2>
        <p className="text-pink-600">
          Life Satisfaction: {stats.lifeSatisfaction || 0}
        </p>
      </div>

      {/* Game Arena */}
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
            {spawnedItem && (
              <div
                className="absolute bg-orange-500 rounded-full cursor-pointer"
                style={{
                  width: "20px",
                  height: "20px",
                  left: `${spawnedItem.x - 10}px`,
                  top: `${spawnedItem.y - 10}px`,
                }}
              ></div>
            )}
            <img
              src={player?.avatar || "/src/assets/images/avatars/bocchi.jpg"}
              alt={player?.name || "Player"}
              className={`absolute w-16 h-16 rounded-full shadow-md ${
                isActivityRunning ? "animate-spin" : ""
              }`}
              style={{
                left: `${position.x - 25}px`,
                top: `${position.y - 25}px`,
                transition: "all 0.2s ease",
              }}
            />
            {activityZones[area] ? (
              activityZones[area].map((zone, index) => (
                <div
                  key={index}
                  className="absolute bg-green-300 rounded-full opacity-50"
                  style={{
                    width: `${zone.radius * 2}px`,
                    height: `${zone.radius * 2}px`,
                    left: `${zone.x - zone.radius}px`,
                    top: `${zone.y - zone.radius}px`,
                  }}
                >
                  <span className="text-center text-black block pt-3 text-xs">
                    {zone.name}
                  </span>
                </div>
              ))
            ) : (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-600">
                Tidak ada zona aktivitas untuk area ini!
              </div>
            )}
          </div>
        </div>
        <div className="w-1/6 max-w-xs"></div>
      </div>
      <div className="absolute top-[100px] right-2 w-1/6 max-w-xs bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-pink-600 mb-2">Player's Items</h2>
        <ul className="list-none pl-0 text-black">
          {stats.Items.map((item, index) => (
            <li key={index} className="flex items-center mb-1">
              <span className="mr-2">
                {item === "Pegasus Apple"
                  ? "🐴🍎"
                  : item === "Broken Apple"
                  ? "🍎"
                  : item === "Fishing Rod"
                  ? "🎣"
                  : "👶"}
              </span>
              <button
                className="px-1 py-0.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-xs"
                onClick={() => useItem(item)}
              >
                Use
              </button>
              <span className="ml-2">{item}</span>
            </li>
          ))}
          {stats.Items.length === 0 && <li>Tidak ada... Bocchi sedih</li>}
        </ul>
      </div>

      {/* Area Info Panel */}
      {areaDetails && (
        <div className="absolute top-[60%] left-[73%] w-1/4 bg-yellow-100 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-pink-600 mb-2">{area}</h2>
          <p className="text-pink-600">{areaDetails.description}</p>
        </div>
      )}

      {/* Activity Buttons */}
      {activityZones[area] &&
        activityZones[area].map(
          (zone) =>
            checkCollision(position.x, position.y, [zone]) && (
              <div
                key={zone.name}
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-yellow-100 p-4 rounded-lg shadow-md"
              >
                <h3 className="text-lg font-bold text-pink-600 mb-2">
                  {zone.name}
                </h3>
                <button
                  onClick={() => startActivity(zone.name.replace(" Spot", ""))}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200"
                  disabled={isActivityRunning}
                >
                  Start {zone.name.replace(" Spot", "")}
                </button>
              </div>
            )
        )}

      {/* Activity Progress */}
      {isActivityRunning && (
        <div className="absolute bottom-20 left-4 bg-pink-200 text-pink-600 p-2 rounded-lg shadow-md">
          <div
            className="bg-pink-600 h-2 rounded"
            style={{ width: `${activityProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default SpecificAreaStage;
