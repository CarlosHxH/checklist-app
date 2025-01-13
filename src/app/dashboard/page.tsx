"use client";
import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import StatCard, { StatCardProps } from "@/components/Dashboard/StatCard";
import SessionsChart from "@/components/Dashboard/SessionsChart";
import PageViewsBarChart from "@/components/Dashboard/PageViewsBarChart";
import CustomTreeView from "@/components/Dashboard/CustomTreeView";
import ChartUserByCountry from "@/components/Dashboard/ChartUserByCountry";
import Loading from "@/components/Loading";
import useSWR from "swr";
import { fetcher } from "@/lib/ultils";

export default function DashboardContent() {
  const { data, isLoading } = useSWR("/api/admin", fetcher);

  if (isLoading) return <Loading />;

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        component="main"
        sx={(theme: any) => ({
          flexGrow: 1,
          backgroundColor: theme.vars
            ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
            : alpha(theme.palette.background.default, 1),
          overflow: "auto",
        })}
      >
        <Stack
          spacing={2}
          sx={{ alignItems: "center", mx: 3, pb: 5, mt: { xs: 8, md: 0 } }}
        >
          <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
            {/* cards */}
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
              Visão geral
            </Typography>

            <Grid
              container
              spacing={2}
              columns={12}
              sx={{ mb: (theme) => theme.spacing(2) }}
            >
              {false &&
                data.map((card: StatCardProps, index: number) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <StatCard {...card} />
                  </Grid>
                ))}
              {false && (
                <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
                  <ChartUserByCountry label={"Inspeções por veiculos"} />
                </Grid>
              )}

              <Grid size={{ xs: 12, md: 6 }}>
                <PageViewsBarChart />
              </Grid>
              {false && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <SessionsChart />
                  </Grid>
                </>
              )}
            </Grid>
            {false && (
              <>
                <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                  Detalhes
                </Typography>
                <Grid container spacing={2} columns={12}>
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Stack gap={2} direction={{ xs: "column", sm: "row" }}>
                      <CustomTreeView />
                    </Stack>
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
