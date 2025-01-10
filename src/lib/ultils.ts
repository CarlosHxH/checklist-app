/* eslint-disable @typescript-eslint/no-explicit-any */
export const fakeArray = (value: number) =>
  Array.from({ length: value }, (_, i) => i + 1);
export const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const hoje = (()=> new Date().toLocaleString('pt-BR'))();

export const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("pt-BR");
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
