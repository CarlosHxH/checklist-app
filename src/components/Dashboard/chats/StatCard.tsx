import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

export type StatCardProps = {
  title: string;
  value: string;
  href: string;
};

export default function StatCard({ title, value, href }: StatCardProps) {
  return (
    <Link href={href||"#"} style={{textDecoration:'none'}}>
    <Card variant="outlined" sx={{ height: '100%', flexGrow: 1, transition: 'background-color 0.5s ease', '&:hover': { background: '#1976d2', color: '#fff', transition: 'background-color 0.5s ease' } }}>
      <CardContent>
        <Typography component="h2" variant="subtitle2" gutterBottom>
          {title}
        </Typography>
        <Stack direction="column" sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}>
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="p">{value}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
    </Link>
  );
}