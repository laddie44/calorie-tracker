// ============================================================
// Mifflin-St Jeor BMR + TDEE + Macro Calculator
// All arithmetic done in code — AI never touches these numbers
// ============================================================

function calculateMacros({ gender, weight, height, age, activityLevel, goal, units }) {
  // Convert to metric if user submitted imperial
  const weightKg = units === 'imperial' ? weight * 0.453592 : parseFloat(weight);
  const heightCm = units === 'imperial' ? height * 2.54    : parseFloat(height);
  const ageNum   = parseFloat(age);

  // Mifflin-St Jeor BMR
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
  }

  // Activity multipliers (TDEE)
  const multipliers = { '1': 1.2, '2': 1.375, '3': 1.55, '4': 1.725 };
  const tdee = bmr * (multipliers[String(activityLevel)] || 1.375);

  // Calorie target based on goal
  let calories;
  switch (goal) {
    case 'lose':     calories = tdee - 500; break;
    case 'gain':     calories = tdee + 300; break;
    case 'recomp':   calories = tdee;       break;
    default:         calories = tdee;       break; // maintain
  }
  calories = Math.max(Math.round(calories), 1200); // never below 1200

  // Protein (g/kg bodyweight — varies by goal)
  const proteinPerKg = goal === 'gain' ? 2.2 : goal === 'lose' ? 2.0 : 1.8;
  const protein = Math.round(weightKg * proteinPerKg);

  // Fat: 25% of total calories
  const fat = Math.round((calories * 0.25) / 9);

  // Carbs: fill remaining calories
  const carbCals = calories - (protein * 4) - (fat * 9);
  const carbs = Math.max(Math.round(carbCals / 4), 50); // never below 50g

  return { calories, protein, carbs, fat };
}

module.exports = { calculateMacros };
