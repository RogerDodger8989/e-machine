export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setMonth(result.getMonth() + months);
  // Date.setMonth() "läcker" över till nästa månad när målmånaden är kortare
  // än ursprungsdagen (t.ex. 31 jan + 1 månad blir annars 2/3 mars istället
  // för 28/29 feb) — om det händer klampar vi till sista dagen i rätt månad.
  if (result.getDate() !== day) {
    result.setDate(0);
  }
  return result;
}

export function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}
