import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

interface Props {
  window?: () => Window;
  children: React.ReactNode,
  fab: string | null | undefined
}

const title = "5sTransportes";
const drawerWidth = 240;
const navItems: React.ReactNode[] = [
  <>Home</>,
  <>Suporte</>
];

export default function DrawerAppBar(props: Props) {
  const { window, children, fab } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const toggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={toggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        {title}
      </Typography>
      <Divider />
      <List>
        {navItems.map((item,i) => (
          <ListItem key={i} disablePadding>
            <ListItemButton>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex", overflowY: "hidden" }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={toggle} sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1}}>{title}</Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            {navItems.map((item,i) =><Button key={i} sx={{ color: "#fff" }}>{item}</Button>)}
          </Box>
          <Box sx={{ml:'auto'}}>
            <LogoutButton/>
          </Box>
        </Toolbar>
      </AppBar>

      
      <nav>
        <Drawer container={container} variant="temporary" open={mobileOpen} onClose={toggle} ModalProps={{ keepMounted: true }} sx={{display: { xs: "block", sm: "none" },"& .MuiDrawer-paper": {boxSizing: "border-box",width: drawerWidth}}}>
          {drawer}
        </Drawer>
      </nav>

      <Box component="main" sx={{ flex: 1 }}>
        <Toolbar />
        {children}
      </Box>

      <Fab as={Link} href={fab} sx={{ position: "fixed", bottom: 20, right: 30 }} color="primary">
        <AddIcon />
      </Fab>
    </Box>
  );
}
