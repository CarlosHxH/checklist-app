"use client";
import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import DrawerAppBar from "@/components/DrawerAppBar";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/useUsers";
import { User } from "@prisma/client";
import { MenuIcon } from "@/components/styled";

export default function Page() {
  const router = useRouter();
  const { users, isLoading, isError } = useUsers();

  if (isLoading) return <div>Carregando...</div>;
  if (isError) return <div>Erro ao carregar</div>;

  return (
    <DrawerAppBar fab={() => router.push("/create")}>
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {users &&
          users.map((user: User, i: React.Key) => (
            <ListItem key={i}secondaryAction={<MenuIcon/>}>
              <ListItemText primary={"DAS0184"} secondary={
                <React.Fragment>
                  <ListItemText primary="Jan 7, 2014" secondary="" />
                </React.Fragment>
              }/>
              <ListItemText primary="Data" secondary={""} />
            </ListItem>
          ))}
      </List>
    </DrawerAppBar>
  );
}
