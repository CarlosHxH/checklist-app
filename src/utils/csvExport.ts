import { PrismaClient } from '@prisma/client'
import { Parser } from 'json2csv'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

interface ExportOptions {
  model: string
  fields?: string[]
  where?: Record<string, any>
  orderBy?: Record<string, 'asc' | 'desc'>
  filename?: string
  outputDir?: string
}

export async function exportToCsv({
  model,
  fields,
  where = {},
  orderBy = {},
  filename,
  outputDir = './exports'
}: ExportOptions): Promise<string> {
  try {
    // Verifica se o modelo existe no Prisma
    if (!(model in prisma)) {
      throw new Error(`Modelo "${model}" não encontrado no Prisma`)
    }

    // Busca os dados usando Prisma
    const data = await (prisma as any)[model].findMany({
      where,
      orderBy,
      select: fields ? Object.fromEntries(fields.map(f => [f, true])) : undefined
    })

    if (data.length === 0) {
      throw new Error('Nenhum dado encontrado para exportar')
    }

    // Configura o Parser do JSON2CSV
    const json2csvParser = new Parser({
      fields: fields || Object.keys(data[0]),
      delimiter: ';'  // Usa ponto e vírgula como delimitador para melhor compatibilidade
    })

    // Converte os dados para CSV
    const csv = json2csvParser.parse(data)

    // Cria o diretório de saída se não existir
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Define o nome do arquivo
    const defaultFilename = `${model}_export_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
    const finalFilename = filename || defaultFilename

    // Define o caminho completo do arquivo
    const filePath = path.join(outputDir, finalFilename)

    // Salva o arquivo CSV
    fs.writeFileSync(filePath, '\ufeff' + csv, { encoding: 'utf8' }) // Adiciona BOM para suporte a caracteres especiais

    return filePath
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Exemplo de uso da função
export async function exportUsersToCSV() {
  try {
    const filePath = await exportToCsv({
      model: 'user', // Nome do seu modelo no Prisma
      fields: ['id', 'name', 'email', 'createdAt'], // Campos que você quer exportar
      where: {
        active: true // Exemplo de filtro
      },
      orderBy: {
        createdAt: 'desc'
      },
      filename: 'usuarios.csv'
    })
    
    console.log(`Arquivo CSV gerado com sucesso: ${filePath}`)
    return filePath
  } catch (error) {
    console.error('Erro na exportação:', error)
    throw error
  }
}