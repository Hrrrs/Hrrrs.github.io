import React, { useState, useEffect } from "react";
import {
  areas,
  areaDetails,
  areaActivities,
  itemEffects,
} from "../utils/gameData";

const MainGameArena = ({
  player,
  stats,
  setStats,
  onEnterArea,
  onGameOver,
  visitedAreas = [],
  setVisitedAreas = () => {},
}) => {
  const [position, setPosition] = useState({ x: 400, y: 200 });
  const [currentArea, setCurrentArea] = useState(null);
  const [isActivityRunning, setIsActivityRunning] = useState(false);
  const [activityProgress, setActivityProgress] = useState(0);
  const [fastForward, setFastForward] = useState(false);
  const [spawnedItem, setSpawnedItem] = useState(null);
  const [selectedAreaInfo, setSelectedAreaInfo] = useState(null);

  const checkAreaCollision = (x, y) =>
    areas.find(
      (area) => Math.sqrt((x - area.x) ** 2 + (y - area.y) ** 2) < area.radius
    );

  const handleMovement = (dx, dy) => {
    if (isActivityRunning) return;
    const newX = Math.max(50, Math.min(position.x + dx, 750));
    const newY = Math.max(0, Math.min(position.y + dy, 550));
    setPosition({ x: newX, y: newY });

    const area = checkAreaCollision(newX, newY);
    console.log(
      "Player position:",
      { x: newX, y: newY },
      "Detected area:",
      area ? area.name : "none"
    );
    if (area) {
      if (!visitedAreas.includes(area.name)) {
        setVisitedAreas([...visitedAreas, area.name]);
      }
      setCurrentArea(area.name);
      setSelectedAreaInfo({
        name: area.name,
        description: areaDetails[area.name].description,
        activities: areaDetails[area.name].activities,
      });
      console.log("Triggering onEnterArea for:", area);
      onEnterArea(area);
    } else {
      setCurrentArea(null);
      setSelectedAreaInfo(null);
    }
  };

  const handleAreaClick = (area) => {
    setPosition({ x: area.x - 25, y: area.y - 25 });
    console.log("Clicked area:", area.name);
    if (!visitedAreas.includes(area.name)) {
      setVisitedAreas([...visitedAreas, area.name]);
    }
    setCurrentArea(area.name);
    setSelectedAreaInfo({
      name: area.name,
      description: areaDetails[area.name].description,
      activities: areaDetails[area.name].activities,
    });
    console.log("Triggering onEnterArea for:", area);
    onEnterArea(area);
  };

  const startActivity = (activityName) => {
    if (!currentArea || isActivityRunning) return;
    const selectedActivity = areaActivities[currentArea].find(
      (a) => a.name === activityName
    );
    if (!selectedActivity) {
      alert("Aktivitas tidak ditemukan!");
      return;
    }
    const requiredItems =
      areaDetails[currentArea]?.lockedActivities?.[activityName];
    const hasRequiredItems = requiredItems
      ? requiredItems.every((item) => stats.Items.includes(item))
      : true;
    if (!hasRequiredItems) {
      alert("Butuh item untuk membuka aktivitas ini!");
      return;
    }
    if (stats.Money < selectedActivity.cost) {
      alert("Uang tidak cukup! Bocchi panik...");
      return;
    }

    setIsActivityRunning(true);
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
      }
    }, intervalSpeed);
  };

  const buyItem = (itemName) => {
    const shopActivity = areaActivities[currentArea]?.find(
      (a) => a.name === "Shop"
    );
    const item = shopActivity?.shopItems?.find((i) => i.name === itemName);
    if (!item || stats.Money < item.cost) {
      alert("Uang tidak cukup atau item tidak tersedia!");
      return;
    }
    setStats((prev) => ({
      ...prev,
      Money: prev.Money - item.cost,
      Items: [...prev.Items, itemName],
    }));
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
      ) < 25
    ) {
      setStats((prev) => ({
        ...prev,
        Items: [...prev.Items, "Broken Apple"],
      }));
      setSpawnedItem(null);
    }
  };

  const fastForwardActivity = () => {
    if (!isActivityRunning) return;
    setFastForward(true);
  };

  const calculateLifeSatisfaction = () => {
    const statBalance =
      (stats.Meal + stats.Sleep + stats.Happiness + stats.Cleanliness) / 4;
    const activityBonus = (stats.activitiesPerformed || 0) * 10;
    const itemCollectedBonus = stats.Items.length * 5;
    const itemUsedBonus = (stats.totalItemsUsed || 0) * 10;
    const areaVarietyBonus = new Set(visitedAreas).size * 20;
    return Math.floor(
      statBalance +
        activityBonus +
        itemCollectedBonus +
        itemUsedBonus +
        areaVarietyBonus
    );
  };

  useEffect(() => {
    console.log("Player data in MainGameArena:", player);
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "w":
          handleMovement(0, -50);
          break;
        case "a":
          handleMovement(-50, 0);
          break;
        case "s":
          handleMovement(0, 50);
          break;
        case "d":
          handleMovement(50, 0);
          break;
        default:
          break;
      }
      collectSpawnedItem();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Depleksi stats alami
    const statDepletionInterval = setInterval(() => {
      if (!isActivityRunning) {
        console.log("Depleting stats in MainGameArena");
        setStats((prev) => ({
          ...prev,
          Meal: Math.max(0, prev.Meal - 1),
          Sleep: Math.max(0, prev.Sleep - 1),
          Happiness: Math.max(0, prev.Happiness - 1),
          Cleanliness: Math.max(0, prev.Cleanliness - 1),
        }));
      }
    }, 1000); // Setiap 1 detik

    const spawnInterval = setInterval(() => {
      if (!spawnedItem && Math.random() < 0.01) {
        setSpawnedItem({
          x: Math.random() * 700 + 50,
          y: Math.random() * 550,
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
      <div className="p-4 bg-white shadow-md flex justify-between items-center">
        <div className="text-pink-600">
          Good Morning, {player?.name || "Player"}
        </div>
        <div className="text-pink-600">{currentTime}</div>
        <div className="text-pink-600 flex items-center gap-2">
          Money: ${stats.Money}
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

      <div className="absolute top-[340px] left-2 w-1/6 max-w-xs bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold text-pink-600 mb-2">Score</h2>
        <p className="text-pink-600">
          Life Satisfaction: {stats.lifeSatisfaction || 0}
        </p>
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
            {areas.map((area, index) => (
              <div
                key={index}
                className="absolute bg-yellow-300 rounded-full cursor-pointer hover:bg-yellow-400 transition-all duration-200"
                style={{
                  width: `${area.radius * 2}px`,
                  height: `${area.radius * 2}px`,
                  left: `${area.x - area.radius}px`,
                  top: `${area.y - area.radius}px`,
                }}
                onClick={() => handleAreaClick(area)}
              >
                <span className="text-center text-pink-600 block pt-6">
                  {area.name}
                </span>
              </div>
            ))}
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
              className="absolute w-16 h-16 rounded-full shadow-md"
              style={{
                left: `${position.x - 25}px`,
                top: `${position.y - 25}px`,
                transition: "all 0.2s ease",
              }}
            />
            {currentArea && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                {areaActivities[currentArea].map((activity, idx) => {
                  const requiredItems =
                    areaDetails[currentArea]?.lockedActivities?.[activity.name];
                  const hasRequiredItems = requiredItems
                    ? requiredItems.every((item) => stats.Items.includes(item))
                    : true;
                  if (!hasRequiredItems) return null;
                  return (
                    <button
                      key={idx}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200 mx-1 mb-2"
                      onClick={() =>
                        activity.name === "Shop"
                          ? null
                          : startActivity(activity.name)
                      }
                      disabled={
                        isActivityRunning ||
                        (activity.name === "Shop" && !activity.shopItems)
                      }
                    >
                      {activity.name === "Shop" ? (
                        <div>
                          Shop
                          {activity.shopItems.map((item, i) => (
                            <button
                              key={i}
                              className="block px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 mt-1"
                              onClick={() => buyItem(item.name)}
                              disabled={stats.Money < item.cost}
                            >
                              Buy {item.name} (${item.cost})
                            </button>
                          ))}
                        </div>
                      ) : (
                        activity.name
                      )}
                    </button>
                  );
                })}
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

      {selectedAreaInfo && (
        <div className="absolute top-[60%] left-[60%] w-1/4 bg-yellow-100 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-pink-600 mb-2">
            {selectedAreaInfo.name}
          </h2>
          <p className="text-pink-600">{selectedAreaInfo.description}</p>
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button
            className="bg-gray-500 text-white w-12 h-12 rounded-full hover:bg-gray-600 transition-colors"
            onClick={() => handleMovement(0, -50)}
          >
            ↑
          </button>
          <div></div>
          <button
            className="bg-gray-500 text-white w-12 h-12 rounded-full hover:bg-gray-600 transition-colors"
            onClick={() => handleMovement(-50, 0)}
          >
            ←
          </button>
          <div></div>
          <button
            className="bg-gray-500 text-white w-12 h-12 rounded-full hover:bg-gray-600 transition-colors"
            onClick={() => handleMovement(50, 0)}
          >
            →
          </button>
          <div></div>
          <button
            className="bg-gray-500 text-white w-12 h-12 rounded-full hover:bg-gray-600 transition-colors"
            onClick={() => handleMovement(0, 50)}
          >
            ↓
          </button>
          <div></div>
        </div>
      </div>

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

export default MainGameArena;
