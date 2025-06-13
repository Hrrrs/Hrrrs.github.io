import React, { useState, useEffect } from "react";
import MainGameArena from "./components/MainGameArena";
import SpecificAreaStage from "./components/SpecificAreaStage";
import InitialScreen from "./components/InitialScreen";
import { areaDetails, areaActivities } from "./utils/gameData";

const App = () => {
  const [stats, setStats] = useState({
    Meal: 100,
    Sleep: 100,
    Happiness: 100,
    Cleanliness: 100,
    Money: 100,
    Items: [],
    activitiesPerformed: 0,
    totalItemsUsed: 0,
    lifeSatisfaction: 0,
    visitedAreas: [],
  });
  const [currentAreaData, setCurrentAreaData] = useState(null);
  const [player, setPlayer] = useState(null);
  const [screen, setScreen] = useState("initial");

  const onStartGame = (playerData) => {
    console.log("Data player diterima di App:", playerData);
    setPlayer(playerData);
    setScreen("game");
  };

  const onEnterArea = (area) => {
    console.log("App: Masuk ke area:", area);
    if (!area || !area.name) {
      console.error("Data area tidak valid:", area);
      return;
    }
    setCurrentAreaData({
      name: area.name,
      areaDetails: areaDetails[area.name],
      areaActivities: areaActivities[area.name],
    });
    setScreen("specificArea");
  };

  const onReturn = () => {
    console.log("Kembali ke MainGameArena");
    setCurrentAreaData(null);
    setScreen("game");
  };

  const onGameOver = () => {
    console.log("Game Over! Stats:", stats);
    alert("Game Over! Bocchi kelelahan...");
    setScreen("initial");
    setStats({
      Meal: 100,
      Sleep: 100,
      Happiness: 100,
      Cleanliness: 100,
      Money: 100,
      Items: [],
      activitiesPerformed: 0,
      totalItemsUsed: 0,
      lifeSatisfaction: 0,
      visitedAreas: [],
    });
    setPlayer(null);
  };

  useEffect(() => {
    if (
      stats.Meal <= 0 ||
      stats.Sleep <= 0 ||
      stats.Happiness <= 0 ||
      stats.Cleanliness <= 0
    ) {
      onGameOver();
    }
  }, [stats]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {screen === "initial" && <InitialScreen onStart={onStartGame} />}
      {screen === "game" && (
        <MainGameArena
          player={player}
          stats={stats}
          setStats={setStats}
          onEnterArea={onEnterArea}
          onGameOver={onGameOver}
          visitedAreas={stats.visitedAreas}
          setVisitedAreas={(newAreas) =>
            setStats((prev) => ({ ...prev, visitedAreas: newAreas }))
          }
        />
      )}
      {screen === "specificArea" && currentAreaData && (
        <SpecificAreaStage
          area={currentAreaData.name} // Mengirim string nama area
          stats={stats}
          setStats={setStats}
          onReturn={onReturn}
          player={player}
          areaDetails={currentAreaData.areaDetails}
          areaActivities={currentAreaData.areaActivities}
          visitedAreas={stats.visitedAreas}
          setVisitedAreas={(newAreas) =>
            setStats((prev) => ({ ...prev, visitedAreas: newAreas }))
          }
        />
      )}
    </div>
  );
};

export default App;
