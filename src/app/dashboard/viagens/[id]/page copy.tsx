"use client";
import useSWR from "swr";
import React from "react";
import { fetcher } from "@/lib/ultils";
import Loading from "@/components/Loading";
import {
  Grid,
  Typography,
  Paper,
  Divider,
  Box,
} from "@mui/material";
import { useParams } from "next/navigation";
import Link from "next/link";
import 'react-photo-view/dist/react-photo-view.css';
import Photos from "@/components/_ui/Photos";
/*
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
}*/
interface InspectionView {
  id: string;
  userId: string;
  startId: string;
  endId: string;
  vehicleId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
  };
  start: {
    id: string;
    userId: string;
    vehicleId: string;
    vehicleKey: string | null;
    dataInspecao: string;
    status: string;
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
    quartoEixo: string | null;
    descricaoQuartoEixo: string | null;
    avariasCabine: string;
    descricaoAvariasCabine: string | null;
    bauPossuiAvarias: string;
    descricaoAvariasBau: string | null;
    funcionamentoParteEletrica: string;
    descricaoParteEletrica: string | null;
    createdAt: string;
    updatedAt: string | null;
    kilometer: string;
    isFinished: boolean;
    extintor: string;
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
  };
  end: {
    id: string;
    userId: string;
    vehicleId: string;
    vehicleKey: string | null;
    dataInspecao: string;
    status: string;
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
    quartoEixo: string | null;
    descricaoQuartoEixo: string | null;
    avariasCabine: string;
    descricaoAvariasCabine: string | null;
    bauPossuiAvarias: string;
    descricaoAvariasBau: string | null;
    funcionamentoParteEletrica: string;
    descricaoParteEletrica: string | null;
    createdAt: string;
    updatedAt: string | null;
    kilometer: string;
    isFinished: boolean;
    extintor: string;
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
  };
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
  const { data: insp, error } = useSWR<InspectionView>(`/api/dashboard/viagens/${id}`, fetcher);

  const Photo: React.FC<{ type: string; title: string }> = ({ type, title }) => {
    const getPhotosByType = (type: string) => insp.start.photos.filter(photo => photo.type === type);
    const photos = getPhotosByType(type);
    if (photos.length === 0) return null;
    return <Photos photos={photos} title={title}/>
  }

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


  
  if (!insp) return <Loading />;
  if (error) return <div>Erro ao carregar inspeção <Link href={'/'}>Voltar</Link></div>;


  return (
    <Paper sx={{ p: 3, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>DETALHES DA INSPEÇÃO</Typography>

      <Grid container spacing={3} md={6}>
        <Grid item xs={12}><Divider>Informações Gerais</Divider></Grid>

        {/*<InfoRow label="Veículo" value={`${insp.start.vehicle.plate} - ${insp.start.vehicle.model}`} />
        <InfoRow label="Quilometragem" value={insp.start.kilometer} />
        <InfoRow label="Status" value={insp.start.status} />
        <InfoRow label="Data" value={new Date(insp.start.createdAt).toLocaleDateString()} />

        <Grid item xs={12}><Divider>Documentação</Divider></Grid>
        <InfoRow label="CRLV em dia" value={insp.start.crlvEmDia} />
        <InfoRow label="Certificado Tacógrafo em dia" value={insp.start.certificadoTacografoEmDia} />

        <Grid item xs={12}><Divider>Níveis</Divider></Grid>
        <InfoRow label="Nível de Água" value={insp.start.nivelAgua} />
        <InfoRow label="Nível de Óleo" value={insp.start.nivelOleo} />

        <Grid item xs={12}><Divider>Pneus</Divider></Grid>
        <InfoRow label="Dianteira" value={insp.start.dianteira} />
        <DescriptionRow label="Descrição Dianteira" value={insp.start.descricaoDianteira} />

        <InfoRow label="Tração" value={insp.start.tracao} />
        <DescriptionRow label="Descrição Tração" value={insp.start.descricaoTracao} />

        <InfoRow label="Truck" value={insp.start.truck} />
        <DescriptionRow label="Descrição Truck" value={insp.start.descricaoTruck} />

        <InfoRow label="Quarto Eixo" value={insp.start.quartoEixo} />
        <DescriptionRow label="Descrição Quarto Eixo" value={insp.start.descricaoQuartoEixo} />

        <Grid item xs={12}><Divider>Avarias</Divider></Grid>
        <InfoRow label="Avarias na Cabine" value={insp.start.avariasCabine} />
        <DescriptionRow label="Descrição Avarias Cabine" value={insp.start.descricaoAvariasCabine} />

        <InfoRow label="Avarias no Baú" value={insp.start.bauPossuiAvarias} />
        <DescriptionRow label="Descrição Avarias Baú" value={insp.start.descricaoAvariasBau} />

        <Grid item xs={12}><Divider>Parte Elétrica</Divider></Grid>
        <InfoRow label="Funcionamento Parte Elétrica" value={insp.start.funcionamentoParteEletrica} />
        <DescriptionRow label="Descrição Parte Elétrica" value={insp.start.descricaoParteEletrica} />

        <Grid item xs={12}><Divider>Extintor</Divider></Grid>
        <InfoRow label="Extintor em dia" value={insp.start.extintor} />

        <Grid item xs={12}><Divider>Fotos</Divider></Grid>
        <Grid item xs={12} md={6}>
          <Photo type="documento" title="Fotos do Documento" />
        </Grid>
        <Grid item xs={12} md={6}>
          <Photo type="tacografo" title="Fotos do Tacógrafo" />
        </Grid>
        <Grid item xs={12}>
          <Photo type="vehicle" title="Fotos do veiculo" />
        </Grid>*/}
      </Grid>

    </Paper>
  );
};

export default InspectionViewPage;