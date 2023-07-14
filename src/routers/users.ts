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

export default router
