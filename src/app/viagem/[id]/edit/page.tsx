import Box from "@mui/material/Box";
import InspectionForm from "./InspectionForm";
import CustomAppBar from "@/components/_ui/CustomAppBar";

export default function InspectionPage() {
  return (
    <div>
      <CustomAppBar title={"5sTransportes"} showBackButton />
      <Box component="main" sx={{ flex: 1 }}>
        <InspectionForm/>
      </Box>
    </div>
  );
}
