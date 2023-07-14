import { Router } from 'express'
import UserSchema, { User } from '../models/users'
import { createHash } from '../controller/auth'

interface UserInput {
	username?: string
	fullname?: string
	password?: string
	email?: string
	phone?: string
}

const router = Router()
router.post('/', async (req, res) => {
	try {
		const { fullname, password, email, username } = req.body as User

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

router.post('/signup', async (req, res) => {
	try {
		const formData = req.body as UserInput
		//1. username and password are required fields

		if (!formData.username)
			return res.status(400).json({ message: 'username is required' })

		if (!formData.password)
			return res.status(400).json({ message: 'password is required' })

		// 1.1 username should be unique
		const existingUser = await UserSchema.findOne({
			username: formData.username,
		}) // find [] fineOne {}

		if (existingUser)
			return res.status(400).json({ message: 'username already exists' })

		//2. password has to be atleast 8 characters long
		if (formData.password.length < 8) {
			return res.status(400).json({
				message: 'password should be atleast 8 characters long',
			})
		}
		//3. hash the password
		const hashedPassword = await createHash(formData.password)

		//4. save the user in the database
		const newUser = await UserSchema.create({
			username: formData.username,
			password: hashedPassword,
			fullname: formData.fullname,
			email: formData.email,
			phone: formData.phone,
		})
		//5. return the user & accesstoken

		return res.json({
			message: 'user created successfully',
			payload: {
				username: newUser.username,
				fullname: newUser.fullname,
				email: newUser.email,
				phone: newUser.phone,
			},
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})

export default router
