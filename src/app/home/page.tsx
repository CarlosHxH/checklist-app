"use client"
import { useEffect, useState } from 'react';
import { Container, CircularProgress, Box, Card, CardContent, Button } from '@mui/material';
import { InspectionData } from './inspection';
import ResponsiveAppBar from '@/components/_ui/ResponsiveAppBar';
import CustomFab from '@/components/_ui/CustomFab';
import { useSession } from 'next-auth/react';
import InspectionCardList from './InspectionCardList';
import Loading from '@/components/Loading';
import InspectionModal from './Modal';

export default function Home() {
  const { data } = useSession();
  const [inspections, setInspections] = useState<InspectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalClose = () => setIsModalOpen(false);
  useEffect(()=>{fetchInspections()}, []);

  const handleInspectionSuccess = (inspectionId: string) => {
    // Manuseio personalizado opcional, por exemplo, mostrando uma mensagem de sucesso
    fetchInspections();
    console.log(`Inspection created with ID: ${inspectionId}`);
  };

  const fetchInspections = async () => {
    try {
      const response: Response = await fetch(`/api/${data?.user.id || ""}`);
      const inspectionsData = await response.json();
      setInspections(inspectionsData);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    } finally {
      setLoading(false);
    }
  };

  

  if (loading) return <Loading />

  return (
    <Container maxWidth="lg">
      <ResponsiveAppBar />

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <InspectionCardList inspections={inspections} />
          <CustomFab href={'/inspection/create'} variant={"Plus"} />
        </CardContent>
      </Card>
    </Container>
  );
}