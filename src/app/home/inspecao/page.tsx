import Box from '@mui/material/Box';
import CustomAppBar from '@/components/_ui/CustomAppBar';
import InspectionForm from './InspectionForm';

export default function InspectionPage() {
  return (
    <div>
      <CustomAppBar showBackButton/>
      <Box component="main" sx={{ flex: 1 }}><InspectionForm /></Box>
    </div>
  );
}