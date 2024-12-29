"use client"
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Container, List, ListItem, ListItemText } from "@mui/material";
import { MenuIcon } from "@/components/styled";
import React from "react";
import { User } from "@prisma/client";
import { useUsers } from "@/hooks/useUsers";
import { session } from "@/hooks/getUsers";

export default function Home() {
  const { users, isLoading } = useUsers();

  const user = async()=>await session();
  if (!user) {
    redirect("/api/auth/signin");
  }


  return (
    <div>
      <Navbar />

      <Container>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {isLoading && <>Loading...</>}
        {users &&
          users.map((user: User, i: React.Key) => (
            <ListItem key={i}secondaryAction={<MenuIcon/>}>
              <ListItemText primary={user.name} secondary={
                <React.Fragment>
                  <ListItemText primary={user.createdAt.toString()} secondary="" />
                </React.Fragment>
              }/>
              <ListItemText primary="Data" secondary={""} />
            </ListItem>
          ))}
      </List>
      </Container>
    </div>
  );
}
