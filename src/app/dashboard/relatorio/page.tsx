"use client";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Component() {
  const { data: session } = useSession();
  if (!session) redirect('/')
  
  return (
    <>
      <Typography component={"h2"}>Logout Page</Typography>
      <Button onClick={() => signOut()}>Sign in</Button>
    </>
  );
}
