import { jwtVerify, SignJWT } from 'jose';

export interface CustomJWT {
	user?: {
		id: string;
		username: string;
		name?: string;
		role?: string;
		email?: string;
	};
	customClaims?: {
		permissions?: string[];
		metadata?: Record<string, undefined>;
	};
	iat?: number;
	exp?: number;
}

export const env = {
	get AUTH_SECRET() {
		if (!process.env.AUTH_SECRET) {
			throw new Error('AUTH_SECRET environment variable is not set');
		}
		return process.env.AUTH_SECRET;
	},
};

// Convert string secret to Uint8Array for jose
const getSecretKey = () => {
	return new TextEncoder().encode(env.AUTH_SECRET);
};

// Decode and verify JWT token
export async function decoded(token: string): Promise<CustomJWT> {
	try {
		const { payload } = await jwtVerify(token, getSecretKey());
		return payload as CustomJWT;
	} catch (error) {
		console.log(error);
		throw new Error('Invalid token');
	}
}
interface EncodeType {
	user: {
		id: string;
		username: string;
		role: string;
	}
}
// Create and sign new JWT token
export async function encoded(payload: EncodeType): Promise<string> {
	const jwtPayload = {
		...payload,
		user: {
			...payload.user
		}
	};
	return await new SignJWT(jwtPayload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('1d')
		.sign(getSecretKey());
}