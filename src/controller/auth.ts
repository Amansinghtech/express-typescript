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
