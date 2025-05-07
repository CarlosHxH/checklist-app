import { Container, Paper } from "@mui/material";
import LoginForm from "./LoginForm";
import Image from "next/image";
import { auth } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session) {
    // Redirect to the dashboard if already authenticated
    console.log({session});
    
  }
  // If not authenticated, show the login form
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