import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import Custom from './actions';



export default async function Page() {
    const session = await getServerSession(authOptions);

    if (!session?.user) { return <div>Not authenticated</div> }

    const inspections = await prisma.inspect.findMany({
        where: { userId: session.user.id },
        include: {
            user: { select: { name: true } },
            vehicle: true,
            start: true,
            end: true
        },
        orderBy: { createdAt: 'desc' },
        take: 4,
    });

    const newData = (e: Date) => new Date(e).toLocaleString('pt-BR')

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {inspections.map((p, i) => (
                <div key={i} style={{ boxShadow: '1px 1px 2px gray', padding: 10, margin: 10 }}>
                    <p>Veiculo: {p.vehicle?.model} - {p.vehicle?.plate}</p>
                    <p>Motorista: {p.user.name}</p>
                    <p> Data: {newData(p.createdAt) || ""}</p>
                    <div style={{marginBottom: 15}}>
                        <span style={{ backgroundColor: p.start?.avariasCabine ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Avarias cabine</span>
                        <span style={{ backgroundColor: p.start?.bauPossuiAvarias ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Avarias Báu</span>
                        <span style={{ backgroundColor: p.start?.dianteira ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Pneus dianteira</span>
                        <span style={{ backgroundColor: p.start?.tracao ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Pneus tracao</span>
                        <span style={{ backgroundColor: p.start?.truck ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Pneus truck</span>
                        <span style={{ backgroundColor: p.start?.quartoEixo ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Pneus quarto eixo</span>
                        <span style={{ backgroundColor: p.start?.nivelOleo ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Nivel oleo</span>
                        <span style={{ backgroundColor: p.start?.nivelAgua ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>NivelAgua</span>
                    </div>
                    <div>
                    <div style={{marginBottom: 15}}>
                        <span style={{ backgroundColor: p.end?.avariasCabine ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Avarias cabine</span>
                        <span style={{ backgroundColor: p.end?.bauPossuiAvarias ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Avarias Báu</span>
                        <span style={{ backgroundColor: p.end?.dianteira ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Pneus dianteira</span>
                        <span style={{ backgroundColor: p.end?.tracao ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Pneus tracao</span>
                        <span style={{ backgroundColor: p.end?.truck ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Pneus truck</span>
                        <span style={{ backgroundColor: p.end?.quartoEixo ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Pneus quarto eixo</span>
                        <span style={{ backgroundColor: p.end?.nivelOleo ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>Nivel oleo</span>
                        <span style={{ backgroundColor: p.end?.nivelAgua ? "#00a01f" : "#ff4633", borderRadius: 20, margin: 2, padding: 5, color: "#fff" }}>NivelAgua</span>
                    </div>
                    </div>
                </div>
            ))}

        </div>
    )
}