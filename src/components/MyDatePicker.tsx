// src/components/MyDatePicker.jsx (or similar client-side component)
"use client"; // This directive marks the component as a client component
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function MyDatePicker({children}:{children:React.ReactNode}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {children}
    </LocalizationProvider>
  );
}