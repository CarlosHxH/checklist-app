"use client";
import React from "react";
import useSWR from "swr";
import InspectionTable from "./InspectionTable";
import { fetcher } from "@/lib/ultils";


export default function InspectionManager() {
  const { data } = useSWR('/api/inspect',fetcher)
  return (
    <InspectionTable data={data}/>
  );
}