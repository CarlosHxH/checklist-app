"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import StatCard, { StatCardProps } from "@/components/Dashboard/chats/StatCard";
import Loading from "@/components/Loading";
import useSWR from "swr";
import { fetcher } from "@/lib/ultils";
import { useRouter } from "next/navigation";
import { Card, CardContent, Skeleton } from "@mui/material";
import ChartByUsers from "@/components/Dashboard/chats/byUsers";
import InspectionsDashboard from "@/components/Dashboard/chats/InspectionsDadhboard";
import InspectionBarChart from "@/components/Dashboard/chats/CustomBarChart";
import InspectionChart from "@/components/Dashboard/chats/InspectionChart";


export default function DashboardContent() {
  const router = useRouter();
  const { data, isLoading, error, mutate } = useSWR("/api/v2/dashboard", fetcher);

  if (isLoading || !data) return <Loading />;
  if (data.error) return <></>;


  return (
    <Box sx={{ display: "flex" }}>
      <Box component="main" sx={(theme: any) => ({ flexGrow: 1 })} >
        <Stack
          spacing={2}
          sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}
        >
          <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
            {/* cards */}
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>Visão geral</Typography>

            <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
              {data.cards && data.cards.map((card: StatCardProps, index: number) => (
                <Grid key={index} size={{ xs: 6, sm: 2.4 }} sx={{ cursor: "pointer" }}>
                  <StatCard {...card} />
                </Grid>
              ))}


              <Grid size={{ xs: 12, md: 12 }}>
                <Box>
                  <React.Suspense fallback={
                    <Box sx={{ mt: 4 }}>
                      <Skeleton variant="rectangular" height={300} />
                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Skeleton variant="rectangular" height={150} width="50%" />
                        <Skeleton variant="rectangular" height={150} width="50%" />
                      </Box>
                    </Box>
                  }>
                    <Box mt={4}>
                      <Typography>RELATÓRIO DE VIAGENS</Typography>
                      <InspectionsDashboard
                        data={[
                          {
                            value: data?.statusSummary?.finished,
                            title: 'VIAGENS FINALIZADAS',
                            subtitle: (data.statusSummary.finished || 0)+" "+(data.statusSummary.finished > 1 ? "FINALIZADAS" : "FINALIZADA"),
                          },
                          {
                            value: data.statusSummary.unfinished,
                            title: 'VIAGENS PENDENTES',
                            subtitle: (data.statusSummary.unfinished || 0) +" "+(data.statusSummary.unfinished > 1 ? "PENDENTES" : "PENDENTE"),
                          },
                          {
                            value: (data.statusSummary.finishedPercentage || 0),
                            title: 'FINALIZADAS',
                            subtitle: (data.statusSummary.finished || 0)+" "+(data.statusSummary.finished > 1 ? "VIAGENS FINALIZADAS" : "VIAGEM FINALIZADA"),
                            percentage: true,
                            pluralLabel: 'FINALIZADAS'
                          },
                          {
                            value: (data.statusSummary.unfinishedPercentage || 0),
                            title: 'NÃO FINALIZADAS',
                            subtitle:(data.statusSummary.unfinished || 0)+" "+(data.statusSummary.unfinished > 1 ? "VIAGENS NÃO FINALIZADAS" : "VIAGEM NÃO FINALIZADA"),
                            percentage: true
                          }
                        ]}
                      />
                    </Box>


                    <Box mt={4}>
                      <Typography>RELATÓRIO DAS ORDEM DE SERVIÇO</Typography>
                      <InspectionsDashboard
                        data={[
                          {
                            value: data?.ordens?.totalTempoParadoGeral,
                            title: 'TOTAL TEMPO PARADO',
                            subtitle: 'Todos os veiculos'
                          },
                          {
                            value: data.ordens.totalOrdens,
                            title: 'TOTAL DE ORDEM DE SERVIÇO'
                          },
                          {
                            value: (data.ordens.ordensFinalizadas || 0),
                            title: 'FINALIZADAS'
                          },
                          {
                            value: (data.ordens.ordensPendentes || 0),
                            title: 'NÃO FINALIZADAS'
                          }
                        ]}
                      />
                    </Box>
                  </React.Suspense>
                </Box>
              </Grid>


              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Últimos 30 Dias
                    </Typography>
                    <InspectionChart data={data.inspectionsByDate} />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <InspectionBarChart
                  title="Visão Geral - Últimos 12 Meses"
                  height={265}
                  showAverage={true}
                  period="12months"
                  data={data.lastYears}
                  error={data.error}
                  isLoading={isLoading}
                  mutate={() => mutate()}
                />
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
              <ChartByUsers dataset={data.byUsers} />
            </Grid>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}