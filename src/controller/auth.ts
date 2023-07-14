import jwt from 'jsonwebtoken'
import argon2 from 'argon2'
import { env } from '../environment'

export async function createHash(password: string): Promise<string> {
	return await argon2.hash(password)
}

export async function verifyHash(
	password: string,
	hash: string
): Promise<boolean> {
	return await argon2.verify(hash, password)
}

export function createAccessToken(payload: object): string {
	const iat = Math.floor(Date.now() / 1000) // timstamp in seconds

	const token = jwt.sign(
		{
			...payload,
			iat,
		},
		env.secret,
		{
			expiresIn: env.AccessTokenExpiry,
		}
	)
	return token
}
