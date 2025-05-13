import { Container, Paper } from "@mui/material";
import LoginForm from "./LoginForm";
import Image from "next/image";

export default async function SignInPage() {

  return (
    <main>
      <Container maxWidth="xs" sx={{display: "flex",flexDirection: "column",alignItems:"center",justifyContent:"center",minHeight: "100vh"}}>
        <Paper elevation={6} sx={{padding: 4,display: "flex",flexDirection: "column",alignItems: "center",width: "100%", bgcolor:'whitesmoke'}}>
          <Image priority width={500} height={500} src={'/logo.png'} alt={'logo'} style={{width:'auto',height:'100%'}}/>
          <LoginForm />
        </Paper>
      </Container>
    </main>
  );
}