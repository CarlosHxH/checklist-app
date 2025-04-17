"use client"
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import React from "react"

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const { data } = useSession();
    if (!data) redirect('/auth/signin');
    return <main>{children}</main>
}