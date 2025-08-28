"use client";
import React from "react";
import { AppBar as App, IconButton, Toolbar, Typography, Container, Box, Chip, Avatar, useTheme, useMediaQuery } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface Props {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}


const CustomAppBar: React.FC<Props> = ({ title, showBackButton = false, onBackClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const { data: session } = useSession();

  const handleNext = () => {
    if (session?.user.role === "ADMIN") {
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  return (
    <>
      <App component="nav">
        <Container maxWidth="xl">
          <Toolbar>
            {showBackButton && (
              <IconButton color="inherit" aria-label="back" onClick={handleBack} edge="start" sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography onClick={handleNext} variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }}>
              {title || <Image priority width={100} height={100} src={'/logo.png'} alt="logo" style={{ width: 'auto', height: '100%' }} />}
            </Typography>

            <Box sx={{ flexGrow: 0, marginLeft: "auto", display: 'flex', gap: 1 }}>
              {!isMobile&&<Chip
                sx={{ color: '#fff', p:0 }}
                avatar={<Avatar alt={session?.user.name || ""} src={session?.user.image || ""} />}
                label={session?.user.name}
                variant="outlined"
              />}
              <LogoutButton />
            </Box>
          </Toolbar>
        </Container>
      </App>
      <Toolbar />
    </>
  );
};

export default CustomAppBar;
