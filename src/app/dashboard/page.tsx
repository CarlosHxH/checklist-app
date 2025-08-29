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
import { Card, CardContent, Skeleton } from "@mui/material";
import ChartByUsers from "@/components/Dashboard/chats/byUsers";
import InspectionsDashboard from "@/components/Dashboard/chats/InspectionsDadhboard";
import InspectionBarChart from "@/components/Dashboard/chats/CustomBarChart";
import InspectionChart from "@/components/Dashboard/chats/InspectionChart";

export default function DashboardContent() {
  const { data, isLoading, error, mutate } = useSWR("/api/v2/dashboard", fetcher);

  if (isLoading) return <Loading />;
  if (error) return <></>;

  return (
    <Box sx={{p:4}}>
      <Typography component="h2" variant="h4" sx={{ mb: 2 }}>Dashboard</Typography>
      <Box component="main" sx={{ flexGrow: 1 }} >
        <Stack spacing={2} sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}>
          <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
            {/* cards */}
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>Visão geral</Typography>

            <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>

              {data.cards && data.cards.map((card: StatCardProps, index: number) => (
                <Grid key={index} size={{ xs: 6, sm: 3 }} sx={{ cursor: "pointer" }}>
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
                      <InspectionsDashboard
                        data={[
                          {
                            value: (data.statusSummary.finishedPercentage || 0),
                            title: 'VIAGENS FINALIZADAS',
                            subtitle: (data.statusSummary.finished || 0) + " " + (data.statusSummary.finished > 1 ? "VIAGENS FINALIZADAS" : "VIAGEM FINALIZADA"),
                            percentage: true,
                            pluralLabel: 'FINALIZADAS',
                            href: "/dashboard/viagens"
                          },
                          {
                            value: (data.statusSummary.unfinishedPercentage || 0),
                            title: 'VIAGENS NÃO FINALIZADAS',
                            subtitle: (data.statusSummary.unfinished || 0) + " " + (data.statusSummary.unfinished > 1 ? "VIAGENS NÃO FINALIZADAS" : "VIAGEM NÃO FINALIZADA"),
                            percentage: true,
                            href: "/dashboard/viagens"
                          },
                          {
                            value: data?.ordens?.totalTempoParadoGeral,
                            title: 'TEMPO TOTAL OFICINA',
                            subtitle: `Todos os ${data.ordens.totalOrdens} veiculos`,
                            href: "/dashboard/orders"
                          },
                          {
                            title: 'ORDEM DE SERVIÇO',
                            value: (data.ordens.totalOrdens || 0),
                            href: "/dashboard/orders",
                            render: (
                              <Box sx={{display:'flex', gap: 4}}>
                                <Typography variant="subtitle1" fontSize={14} color="textSecondary">{data.ordens.ordensFinalizadas || 0} {"FINALIZADAS"}</Typography>
                                <Typography variant="subtitle1" fontSize={14} color="textSecondary">{data.ordens.ordensPendentes || 0} {"NÂO FINALIZADAS"}</Typography>
                              </Box>
                            )
                          },
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
                      Últimos 30 Dias - Viagens
                    </Typography>
                    <InspectionChart label={"Viagens"} data={data.inspectionsByDate} />
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Últimos 30 Dias - Ordens de serviço
                    </Typography>
                    <InspectionChart label={"Ordens"} color="red" data={data.lastOrders} />
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <ChartByUsers height={420} dataset={data.byUsers} />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}