import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Container, Typography, Paper } from "@mui/material";
import { authOptions } from "@/lib/auth";
import LoginForm from "@/app/auth/signin/LoginForm";
import Image from "next/image";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {redirect("/")}

  return (
    <main>
      <Container maxWidth="xs" sx={{display: "flex",flexDirection: "column",alignItems:"center",justifyContent:"center",minHeight: "100vh"}}>
        <Paper elevation={6} sx={{padding: 4,display: "flex",flexDirection: "column",alignItems: "center",width: "100%", bgcolor:'whitesmoke'}}>
          <Image width={500} height={500} src={'/logo.png'} alt={'logo'} style={{width:'auto',height:'100%'}}/>
          <Typography component="h1" variant="h5" color={'primary'} sx={{ mb: 2, fontWeight: 'bold' }}>Informe email e senha</Typography>
          <LoginForm />
        </Paper>
      </Container>
    </main>
  );
}