"use client";
import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <Box>
      <Typography>
        Welcome to Toolpad! {session && session?.user?.name}
      </Typography>
      <h1 className="text-sm text-error font-bold underline">Hello world!</h1>
    </Box>
  );
}
