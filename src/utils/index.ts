import { InspectionFormData } from "@/lib/formDataTypes";

export function getDaysInMonth(
  month: number = new Date().getMonth() + 1,
  year: number = new Date().getFullYear()
) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString("pt-BR", {
    month: "short",
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

export function filterInspections(obj: any, searchTerm: string): string[] {
  const results: string[] = [];
  function recursiveSearch(current: any, path: string[] = []) {
    // Se for null ou undefined, retorna
    if (current === null || current === undefined) return;
    // Se for string, verifica se inclui o termo buscado
    if (typeof current === "string") {
      if (current.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push([...path, current].join(" > "));
      }
      return;
    }
    // Se for array, percorre cada elemento
    if (Array.isArray(current)) {
      current.forEach((item, index) => {
        recursiveSearch(item, [...path, `[${index}]`]);
      });
      return;
    }
    // Se for objeto, percorre suas propriedades
    if (typeof current === "object") {
      Object.entries(current).forEach(([key, value]) => recursiveSearch(value, [...path, key]));
    }
  }
  recursiveSearch(obj);
  return results || obj;
}
