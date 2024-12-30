import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface User {
    id: string;
    name: string;
    email: string;
}

export const session: () => Promise<User | null> = async () => {
    const sessionData = await getServerSession(authOptions);
    return sessionData as User | null;
};
