'use client'

import { LogoutOutlined } from '@mui/icons-material'
import { Box, Button, IconButton } from '@mui/material'
import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <Box textAlign={'end'}>
      {/*<Button color='inherit' onClick={() => signOut()} endIcon={<LogoutOutlined />}></Button>*/}
      <IconButton onClick={() => signOut()} color='inherit'><LogoutOutlined /></IconButton>
    </Box>
  )
}