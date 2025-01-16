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

export function objectToFormData(
  obj: Record<string, any>,
  form?: FormData,
  namespace?: string
): FormData {
  const formData = form || new FormData();

  for (const property in obj) {
    if (obj.hasOwnProperty(property)) {
      const formKey = namespace ? `${namespace}[${property}]` : property;
      const value = obj[property];

      // If the value is an object, recursively call the function
      if (value instanceof Date) {
        formData.append(formKey, value.toISOString());
      } else if (value instanceof File) {
        formData.append(formKey, value);
      } else if (typeof value === "object" && value !== null) {
        objectToFormData(value, formData, formKey);
      } else {
        formData.append(formKey, value);
      }
    }
  }

  return formData;
}
