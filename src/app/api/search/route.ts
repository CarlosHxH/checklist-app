import { prisma } from "@/lib/prisma";
import { type NextRequest } from "next/server";
import { Parser } from 'json2csv';

// Define os tipos permitidos de modelos
type AllowedModels = "user" | "vehicle" | "inspection";

// Interface para o resultado da query
interface QueryResult {
  model: AllowedModels;
  data: any[];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");
  const exportType = searchParams.get("export");

  if (!query) {
    return Response.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Define o mapeamento dos modelos do Prisma
    const models: Record<AllowedModels, any> = {
      user: prisma.user,
      vehicle: prisma.vehicle,
      inspection: prisma.inspection,
    };

    // Array para armazenar as promises das queries
    const queryPromises: Promise<QueryResult>[] = [];

    // Processa cada modelo solicitado
    const requestedModels = query.split(",") as AllowedModels[];
    
    for (const modelName of requestedModels) {
      if (modelName in models) {
        queryPromises.push(
          models[modelName].findMany().then((data: any) => ({
            model: modelName,
            data,
          }))
        );
      }
    }

    // Executa todas as queries em paralelo
    const results = await Promise.all(queryPromises);

    // Formata o resultado final
    const formattedResults = results.reduce((acc, { model, data }) => {
      acc[model] = data;
      return acc;
    }, {} as Record<AllowedModels, any>);

    // Se export=csv, retorna um arquivo CSV
    if (exportType === 'csv') {
      // Se houver apenas um modelo, exporta diretamente
      if (requestedModels.length === 1) {
        const modelData = formattedResults[requestedModels[0]];
        if (modelData && modelData.length > 0) {
          const parser = new Parser({
            delimiter: ';'
          });
          const csv = parser.parse(modelData);
          
          // Configura os headers para download do arquivo
          return new Response(csv, {
            headers: {
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition': `attachment; filename=${requestedModels[0]}_${Date.now()}.csv`
            }
          });
        }
      } else {
        // Se houver múltiplos modelos, cria um arquivo ZIP com todos os CSVs
        const JSZip = require('jszip');
        const zip = new JSZip();

        for (const modelName of requestedModels) {
          const modelData = formattedResults[modelName];
          if (modelData && modelData.length > 0) {
            const parser = new Parser({
              delimiter: ';'
            });
            const csv = parser.parse(modelData);
            zip.file(`${modelName}.csv`, csv);
          }
        }

        const zipContent = await zip.generateAsync({ type: 'uint8array' });
        
        return new Response(zipContent, {
          headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=export_${Date.now()}.zip`
          }
        });
      }
    }

    // Retorno padrão em JSON se não for exportação CSV
    return Response.json({ data: formattedResults }, { status: 200 });
  } catch (error) {
    console.error("Database query error:", error);
    
    return Response.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  } finally {
    // Garante que a conexão com o Prisma seja fechada
    await prisma.$disconnect();
  }
}