"use client"
import React from 'react'
import { Controller, Form, useForm } from 'react-hook-form'
import { PrismaClient } from '@prisma/client'
import { Button, Card, CardContent, CardHeader, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

// Tipos
interface VehicleKey {
  id: string
  userId: string
  vehicleId: string
  createdAt: Date
  updatedAt?: Date
  user: {
    name: string
  }
  vehicle: {
    plate: string
    model: string
  }
}

interface FormData {
  userId: string
  vehicleId: string
}

// Função para buscar dados do servidor
export async function getServerSideProps() {
  const prisma = new PrismaClient()
  
  const vehicleKeys = await prisma.vehicleKey.findMany({
    include: {
      user: {
        select: {
          name: true,
        },
      },
      vehicle: {
        select: {
          plate: true,
          model: true,
        },
      },
    },
  })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
    },
  })

  const vehicles = await prisma.vehicle.findMany({
    select: {
      id: true,
      plate: true,
      model: true,
    },
  })

  return {
    props: {
      initialVehicleKeys: JSON.parse(JSON.stringify(vehicleKeys)),
      users: JSON.parse(JSON.stringify(users)),
      vehicles: JSON.parse(JSON.stringify(vehicles)),
    },
  }
}

// Componente principal
interface VehicleKeyControlProps {
  initialVehicleKeys: VehicleKey[];
  users: { id: string; name: string }[];
  vehicles: { id: string; plate: string; model: string }[];
}

export default function VehicleKeyControl({ 
  initialVehicleKeys,
  users,
  vehicles,
}: VehicleKeyControlProps) {
  const [vehicleKeys, setVehicleKeys] = React.useState<VehicleKey[]>(initialVehicleKeys)
  
  const form = useForm<FormData>({
    defaultValues: {
      userId: '',
      vehicleId: '',
    },
  })

  async function onSubmit(data: FormData) {
    try {
      const response = await fetch('/api/vehicle-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar registro')
      }

      const newVehicleKey = await response.json()
      setVehicleKeys([...vehicleKeys, newVehicleKey])
      form.reset()
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <Typography>Controle de Chaves</Typography>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                control={form.control}
                name="userId"
                render={({ field }) => (<></>)}
              />

              <Controller
                control={form.control}
                name="vehicleId"
                render={({ field }) => (<>{field.name}</>
                )}
              />
              <Button type="submit">Registrar Chave</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Typography>Registros de Chaves</Typography>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuário</TableCell>
                <TableCell>Veículo</TableCell>
                <TableCell>Data de Registro</TableCell>
                <TableCell>Última Atualização</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vehicleKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>{key.user.name}</TableCell>
                  <TableCell>{key.vehicle.plate} - {key.vehicle.model}</TableCell>
                  <TableCell>{new Date(key.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {key.updatedAt 
                      ? new Date(key.updatedAt).toLocaleString() 
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}