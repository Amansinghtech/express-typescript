import { Router } from 'express'
import UserSchema, { User } from '../models/users'
import { createAccessToken, createHash, verifyHash } from '../controller/auth'

interface LoginInput {
	username?: string
	password?: string
}

interface UserInput extends LoginInput {
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
			accessToken: createAccessToken({
				username: newUser.username,
			}),
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})

router.post('/login', async (req, res) => {
	try {
		// 1. username and password are required fields
		const { username, password } = req.body as LoginInput
		if (!username)
			return res.status(400).json({ message: 'username is required' })

		if (!password)
			return res.status(400).json({ message: 'password is required' })

		// 2. username should exist in the database
		const user = await UserSchema.findOne({ username })

		// 2.1 if not user then return error 404
		if (!user) return res.status(404).json({ message: 'user not found' })

		// 3. verify the password
		const result = await verifyHash(password, user.password)

		// 3.1 if password is wrong then return error 400
		if (!result) return res.status(400).json({ message: 'wrong password' })

		// 3.2 if password is correct then return the user with accessToken

		// 4. return the user and accesstoken
		return res.json({
			message: 'user logged in successfully',
			payload: {
				username: user.username,
				fullname: user.fullname,
				email: user.email,
				phone: user.phone,
				accessToken: createAccessToken({
					username: user.username,
				}),
			},
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})

export default router
