import React, { useState, useEffect } from "react";
import InitialScreen from "./components/InitialScreen";
import MainGameArena from "./components/MainGameArena";
import SpecificAreaStage from "./components/SpecificAreaStage";
import {
  areas,
  areaDetails,
  areaActivities,
  calculateLifeSatisfaction,
} from "./utils/gameData";

const App = () => {
  const [player, setPlayer] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("initial");
  const [currentArea, setCurrentArea] = useState(null);
  const [stats, setStats] = useState({
    Meal: 50,
    Sleep: 50,
    Happiness: 50,
    Cleanliness: 50,
    Money: 100,
    Items: [],
    visitedAreas: [],
    activitiesPerformed: 0,
    totalItemsUsed: 0,
    lifeSatisfaction: calculateLifeSatisfaction(
      {
        Meal: 50,
        Sleep: 50,
        Happiness: 50,
        Cleanliness: 50,
        Money: 100,
        Items: [],
        visitedAreas: [],
        activitiesPerformed: 0,
        totalItemsUsed: 0,
      },
      []
    ),
  });
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const checkGameOver = () => {
      if (
        stats.Meal <= 0 ||
        stats.Sleep <= 0 ||
        stats.Happiness <= 0 ||
        stats.Cleanliness <= 0
      ) {
        setGameOver(true);
      }
    };

    const depletionInterval = setInterval(() => {
      setStats((prev) => {
        const newStats = {
          ...prev,
          Meal: Math.max(0, prev.Meal - 1),
          Sleep: Math.max(0, prev.Sleep - 1),
          Happiness: Math.max(0, prev.Happiness - 1),
          Cleanliness: Math.max(0, prev.Cleanliness - 1),
        };
        checkGameOver();
        return newStats;
      });
    }, 2000);

    return () => clearInterval(depletionInterval);
  }, [stats]);

  const handleStart = (playerData) => {
    setPlayer(playerData);
    setCurrentScreen("main");
    setGameOver(false);
  };

  const handleGameOver = () => {
    setCurrentScreen("initial");
    setPlayer(null);
    setStats({
      Meal: 50,
      Sleep: 50,
      Happiness: 50,
      Cleanliness: 50,
      Money: 100,
      Items: [],
      visitedAreas: [],
      activitiesPerformed: 0,
      totalItemsUsed: 0,
      lifeSatisfaction: calculateLifeSatisfaction(
        {
          Meal: 50,
          Sleep: 50,
          Happiness: 50,
          Cleanliness: 50,
          Money: 100,
          Items: [],
          visitedAreas: [],
          activitiesPerformed: 0,
          totalItemsUsed: 0,
        },
        []
      ),
    });
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-red-100">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Game Over!</h1>
        <p className="text-lg text-gray-800 mb-4">
          Salah satu status Anda mencapai nol. Bocchi kelelahan...
        </p>
        <button
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all duration-200"
          onClick={handleGameOver}
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      {currentScreen === "initial" && <InitialScreen onStart={handleStart} />}
      {currentScreen === "main" && (
        <MainGameArena
          stats={stats}
          setStats={setStats}
          player={player}
          areas={areas}
          onEnterArea={(areaName) => {
            setCurrentArea(areaName);
            setCurrentScreen("area"); // ini yang bikin pindah ke SpecificAreaStage
          }}
          visitedAreas={stats.visitedAreas}
          setVisitedAreas={(newAreas) =>
            setStats((prev) => ({ ...prev, visitedAreas: newAreas }))
          }
        />
      )}
      {currentScreen === "area" && (
        <SpecificAreaStage
          area={currentArea}
          stats={stats}
          setStats={setStats}
          onReturn={() => setCurrentScreen("main")}
          player={player}
          areaDetails={areaDetails[currentArea]}
          areaActivities={areaActivities[currentArea]}
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
