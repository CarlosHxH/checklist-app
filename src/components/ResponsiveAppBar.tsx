"use client";
import React from "react";
import { AppBar, IconButton, Toolbar, Typography, Container, Box, Chip, Avatar, styled, badgeClasses, Badge } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import LogoutButton from "./LogoutButton";
import { useSession } from "next-auth/react";
import NotificationsIcon from '@mui/icons-material/Notifications';
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/ultils";
import axios from "axios";

interface Props {
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}


const ResponsiveAppBar: React.FC<Props> = ({ title, showBackButton = false, onBackClick }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: alerts, mutate } = useSWR('/api/keys', fetcher)
  const [ count, setCount ] = React.useState(0);

  const handleNext = () => {
    router.push(session?.user.role === "ADMIN" ? "/dashboard" : "/");
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  React.useEffect(()=>{
    const request = async()=>{
      const res = await axios.get('/api/keys')
      const data = res.data.vehicleKeys;
      const count = data.filter((e: any) => e.userId === session?.user.id && e.status === "PENDING").length;
      setCount(count)
      mutate()
    }
    request()
  },[alerts])
  
  

  const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -12px;
    right: -6px;
  }
`;
/*
  React.useMemo(async () => {
    setStatus(alerts.filter((transfer: any) => transfer.userId === session?.user.id).length);
  }, [alerts])
*/
  return (
    <>
      <AppBar component="nav">
        <Container maxWidth="xl">
          <Toolbar>
            {showBackButton && (
              <IconButton color="inherit" aria-label="back" onClick={handleBack} edge="start" sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography onClick={handleNext} variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }}>
              {title}
            </Typography>
            <Box sx={{ flexGrow: 0, marginLeft: "auto", display: 'flex', gap: 3 }}>

              <Chip
                sx={{ color: '#fff' }}
                avatar={<Avatar alt={session?.user.name || ""} src={session?.user.image || ""} />}
                label={session?.user.name}
                variant="outlined"
              />
              {
              <Link href={'/keypage'}>
                <IconButton>
                  <NotificationsIcon color="inherit" fontSize="small" />
                  <CartBadge badgeContent={count} color="error" overlap="circular" />
                </IconButton>
              </Link>
              }
              <LogoutButton />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
    </>
  );
};

export default ResponsiveAppBar;
