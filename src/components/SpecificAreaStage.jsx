import React, { useState, useEffect } from "react";
import {
  activityZones,
  itemEffects,
  calculateLifeSatisfaction,
} from "../utils/gameData";

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
  const [showShop, setShowShop] = useState(false);
  const [shopItems, setShopItems] = useState([]);
  const [isUsingItem, setIsUsingItem] = useState(false);

  useEffect(() => {
    console.log("SpecificAreaStage mounted with props:", {
      area,
      player,
      areaDetails,
      areaActivities,
      activityZones: activityZones[area],
      stats,
      visitedAreas,
    });
    if (!visitedAreas.includes(area)) {
      console.log("Adding area to visitedAreas:", area);
      setVisitedAreas([...visitedAreas, area]);
    }
    if (!activityZones[area]) {
      console.warn("No activity zones defined for area:", area);
    }
    if (!areaActivities || areaActivities.length === 0) {
      console.warn("No activities defined for area:", area);
    }
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
  }, [area, visitedAreas, setVisitedAreas, areaActivities, stats, setStats]);

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
    console.log("Player moved to:", { x: newX, y: newY });
    if (!showShop) {
      collectSpawnedItem();
    }
  };

  const getActivityName = (zoneName) => {
    const zoneToActivityMap = {
      "Sleep Spot": "Sleep",
      "Relax Spot": "Relax",
      "Swim Spot": "Swim",
      "Fish Spot": "Fish",
      "Work Spot": "Work",
      "Gather Spot": "Gather",
      "Coconut Stand": "Coconut Stand",
      "Rest Area": "Rest Area",
      Shop: "Shop",
    };
    return zoneToActivityMap[zoneName] || zoneName;
  };

  const startActivity = (activityName) => {
    if (isActivityRunning) return;
    console.log(
      "Attempting to start activity:",
      activityName,
      "in area:",
      area
    );
    const selectedActivity = areaActivities.find(
      (a) => a.name === activityName
    );
    const zone = activityZones[area]?.find(
      (z) => getActivityName(z.name) === activityName
    );
    const requiredItems =
      areaDetails?.lockedActivities?.[activityName] ||
      selectedActivity?.requiredItems;

    if (!selectedActivity) {
      console.error("Activity not found:", activityName);
      alert("Aktivitas tidak ditemukan! Bocchi panik...");
      return;
    }
    if (
      requiredItems &&
      !requiredItems.every((item) => stats.Items.includes(item))
    ) {
      console.warn(
        "Missing required items for",
        activityName,
        ":",
        requiredItems
      );
      alert("Butuh item untuk membuka aktivitas ini! Bocchi sedih...");
      return;
    }
    if (!zone || !checkCollision(position.x, position.y, [zone])) {
      console.warn(
        "Player not in correct zone for",
        activityName,
        "Zone:",
        zone
      );
      alert("Kamu harus berada di zona aktivitas yang benar! Bocchi panik...");
      return;
    }
    if (stats.Money < selectedActivity.cost) {
      console.warn(
        "Insufficient money for",
        activityName,
        "Cost:",
        selectedActivity.cost
      );
      alert("Uang tidak cukup! Bocchi panik...");
      return;
    }

    if (activityName === "Shop") {
      console.log("Opening shop with items:", selectedActivity.shopItems);
      setShowShop(true);
      setShopItems(selectedActivity.shopItems || []);
      return;
    }

    try {
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
                Math.max(
                  0,
                  prev.Meal + (selectedActivity.statChanges?.Meal || 0)
                )
              ),
              Sleep: Math.min(
                100,
                Math.max(
                  0,
                  prev.Sleep + (selectedActivity.statChanges?.Sleep || 0)
                )
              ),
              Happiness: Math.min(
                100,
                Math.max(
                  0,
                  prev.Happiness +
                    (selectedActivity.statChanges?.Happiness || 0)
                )
              ),
              Cleanliness: Math.min(
                100,
                Math.max(
                  0,
                  prev.Cleanliness +
                    (selectedActivity.statChanges?.Cleanliness || 0)
                )
              ),
              Money: prev.Money + (selectedActivity.statChanges?.Money || 0),
              Items: selectedActivity.itemsGained
                ? [...prev.Items, ...selectedActivity.itemsGained]
                : prev.Items,
              lifeSatisfaction: calculateLifeSatisfaction(
                {
                  ...prev,
                  Meal: Math.min(
                    100,
                    Math.max(
                      0,
                      prev.Meal + (selectedActivity.statChanges?.Meal || 0)
                    )
                  ),
                  Sleep: Math.min(
                    100,
                    Math.max(
                      0,
                      prev.Sleep + (selectedActivity.statChanges?.Sleep || 0)
                    )
                  ),
                  Happiness: Math.min(
                    100,
                    Math.max(
                      0,
                      prev.Happiness +
                        (selectedActivity.statChanges?.Happiness || 0)
                    )
                  ),
                  Cleanliness: Math.min(
                    100,
                    Math.max(
                      0,
                      prev.Cleanliness +
                        (selectedActivity.statChanges?.Cleanliness || 0)
                    )
                  ),
                  Money:
                    prev.Money + (selectedActivity.statChanges?.Money || 0),
                  Items: selectedActivity.itemsGained
                    ? [...prev.Items, ...selectedActivity.itemsGained]
                    : prev.Items,
                },
                Array.isArray(visitedAreas) ? visitedAreas : []
              ),
            };
            console.log(
              "Activity completed:",
              activityName,
              "New stats:",
              newStats
            );
            return newStats;
          });
          setIsActivityRunning(false);
          setActivityProgress(0);
          setFastForward(false);
          setCurrentActivity(null);
        }
      }, intervalSpeed);
    } catch (error) {
      console.error("Error in startActivity:", error);
      alert("Terjadi kesalahan saat menjalankan aktivitas! Bocchi panik...");
      setIsActivityRunning(false);
      setCurrentActivity(null);
      setActivityProgress(0);
      setFastForward(false);
    }
  };

  const buyItem = (itemName, itemCost) => {
    if (stats.Money < itemCost) {
      console.warn("Insufficient money to buy", itemName, "Cost:", itemCost);
      alert("Uang tidak cukup untuk membeli item ini! Bocchi sedih...");
      return;
    }
    console.log("Buying item:", itemName);
    setStats((prev) => {
      const newStats = {
        ...prev,
        Money: prev.Money - itemCost,
        Items: [...prev.Items, itemName],
        lifeSatisfaction: calculateLifeSatisfaction(
          {
            ...prev,
            Money: prev.Money - itemCost,
            Items: [...prev.Items, itemName],
          },
          Array.isArray(visitedAreas) ? visitedAreas : []
        ),
      };
      return newStats;
    });
    setShowShop(false);
  };

  const fastForwardActivity = () => {
    if (!isActivityRunning) return;
    console.log("Fast forwarding activity:", currentActivity);
    setFastForward(true);
  };

  const useItem = (itemName) => {
    if (isUsingItem) return;
    setIsUsingItem(true);
    console.log(
      "Attempting to use item:",
      itemName,
      "Current inventory:",
      stats.Items
    );

    const itemEffect = itemEffects[itemName];
    if (!itemEffect) {
      console.error(
        `Item effect not found for ${itemName}. Available effects:`,
        itemEffects
      );
      alert(`Efek untuk item "${itemName}" tidak ditemukan! Bocchi bingung...`);
      setIsUsingItem(false);
      return;
    }
    if (!stats.Items.includes(itemName)) {
      console.error(`Item ${itemName} not found in inventory:`, stats.Items);
      alert(`Item "${itemName}" tidak ada di inventori! Bocchi bingung...`);
      setIsUsingItem(false);
      return;
    }

    if (itemEffect.unlocks) {
      console.log(
        `Item ${itemName} is used to unlock activities:`,
        itemEffect.unlocks
      );
      alert(`Item "${itemName}" digunakan untuk membuka aktivitas tertentu!`);
      setIsUsingItem(false);
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
        Items: [...prev.Items].filter((i) => i !== itemName),
        totalItemsUsed: (prev.totalItemsUsed || 0) + 1,
        lifeSatisfaction: calculateLifeSatisfaction(
          {
            ...prev,
            Meal: Math.min(
              100,
              Math.max(
                0,
                (prev.Meal || 0) + (itemEffect.statChanges?.Meal || 0)
              )
            ),
            Sleep: Math.min(
              100,
              Math.max(
                0,
                (prev.Sleep || 0) + (itemEffect.statChanges?.Sleep || 0)
              )
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
                (prev.Cleanliness || 0) +
                  (itemEffect.statChanges?.Cleanliness || 0)
              )
            ),
            Items: [...prev.Items].filter((i) => i !== itemName),
            totalItemsUsed: (prev.totalItemsUsed || 0) + 1,
          },
          Array.isArray(visitedAreas) ? visitedAreas : []
        ),
      };
      console.log(`Item ${itemName} used, Updated stats:`, newStats);
      alert(`Item "${itemName}" digunakan! Stats diperbarui.`);
      setIsUsingItem(false);
      return newStats;
    });
  };

  const collectSpawnedItem = () => {
    if (
      spawnedItem &&
      Math.sqrt(
        (position.x - spawnedItem.x) ** 2 + (position.y - spawnedItem.y) ** 2
      ) < 30
    ) {
      console.log("Collected item: Broken Apple at", {
        playerPos: position,
        itemPos: spawnedItem,
      });
      setStats((prev) => {
        const newStats = {
          ...prev,
          Items: [...prev.Items, "Broken Apple"],
          lifeSatisfaction: calculateLifeSatisfaction(
            {
              ...prev,
              Items: [...prev.Items, "Broken Apple"],
            },
            Array.isArray(visitedAreas) ? visitedAreas : []
          ),
        };
        return newStats;
      });
      setSpawnedItem(null);
    } else if (spawnedItem) {
      console.log("No collision: Player at", position, "Item at", spawnedItem);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    const statDepletionInterval = setInterval(() => {
      console.log("Depleting stats in SpecificAreaStage");
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

    const spawnInterval = setInterval(() => {
      if (!spawnedItem && Math.random() < 0.1) {
        const newItem = {
          x: Math.random() * 1000,
          y: Math.random() * 600,
        };
        setSpawnedItem(newItem);
        console.log("Spawned item at", newItem);
      }
    }, 1000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(statDepletionInterval);
      clearInterval(spawnInterval);
    };
  }, [position, isActivityRunning, spawnedItem, stats, setStats, visitedAreas]);

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
      <div className="p-4 bg-white shadow-md flex justify-between items-center">
        <div className="text-pink-600">
          Good Morning, {player?.name || "Player"}
        </div>
        <div className="text-pink-600">{currentTime}</div>
        <div className="text-pink-600 flex items-center gap-2">
          Money: ${stats.Money || 0}
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm"
            onClick={() => {
              console.log("Back button clicked, calling onReturn");
              try {
                onReturn();
              } catch (error) {
                console.error("Error clicking back button:", error);
              }
            }}
            disabled={isActivityRunning || showShop}
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
            <li key={`${item}-${index}`} className="flex items-center mb-1">
              <span className="mr-2">
                {item === "Pegasus Apple"
                  ? "🐴🍎"
                  : item === "Broken Apple"
                  ? "🍎"
                  : item === "Fishing Rod"
                  ? "🎣"
                  : "👶"}
              </span>
              {item !== "Fishing Rod" && (
                <button
                  className="px-1 py-0.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-xs"
                  onClick={() => useItem(item)}
                >
                  Use
                </button>
              )}
              <span className="ml-2">{item}</span>
            </li>
          ))}
          {stats.Items.length === 0 && <li>Tidak ada... Bocchi sedih</li>}
        </ul>
      </div>

      {areaDetails && (
        <div className="absolute top-[60%] left-[73%] w-1/4 bg-yellow-100 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-pink-600 mb-2">{area}</h2>
          <p className="text-pink-600">{areaDetails.description}</p>
        </div>
      )}

      {showShop && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-100 p-6 rounded-lg shadow-md z-10">
          <h3 className="text-lg font-bold text-pink-600 mb-4">
            Toko Kessoku Band
          </h3>
          {shopItems.length > 0 ? (
            <ul className="list-none pl-0">
              {shopItems.map((item, index) => (
                <li key={index} className="flex items-center mb-2">
                  <span className="mr-2">{item.name}</span>
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 text-sm"
                    onClick={() => buyItem(item.name, item.cost)}
                    disabled={stats.Money < item.cost}
                  >
                    Beli (${item.cost})
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-pink-600">Tidak ada item di toko ini!</p>
          )}
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
            onClick={() => setShowShop(false)}
          >
            Tutup Toko
          </button>
        </div>
      )}

      {activityZones[area] &&
        !showShop &&
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
                  onClick={() => {
                    const activityName = getActivityName(zone.name);
                    console.log("Starting activity via button:", activityName);
                    startActivity(activityName);
                  }}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200"
                  disabled={isActivityRunning}
                >
                  Start {getActivityName(zone.name)}
                </button>
              </div>
            )
        )}

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
