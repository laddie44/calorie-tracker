// ============================================================
// Mifflin-St Jeor BMR + TDEE + Macro Calculator
// Single source of truth for all macro math.
// All arithmetic done in code — AI never touches these numbers.
//
// Formula:
//   1) BMR (Mifflin-St Jeor):
//        male:   10w + 6.25h - 5a + 5
//        female: 10w + 6.25h - 5a - 161
//        other:  average of male and female (so users who prefer
//                not to say still get a reasonable estimate)
//   2) TDEE = BMR × activity multiplier (1.2 / 1.375 / 1.55 / 1.725)
//   3) Goal adjustment (pace optional, default = standard):
//        lose:   easy=-250  | standard=-500 | faster=-750
//        gain:   lean=+150  | standard=+300 | faster=+450
//        recomp: TDEE
//        maintain: TDEE
//   4) Clamp at 1200 kcal floor for safety
//   5) Round calories to nearest 50 for clean display & consistency
//   6) Protein g/kg: 2.0 (lose), 2.2 (gain), 1.8 (maintain/recomp)
//   7) Fat: 25% of calories ÷ 9 kcal/g
//   8) Carbs: remaining calories ÷ 4 kcal/g (floor 50g)
// ============================================================

// Calorie deltas per goal+pace. Default ('standard') matches legacy
// behavior (-500 / +300) so users who skip the pace selector see no change.
const PACE_DELTAS = {
  lose: { easy: -250, standard: -500, faster: -750 },
  gain: { lean: 150, standard: 300, faster: 450 }
};

function paceDelta(goal, pace) {
  if (goal !== 'lose' && goal !== 'gain') return 0;
  const table = PACE_DELTAS[goal];
  return table[pace] != null ? table[pace] : table.standard;
}

function calculateMacros({ gender, weight, height, age, activityLevel, goal, units, pace }) {
  // Convert imperial to metric if needed
  const weightKg = units === 'imperial' ? weight * 0.453592 : parseFloat(weight);
  const heightCm = units === 'imperial' ? height * 2.54     : parseFloat(height);
  const ageNum   = parseFloat(age);

  // ── BMR ──────────────────────────────────────────────────────────────────
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
  } else if (gender === 'female') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
  } else {
    // 'other' / 'prefer not to say' — average of male & female formulas
    const bmrMale   = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5;
    const bmrFemale = 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;
    bmr = (bmrMale + bmrFemale) / 2;
  }

  // ── TDEE (BMR × activity) ────────────────────────────────────────────────
  const multipliers = { '1': 1.2, '2': 1.375, '3': 1.55, '4': 1.725 };
  const tdee = bmr * (multipliers[String(activityLevel)] || 1.375);

  // ── Goal-adjusted calories (pace optional; default keeps legacy values) ─
  const calories0 = tdee + paceDelta(goal, pace);
  let calories = (goal === 'recomp' || goal === 'maintain') ? tdee : calories0;
  // Floor at 1200 kcal, then round to nearest 50 for clean display
  calories = Math.max(Math.round(calories), 1200);
  calories = Math.round(calories / 50) * 50;

  // ── Protein (g/kg of bodyweight, varies by goal) ─────────────────────────
  const proteinPerKg = goal === 'gain' ? 2.2 : goal === 'lose' ? 2.0 : 1.8;
  const protein = Math.round(weightKg * proteinPerKg);

  // ── Fat (25% of calories) ────────────────────────────────────────────────
  const fat = Math.round((calories * 0.25) / 9);

  // ── Carbs (fill remaining calories, floor 50g) ───────────────────────────
  const carbCals = calories - (protein * 4) - (fat * 9);
  const carbs = Math.max(Math.round(carbCals / 4), 50);

  return { calories, protein, carbs, fat };
}

module.exports = { calculateMacros, paceDelta, PACE_DELTAS };
