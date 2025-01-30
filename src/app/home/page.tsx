"use client"
import { useEffect, useState } from 'react';
import { Container, CircularProgress, Box } from '@mui/material';
import { InspectionData } from './inspection';
import InspectionCardList from './InspectionCardList';
import ResponsiveAppBar from '@/components/_ui/ResponsiveAppBar';
import CustomFab from '@/components/_ui/CustomFab';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data } = useSession();
  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInspections = async () => {
      try {
        const response: Response = await fetch(`/api/${data?.user.id||""}`);
        const inspectionsData = await response.json();
        console.log(inspectionsData);
        
        setInspections(inspectionsData);
      } catch (error) {
        console.error('Error fetching inspections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <ResponsiveAppBar />
      <CustomFab href={'/inspection/create'} variant={"Plus"} />
      <InspectionCardList inspections={inspections} />
    </Container>
  );
}