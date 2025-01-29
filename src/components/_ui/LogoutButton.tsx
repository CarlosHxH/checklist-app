'use client'

import { LogoutOutlined } from '@mui/icons-material'
import { Button } from '@mui/material'
import { signOut } from 'next-auth/react'

export default function LogoutButton() {
  return (
    <>
      <Button color='inherit' onClick={() => signOut()} endIcon={<LogoutOutlined />}>
        Sair
      </Button>
    </>
  )
}