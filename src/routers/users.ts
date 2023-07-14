import { Router } from 'express'
import UserSchema, { User } from '../models/users'
const router = Router()
import { createHash } from '../controller/auth'

router.post('/', async (req, res) => {
	try {
		const { name, password, email, username } = req.body as User

		if (!password || !username) {
			return res
				.status(400)
				.json({ message: 'password and username are required' })
		}

		const user = await UserSchema.findOne({ username })

		if (user) {
			return res.status(400).json({ message: 'username already exists' })
		}

		const newUser = await UserSchema.create({
			name,
			password,
			email,
			username,
		})

		return res.json(newUser.toObject())
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'something went wrong' })
	}

	// console.log(users)
	// return res.json({ message: 'hello from users route, but ye wala alag h' })
})

interface LoginRequest {
	username: string
	password: string
}

router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body as LoginRequest
		console.log(username, password)

		if (!username || !password) {
			return res
				.status(400)
				.json({ message: 'username and password are required' })
		}

		// check createHash function in auth.ts
		const hashedPassword = await createHash(password)
		res.json({ message: 'hello from login route', hashedPassword })
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'something went wrong' })
	}
})
export default router
