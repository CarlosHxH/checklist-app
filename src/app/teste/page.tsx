import { Inspection, User, Vehicle } from "@prisma/client"
import { prisma } from "@/lib/prisma";
import { session } from "@/hooks/getSession";


export default async function InspectionsPage() {

  const user = await session()
  const userInspections = await getUserInspections('cm52vhfhk0000fkiki64swd6h')
  console.log({user, userInspections});
  
  if (!userInspections) {
    return <div>No inspections found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Inspections for {userInspections.name || userInspections.email}
      </h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {userInspections.inspections.map((inspection) => (
          <div
            key={inspection.id}
            className="border rounded-lg p-4 shadow-sm"
          >
            <div className="font-semibold mb-2">
              Vehicle: {inspection.vehicle.make} {inspection.vehicle.model}
            </div>
            <div className="text-sm text-gray-600">
              Plate: {inspection.vehicle.licensePlate}
            </div>
            <div className="text-sm text-gray-600">
              Inspection Date: {inspection.dataInspecao.toLocaleDateString()}
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">CRLV Status:</span>
                <span className={inspection.crlvEmDia ? "text-green-600" : "text-red-600"}>
                  {inspection.crlvEmDia ? "Up to date" : "Expired"}
                </span>
              </div>
              {/* Add more inspection details as needed */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export type InspectionWithVehicle = Inspection & {
  vehicle: Vehicle;
}

export type UserWithInspections = User & {
  inspections: InspectionWithVehicle[];
}

export async function getUserInspections(userId: string): Promise<UserWithInspections | null> {
  try {
    const userWithInspections = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        inspections: {
          include: {
            vehicle: true,
          },
          orderBy: {
            dataInspecao: 'desc',
          },
        },
      },
    })
    
    return userWithInspections
  } catch (error) {
    console.error("Error fetching user inspections:", error)
    throw new Error("Failed to fetch user inspections")
  }
}