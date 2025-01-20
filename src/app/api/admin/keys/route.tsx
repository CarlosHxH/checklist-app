// pages/api/vehicle-keys.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { userId, vehicleId } = req.body

      const vehicleKey = await prisma.vehiclekey.create({
        data: {
          userId,
          vehicleId,
        },
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

      return res.status(201).json(vehicleKey)
    } catch (error) {
      console.error('Error:', error)
      return res.status(500).json({ error: 'Erro ao criar registro de chave' })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}