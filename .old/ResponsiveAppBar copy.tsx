"use client";
import React from "react";
import {
  AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Button, MenuItem, useTheme, useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon, ArrowBack as ArrowBackIcon} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import LogoutButton from "./LogoutButton";

interface Page {
  title: string;
  path: string;
}

interface Props {
  title: string;
  pages?: Page[];
  showBackButton?: boolean;
  onBackClick?: () => void;
  userMenuItems?: string[];
}

const ResponsiveAppBar: React.FC<Props> = ({
  title,
  pages = [],
  showBackButton = false,
  onBackClick,
}) => {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );

  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    handleCloseNavMenu();
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  return (
    <Box sx={{ display: "flex", overflowY: "hidden" }}>
      <AppBar component={"nav"}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Back Button */}
            {showBackButton && (
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="back"
                onClick={handleBack}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}

            {/* Logo/Title - Desktop */}
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {title}
            </Typography>

            {/* Navigation Menu - Mobile */}
            {pages.length > 0 && (
              <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                <IconButton
                  size="large"
                  aria-label="navigation menu"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleOpenNavMenu}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: "block", md: "none" },
                  }}
                >
                  {pages.map((page) => (
                    <MenuItem
                      key={page.path}
                      onClick={() => handleNavigate(page.path)}
                    >
                      <Typography textAlign="center">{page.title}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            )}

            {/* Logo/Title - Mobile */}
            <Typography
              variant="h5"
              noWrap
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {isMobile ? title.substring(0, 20) : title}
            </Typography>

            {/* Navigation Menu - Desktop */}
            {pages.length > 0 && (
              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                {pages.map((page) => (
                  <Button
                    key={page.path}
                    onClick={() => handleNavigate(page.path)}
                    sx={{ my: 2, color: "white", display: "block" }}
                  >
                    {page.title}
                  </Button>
                ))}
              </Box>
            )}

            {/* User Menu */}
            <Box sx={{ flexGrow: 0, marginLeft: "auto" }}>
              <LogoutButton />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
};

export default ResponsiveAppBar;
