import Box from '@mui/material/Box';
import AppBar from '@/components/AppBar';
import InspectionForm from './InspectionForm';

export default function InspectionPage() {
  return (
    <div>
      <AppBar showBackButton/>
      <Box component="main" sx={{ flex: 1 }}><InspectionForm /></Box>
    </div>
  );
}