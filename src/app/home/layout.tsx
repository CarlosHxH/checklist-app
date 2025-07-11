import * as React from "react";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";

export default async function DashboardPagesLayout(props: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout hideNavigation branding={{}}>
      {props.children}
    </DashboardLayout>
  );
}
