import Box from '@mui/material/Box';
import ResponsiveAppBar from '@/components/_ui/ResponsiveAppBar';
import InspectionForm from './InspectionForm';

export default function InspectionPage() {
  return (
    <div>
      <ResponsiveAppBar showBackButton/>
      <Box component="main" sx={{ flex: 1 }}><InspectionForm /></Box>
    </div>
  );
}