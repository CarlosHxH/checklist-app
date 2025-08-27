export const calcularDiferenca = (inicio: string, fim?: string|null) => {
  const inicio1 = new Date(inicio);
  const fim1 = fim ? new Date(fim) : new Date();
  const diferencaMs = fim1.getTime() - inicio1.getTime();
  return {
    milissegundos: diferencaMs,
    segundos: Math.floor(diferencaMs / 1000),
    minutos: Math.floor(diferencaMs / (1000 * 60)),
    horas: Math.floor(diferencaMs / (1000 * 60 * 60)),
    dias: Math.floor(diferencaMs / (1000 * 60 * 60 * 24)),
    meses: Math.floor(diferencaMs / (1000 * 60 * 60 * 24 * 30.44)), // aproximado
    anos: Math.floor(diferencaMs / (1000 * 60 * 60 * 24 * 365.25)) // aproximado
  };
}

export function dateDiff(dataInicial: string, dataFinal?: string|null) {
  const diff = calcularDiferenca(dataInicial, dataFinal);
  if (diff.dias > 0) {
    const horasRestantes = diff.horas % 24;
    const minRest = diff.minutos % 60;
    return `${diff.dias} dias, ${horasRestantes} horas ${minRest > 0 ? "e " + minRest + " minutos" : ""} `;
  } else if (diff.horas > 0) {
    const minRest = diff.minutos % 60;
    return `${diff.horas} horas ${minRest > 0 ? "e " + minRest + " minutos" : ""}`;
  } else {
    return `${diff.minutos} minutos`;
  }
}

// Helper function to format date for datetime-local input
export const formatDateForInput = (date: Date | string | null): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) return '';
  
  // Format to YYYY-MM-DDTHH:MM (required for datetime-local)
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const fakeArray = (value: number) =>
  Array.from({ length: value }, (_, i) => i + 1);

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const hoje = (() => new Date().toLocaleString("pt-BR"))();
/*
export const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
};*/

// Formatar a data para exibição
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const stringToDate = (isoString: string) => {
  return isoString.slice(0, 16);
};

export const today = () => new Date().toISOString().split("T")[0];
export type AnyObject = { [key: string]: any };

/**
 * Function to find a string in an object's properties.
 * @param obj - The object to search through.
 * @param searchString - The string to search for.
 * @returns An array of keys where the search string is found.
 */
export function findObject(obj: AnyObject, searchString: string): string[] {
  const foundKeys: string[] = [];

  // Helper function to recursively search through the object
  function search(obj: AnyObject) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        // Check if the value is a string and contains the search string
        if (typeof value === "string" && value.includes(searchString)) {
          foundKeys.push(key);
        }

        // If the value is an object, search recursively
        if (typeof value === "object" && value !== null) {
          search(value);
        }
      }
    }
  }

  search(obj);
  return foundKeys;
}

/**
 * Filtra um array de itens com base em múltiplos critérios de filtro
 * @param array O array a ser filtrado
 * @param filters Um objeto com chaves representando propriedades e valores representando critérios de filtro
 * @returns Um novo array contendo apenas os itens que correspondem a todos os filtros
 */
export function multiFilter<T extends Record<string, any>>(
  array: T[],
  filters: Record<string, string | null | undefined>
): T[] {
  return array.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      // Se o valor do filtro for nulo ou indefinido, não aplica o filtro
      if (!value) return true;

      const filterValues = value.split(",").map((v) => v.trim().toLowerCase());
      const itemValue = String(item[key]).toLowerCase();

      // Verifica se algum dos valores do filtro corresponde ao valor do item
      return filterValues.some((filterValue) => {
        // Lida com comparações numéricas
        if (!isNaN(Number(itemValue)) && !isNaN(Number(filterValue))) {
          return Number(itemValue) === Number(filterValue);
        }
        // Lida com inclusões de string
        return itemValue.includes(filterValue);
      });
    });
  });
}
