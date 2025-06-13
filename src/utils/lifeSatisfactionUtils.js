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
  const areaVarietyBonus = Math.min(new Set(visitedAreas).size * 5, 20);
  const totalScore = Math.floor(
    scaledStatBalance + activityBonus + scaledItemBonus + areaVarietyBonus
  );
  return {
    total: totalScore,
    details: {
      "Stat Balance": scaledStatBalance.toFixed(1),
      Activities: activityBonus,
      "Items Collected & Used": scaledItemBonus.toFixed(1),
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
