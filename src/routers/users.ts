import { Router } from 'express'
import UserSchema, { User } from '../models/users'
import {
	checkAccessToken,
	createAccessToken,
	createHash,
	verifyHash,
} from '../controller/auth'

interface LoginInput {
	email?: string
	password?: string
}

interface UserInput extends LoginInput {
	email?: string
	password?: string
	fullname?: string
	phone?: string
}

const router = Router()
router.post('/', async (req, res) => {
	try {
		const { fullname, password, email } = req.body as User

		if (!password || !email) {
			return res
				.status(400)
				.json({ message: 'password and username are required' })
		}

		const user = await UserSchema.findOne({ email })

		if (user) {
			return res.status(400).json({ message: 'username already exists' })
		}

		const newUser = await UserSchema.create({
			fullname,
			password,
			email,
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

		if (!formData.email)
			return res.status(400).json({ message: 'email is required' })

		if (!formData.password)
			return res.status(400).json({ message: 'password is required' })

		// 1.1 username should be unique
		const existingUser = await UserSchema.findOne({
			email: formData.email,
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
			email: formData.email,
			password: hashedPassword,
			fullname: formData.fullname,
			phone: formData.phone,
		})
		//5. return the user & accesstoken

		return res.json({
			message: 'user created successfully',
			payload: {
				fullname: newUser.fullname,
				email: newUser.email,
				phone: newUser.phone,
			},
			accessToken: createAccessToken({
				email: newUser.email,
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
		const { email, password } = req.body as LoginInput
		if (!email)
			return res.status(400).json({ message: 'email is required' })

		if (!password)
			return res.status(400).json({ message: 'password is required' })

		// 2. email should exist in the database
		const user = await UserSchema.findOne({ email })

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
				email: user.email,
				fullname: user.fullname,
				phone: user.phone,
				accessToken: createAccessToken({
					email: user.email,
				}),
			},
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})

router.get('/verifyToken', async (req, res) => {
	try {
		const authorization = req.headers.authorization
		if (!authorization)
			return res
				.status(401)
				.json({ message: 'authorization header is required' })

		const result = checkAccessToken(authorization)

		if (!result.success)
			return res.status(401).json({ message: result.message })

		console.log(result)
		return res.json({ message: 'hello from verifyToken route' })
	} catch (error) {
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})

export default router
