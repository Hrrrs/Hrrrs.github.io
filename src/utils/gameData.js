export const areas = [
  { name: "Home", x: 100, y: 100, radius: 50 },
  { name: "Beach", x: 700, y: 150, radius: 50 },
  { name: "City", x: 600, y: 450, radius: 50 },
  { name: "Forest", x: 200, y: 500, radius: 50 },
];

export const areaDetails = {
  Home: {
    description: "Rumah nyaman Bocchi untuk bersantai.",
    activities: ["Sleep", "Relax"],
  },
  Beach: {
    description: "Pantai indah untuk berenang dengan Kessoku Band.",
    activities: ["Swim", "Eat"],
    lockedActivities: { Fish: ["Fishing Rod"] },
  },
  City: {
    description: "Kota modern untuk belanja peralatan musik.",
    activities: ["Shop", "Work"],
  },
  Forest: {
    description: "Hutan lebat untuk meditasi bersama Nijika.",
    activities: ["Rest", "Gather"],
  },
};

export const areaActivities = {
  Home: [
    {
      name: "Sleep",
      cost: 0,
      statChanges: { Sleep: 30, Cleanliness: -5 },
      duration: 2000,
    },
    { name: "Relax", cost: 5, statChanges: { Happiness: 20 }, duration: 2000 },
  ],
  Beach: [
    {
      name: "Swim",
      cost: 10,
      statChanges: { Happiness: 20, Sleep: -10 },
      duration: 2000,
    },
    {
      name: "Eat",
      cost: 15,
      statChanges: { Meal: 20, Cleanliness: -5 },
      duration: 2000,
    },
    {
      name: "Fish",
      cost: 0,
      statChanges: { Money: 20, Meal: -5 },
      duration: 2000,
      requiredItems: ["Fishing Rod"],
    },
  ],
  City: [
    {
      name: "Shop",
      cost: 0,
      duration: 1000,
      shopItems: [
        { name: "Pegasus Apple", cost: 20 },
        { name: "Fishing Rod", cost: 30 },
        { name: "Baby", cost: 50 },
      ],
    },
    { name: "Work", cost: 0, statChanges: { Money: 30 }, duration: 2000 },
  ],
  Forest: [
    {
      name: "Rest",
      cost: 5,
      statChanges: { Sleep: 15, Happiness: 10 },
      duration: 2000,
    },
    {
      name: "Gather",
      cost: 0,
      itemsGained: ["Broken Apple"],
      duration: 1000,
    },
  ],
};

export const activityZones = {
  Home: [
    { name: "Sleep Spot", x: 100, y: 100, radius: 20 },
    { name: "Relax Spot", x: 150, y: 100, radius: 20 },
  ],
  Beach: [
    { name: "Swim Spot", x: 700, y: 150, radius: 20 },
    { name: "Coconut Stand", x: 750, y: 200, radius: 20 },
    { name: "Fish Spot", x: 680, y: 130, radius: 20 },
  ],
  City: [
    { name: "Shop", x: 400, y: 400, radius: 20 },
    { name: "Work Spot", x: 450, y: 400, radius: 20 },
  ],
  Forest: [
    { name: "Rest Area", x: 200, y: 500, radius: 20 },
    { name: "Gather Spot", x: 250, y: 500, radius: 20 },
  ],
};

export const itemEffects = {
  "Pegasus Apple": { statChanges: { Happiness: 20 } },
  "Broken Apple": { statChanges: { Meal: 10 } },
  "Fishing Rod": { unlocks: { Beach: ["Fish"] } },
  Baby: { statChanges: { Happiness: 30 } },
};
