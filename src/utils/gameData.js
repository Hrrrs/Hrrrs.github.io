export const areas = [
  { name: "Beach", x: 700, y: 150, radius: 50 },
  { name: "Home", x: 300, y: 150, radius: 50 },
  { name: "City", x: 500, y: 400, radius: 50 },
  { name: "Forest", x: 200, y: 400, radius: 50 },
];

export const areaDetails = {
  Beach: {
    description: "Pantai yang indah dengan pasir putih dan ombak yang tenang.",
    lockedActivities: { Fish: ["Fishing Rod"] },
  },
  Home: {
    description: "Rumah yang nyaman untuk beristirahat dan bersantai.",
    lockedActivities: {},
  },
  City: {
    description: "Kota yang sibuk dengan banyak toko dan aktivitas.",
    lockedActivities: {},
  },
  Forest: {
    description: "Hutan lebat yang penuh dengan petualangan.",
    lockedActivities: { Gather: ["Pegasus Apple"] },
  },
};

export const activityZones = {
  Beach: [
    { name: "Swim Spot", x: 100, y: 100, radius: 40 },
    { name: "Coconut Stand", x: 100, y: 200, radius: 40 },
    { name: "Fish Spot", x: 200, y: 100, radius: 40 },
  ],
  Home: [
    { name: "Sleep Spot", x: 100, y: 100, radius: 40 },
    { name: "Relax Spot", x: 100, y: 200, radius: 40 },
  ],
  City: [
    { name: "Work Spot", x: 100, y: 100, radius: 40 },
    { name: "Shop", x: 100, y: 200, radius: 40 },
  ],
  Forest: [
    { name: "Gather Spot", x: 100, y: 100, radius: 40 },
    { name: "Rest Area", x: 100, y: 200, radius: 40 },
  ],
};

export const areaActivities = {
  Beach: [
    {
      name: "Swim",
      cost: 0,
      duration: 2000,
      statChanges: { Happiness: 10, Cleanliness: -5 },
    },
    {
      name: "Coconut Stand",
      cost: 10,
      duration: 1000,
      statChanges: { Meal: 10, Money: -10 },
    },
    {
      name: "Fish",
      cost: 0,
      duration: 3000,
      statChanges: { Happiness: 5, Meal: 5 },
      requiredItems: ["Fishing Rod"],
    },
  ],
  Home: [
    {
      name: "Sleep",
      cost: 0,
      duration: 3000,
      statChanges: { Sleep: 20, Happiness: 5 },
    },
    {
      name: "Relax",
      cost: 0,
      duration: 2000,
      statChanges: { Happiness: 10, Sleep: 5 },
    },
  ],
  City: [
    {
      name: "Work",
      cost: 0,
      duration: 4000,
      statChanges: { Money: 20, Happiness: -5, Sleep: -10 },
    },
    {
      name: "Shop",
      cost: 0,
      duration: 0,
      shopItems: [
        { name: "Pegasus Apple", cost: 30 },
        { name: "Fishing Rod", cost: 50 },
      ],
    },
  ],
  Forest: [
    {
      name: "Gather",
      cost: 0,
      duration: 3000,
      statChanges: { Happiness: 5, Meal: 5 },
      itemsGained: ["Broken Apple"],
      requiredItems: ["Pegasus Apple"],
    },
    {
      name: "Rest Area",
      cost: 0,
      duration: 2000,
      statChanges: { Sleep: 10, Happiness: 5 },
    },
  ],
};

export const itemEffects = {
  "Pegasus Apple": {
    statChanges: { Happiness: 20, Meal: 10 },
  },
  "Broken Apple": {
    statChanges: { Meal: 5 },
  },
  "Fishing Rod": {
    unlocks: ["Fish"],
  },
};

export const calculateLifeSatisfaction = (stats, visitedAreas) => {
  const statBalance =
    ((stats?.Meal || 0) +
      (stats?.Sleep || 0) +
      (stats?.Happiness || 0) +
      (stats?.Cleanliness || 0)) /
    4;
  const scaledStatBalance = (statBalance / 100) * 50;
  const activityBonus = Math.min((stats?.activitiesPerformed || 0) * 2, 40);
  const itemBonus =
    (stats?.Items?.length || 0) * 1 + (stats?.totalItemsUsed || 0) * 2;
  const scaledItemBonus = Math.min(itemBonus, 30);
  const areaVarietyBonus = Math.min(
    new Set(Array.isArray(visitedAreas) ? visitedAreas : []).size * 5,
    20
  );
  const totalScore = Math.floor(
    scaledStatBalance + activityBonus + scaledItemBonus + areaVarietyBonus
  );

  console.log("Life Satisfaction calculated:", {
    scaledStatBalance,
    activityBonus,
    scaledItemBonus,
    areaVarietyBonus,
    totalScore,
  });

  return {
    total: totalScore,
    details: {
      "Stat Balance": scaledStatBalance,
      Activities: activityBonus,
      "Items Collected & Used": scaledItemBonus,
      "Area Variety": areaVarietyBonus,
    },
  };
};

export const getLifeSatisfactionMessage = (score) => {
  if (score >= 80) {
    return "Kamu sangat bahagia! Terus pertahankan gaya hidup sehatmu!";
  } else if (score >= 60) {
    return "Kamu cukup bahagia, tapi masih bisa lebih baik. Coba eksplorasi area baru!";
  } else if (score >= 40) {
    return "Kamu perlu meningkatkan keseimbangan hidupmu. Coba lakukan lebih banyak aktivitas!";
  } else {
    return "Kamu terlihat tidak bahagia. Pertimbangkan untuk beristirahat dan fokus pada kebutuhan dasar!";
  }
};
