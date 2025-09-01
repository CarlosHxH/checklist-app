"use client";
import React from "react";
import { AppBar as App, IconButton, Toolbar, Typography, Container, Box, Chip, Avatar, useTheme, useMediaQuery } from "@mui/material";
import { KeyboardArrowLeft } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface Props {
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  href?: string;
}


const CustomAppBar: React.FC<Props> = ({ title, showBackButton = false, onBackClick, href }) => {
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
    if (!!href){
      router.push(href);
      return;
    }
    if (!!onBackClick) {
      onBackClick();
      return;
    }
    else {
      router.back();
      return;
    }
  };

  return (
    <Box>
      <App component="nav" position="fixed">
        <Container maxWidth="xl">
          <Toolbar>
            {(showBackButton || href) && (
              <IconButton color="inherit" aria-label="back" onClick={handleBack} edge="start" sx={{ mr: 2 }}>
                <KeyboardArrowLeft fontSize="large"/>
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
    </Box>
  );
};

export default CustomAppBar;
