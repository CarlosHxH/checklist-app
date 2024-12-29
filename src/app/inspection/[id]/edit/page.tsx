import Box from "@mui/material/Box";
import ResponsiveAppBar from "@/components/ResponsiveAppBar";
import InspectionForm from "./InspectionForm";

export default function InspectionPage() {
  return (
    <div>
      <ResponsiveAppBar title={"5sTransportes"} showBackButton />
      <Box component="main" sx={{ flex: 1 }}>
        <InspectionForm/>
      </Box>
    </div>
  );
}
