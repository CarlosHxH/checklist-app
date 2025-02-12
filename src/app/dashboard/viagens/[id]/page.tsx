"use client";
import useSWR from "swr";
import React from "react";
import { fetcher } from "@/lib/ultils";
import Loading from "@/components/Loading";
import { useSession } from "next-auth/react";
import { 
  Grid, 
  Typography, 
  Paper, 
  Divider, 
  Box,
  Card,
  CardMedia,
  CardContent
} from "@mui/material";
import { useParams } from "next/navigation";
import Link from "next/link";
import CustomAppBar from "@/components/_ui/CustomAppBar";

interface InspectionView {
  id: string;
  userId: string;
  vehicleId: string;
  status: string;
  kilometer: string;
  crlvEmDia: string;
  certificadoTacografoEmDia: string;
  nivelAgua: string;
  nivelOleo: string;
  eixo: string;
  dianteira: string;
  descricaoDianteira: string;
  tracao: string;
  descricaoTracao: string;
  truck: string;
  descricaoTruck: string;
  quartoEixo: string;
  descricaoQuartoEixo: string;
  avariasCabine: string;
  descricaoAvariasCabine: string;
  bauPossuiAvarias: string;
  descricaoAvariasBau: string;
  funcionamentoParteEletrica: string;
  descricaoParteEletrica: string;
  extintor: string;
  createdAt: string;
  vehicle: {
    plate: string;
    model: string;
  };
  photos: Array<{
    id: string;
    type: string;
    photo: string;
    description: string;
  }>;
}

const StatusChip: React.FC<{ value: string }> = ({ value }) => {
  const getColor = () => {
    switch (value) {
      case "BOM":
      case "NORMAL":
      case "SIM":
        return "success.main";
      case "RUIM":
      case "BAIXO":
      case "NÃO":
        return "error.main";
      case "CRITICO":
        return "error.dark";
      default:
        return "text.primary";
    }
  };

  return (
    <Typography color={getColor()} fontWeight="bold">
      {value}
    </Typography>
  );
};

const InspectionViewPage: React.FC = () => {
  const { id } = useParams();
  const { data: inspection, error } = useSWR<InspectionView>(`/api/inspecao/${id}`, fetcher);
  
  if (!inspection) return <Loading />;
  if (error) return <div>Erro ao carregar inspeção <Link href={'/'}>Voltar</Link></div>;

  const getPhotosByType = (type: string) => {
    return inspection.photos.filter(photo => photo.type === type);
  };

  const PhotoSection: React.FC<{ type: string; title: string }> = ({ type, title }) => {
    const photos = getPhotosByType(type);
    if (photos.length === 0) return null;

    return (
      <Box mt={2}>
        <CustomAppBar showBackButton/>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Grid container spacing={2}>
          {photos.map((photo) => (
            <Grid item xs={12} sm={6} md={3} key={photo.id} gap={4}>
              <Card sx={{height:100, width:'100%',m:1}}>
                <CardMedia
                  component="img"
                  height="200"
                  sx={{height:'100px',width:'100%', objectFit:'cover',objectPosition:'center'}}
                  image={photo.photo}
                  alt={photo.description || title}
                />
                {photo.description && (
                  <CardContent sx={{position:'relative',top:0, left:0}}>
                    <Typography variant="body2" color="#000">{photo.description}</Typography>
                  </CardContent>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <Grid item xs={12} md={6}>
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="subtitle1" fontWeight="bold">{label}:</Typography>
        <StatusChip value={value} />
      </Box>
    </Grid>
  );

  const DescriptionRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
    if (!value) return null;
    return (
      <Grid item xs={12}>
        <Box mt={1}>
          <Typography variant="subtitle2" color="text.secondary">{label}:</Typography>
          <Typography variant="body1">{value}</Typography>
        </Box>
      </Grid>
    );
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 1200, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>DETALHES DA INSPEÇÃO</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}><Divider>Informações Gerais</Divider></Grid>
        
        <InfoRow label="Veículo" value={`${inspection.vehicle.plate} - ${inspection.vehicle.model}`} />
        <InfoRow label="Quilometragem" value={inspection.kilometer} />
        <InfoRow label="Status" value={inspection.status} />
        <InfoRow label="Data" value={new Date(inspection.createdAt).toLocaleDateString()} />

        <Grid item xs={12}><Divider>Documentação</Divider></Grid>
        <InfoRow label="CRLV em dia" value={inspection.crlvEmDia} />
        <InfoRow label="Certificado Tacógrafo em dia" value={inspection.certificadoTacografoEmDia} />
        
        <Grid item xs={12}><Divider>Níveis</Divider></Grid>
        <InfoRow label="Nível de Água" value={inspection.nivelAgua} />
        <InfoRow label="Nível de Óleo" value={inspection.nivelOleo} />

        <Grid item xs={12}><Divider>Pneus</Divider></Grid>
        <InfoRow label="Dianteira" value={inspection.dianteira} />
        <DescriptionRow label="Descrição Dianteira" value={inspection.descricaoDianteira} />
        
        <InfoRow label="Tração" value={inspection.tracao} />
        <DescriptionRow label="Descrição Tração" value={inspection.descricaoTracao} />
        
        <InfoRow label="Truck" value={inspection.truck} />
        <DescriptionRow label="Descrição Truck" value={inspection.descricaoTruck} />
        
        <InfoRow label="Quarto Eixo" value={inspection.quartoEixo} />
        <DescriptionRow label="Descrição Quarto Eixo" value={inspection.descricaoQuartoEixo} />

        <Grid item xs={12}><Divider>Avarias</Divider></Grid>
        <InfoRow label="Avarias na Cabine" value={inspection.avariasCabine} />
        <DescriptionRow label="Descrição Avarias Cabine" value={inspection.descricaoAvariasCabine} />
        
        <InfoRow label="Avarias no Baú" value={inspection.bauPossuiAvarias} />
        <DescriptionRow label="Descrição Avarias Baú" value={inspection.descricaoAvariasBau} />

        <Grid item xs={12}><Divider>Parte Elétrica</Divider></Grid>
        <InfoRow label="Funcionamento Parte Elétrica" value={inspection.funcionamentoParteEletrica} />
        <DescriptionRow label="Descrição Parte Elétrica" value={inspection.descricaoParteEletrica} />

        <Grid item xs={12}><Divider>Extintor</Divider></Grid>
        <InfoRow label="Extintor em dia" value={inspection.extintor} />

        <Grid item xs={12}><Divider>Fotos</Divider></Grid>
        <Grid item xs={12} md={6}>
          <PhotoSection type="documento" title="Fotos do Documento" />
        </Grid>
        <Grid item xs={12} md={6}>
        <PhotoSection type="tacografo" title="Fotos do Tacógrafo" />
        </Grid>
        <Grid item xs={12}>
          <PhotoSection type="avarias" title="Fotos das Avarias" />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default InspectionViewPage;