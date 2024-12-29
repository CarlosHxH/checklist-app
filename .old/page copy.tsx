import Navbar from "@/components/Navbar";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Container, IconButton, ListItemText } from "@mui/material";
import MoreIcon from "@mui/icons-material/MoreVert";
import MyAppBar from "@/components/AppBar";

export default async function Home() {
  return (
    <>
      <MyAppBar />
      <main suppressHydrationWarning={true}></main>
      <Fab sx={{ position: "fixed", bottom: 20, right: 30 }} color="primary">
        <AddIcon />
      </Fab>
    </>
  );
}
/*

    <main
      style={{ background: "whitesmoke", minHeight: "100vh"}}
      suppressHydrationWarning={true}
    >
      <MyAppBar />

      <Container sx={{mt:5}}>
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {Array.from({ length: 100 }, (_, i) => i + 1).map((value) => (
            <ListItem
              key={value}
              secondaryAction={
                <IconButton aria-label="comment">
                  <MoreIcon />
                </IconButton>
              }
            >
              <ListItemText primary={`Fulano da silva ${value}`} />
            </ListItem>
          ))}
        </List>
      </Container>

      <Fab sx={{ position: "fixed", bottom: 20, right: 30 }} color="primary">
        <AddIcon />
      </Fab>
    </main>
    */
