export type VehicleType = {
    id: string;
    make: string;
    model: string;
    year: string;
    eixo: string;
    plate: string;
    createdAt: string; // ou Date, se você preferir converter para um objeto Date
    updatedAt: string; // ou Date
};

export type UserType = {
    id: string;
    email: string;
    password: string; // Considere usar um tipo mais seguro para senhas
    name: string;
    role: string;
    image: string | null;
    isActive: boolean;
    lastLogin: string; // ou Date
    emailVerified: string; // ou Date
    loginCount: number;
    createdAt: string; // ou Date
    updatedAt: string; // ou Date
};

export type InspectionType = {
    id: string;
    userId: string;
    vehicleId: string;
    status?: string;
    dataInspecao: string; // ou Date
    crlvEmDia: string; // "SIM" | "NÃO" (ou boolean)
    certificadoTacografoEmDia: string; // "SIM" | "NÃO" (ou boolean)
    nivelAgua: string; // "Normal" | "Baixo" | "Alto" (ou enum)
    nivelOleo: string; // "Normal" | "Baixo" | "Alto" (ou enum)
    eixo: string;
    dianteira: string; // "RUIM" | "BOM" | "REGULAR" (ou enum)
    descricaoDianteira: string;
    tracao: string; // "RUIM" | "BOM" | "REGULAR" (ou enum)
    descricaoTracao: string;
    truck: string; // "RUIM" | "BOM" | "REGULAR" (ou enum)
    descricaoTruck: string;
    quartoEixo: string; // "RUIM" | "BOM" | "REGULAR" (ou enum)
    descricaoQuartoEixo: string;
    avariasCabine: string; // "SIM" | "NÃO" (ou boolean)
    descricaoAvariasCabine: string;
    bauPossuiAvarias: string; // "SIM" | "NÃO" (ou boolean)
    descricaoAvariasBau: string;
    funcionamentoParteEletrica: string; // "RUIM" | "BOM" | "REGULAR" (ou enum)
    descricaoParteEletrica: string;
    fotoVeiculo: string;
    vehicle?: VehicleType;
    user?: UserType;
    isFinished?: boolean;
};

export type InspectionFormData  = {
    id: string;
    userId: string;
    vehicleId: string;
    status?: string;
    dataInspecao: string; // ou Date
    crlvEmDia: string; // "SIM" | "NÃO" (ou boolean)
    certificadoTacografoEmDia: string; // "SIM" | "NÃO" (ou boolean)
    nivelAgua: string; // "Normal" | "Baixo" | "Alto" (ou enum)
    nivelOleo: string; // "Normal" | "Baixo" | "Alto" (ou enum)
    eixo: string;
    dianteira: string; // "RUIM" | "BOM" | "REGULAR" (ou enum)
    descricaoDianteira: string;
    tracao: string; // "RUIM" | "BOM" | "REGULAR" (ou enum)
    descricaoTracao: string;
    truck: string; // "RUIM" | "BOM" | "REGULAR" (ou enum)
    descricaoTruck: string;
    quartoEixo: string; // "RUIM" | "BOM" | "REGULAR" (ou enum)
    descricaoQuartoEixo: string;
    avariasCabine: string; // "SIM" | "NÃO" (ou boolean)
    descricaoAvariasCabine: string;
    bauPossuiAvarias: string; // "SIM" | "NÃO" (ou boolean)
    descricaoAvariasBau: string;
    funcionamentoParteEletrica: string; // "RUIM" | "BOM" | "REGULAR" (ou enum)
    descricaoParteEletrica: string;
    fotoVeiculo: string;
    vehicle?: VehicleType[];
    user?: UserType[];
}

export type DataType = {
    user: UserType[];
    vehicle: VehicleType[];
    inspections: InspectionType[];
}