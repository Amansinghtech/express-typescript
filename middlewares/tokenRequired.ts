import { RequestHandler } from 'express'
import { checkAccessToken } from '../src/controller/auth'
import UserSchema from '../src/models/users'

const tokenRequired: RequestHandler = async (req, res, next) => {
	try {
		const authorization = req.headers.authorization
		if (!authorization)
			return res
				.status(401)
				.json({ message: 'authorization header is required' })

		const result = checkAccessToken<{ username: string }>(authorization)

		// check if the user is in the database
		const user = await UserSchema.findOne({
			username: result.decoded.username,
		})

		if (!user) return res.status(404).json({ message: 'User not found' })

		if (!result.success)
			return res.status(401).json({ message: result.message })

		console.log(result)
		next()
	} catch (error) {
		return res.status(500).json({ message: 'Internal Server Error' })
	}
}

export default tokenRequired
