import { Response, Router } from 'express'
import tokenRequired from '../../middlewares/tokenRequired'
import { User } from '../models/users'
const router = Router()

router.use(tokenRequired)

router.get('/getUserInfo', (req, res) => {
	console.log('this is from getUserInfo', res.locals.user)

	return res.json({
		message: 'Fetched User Successfully',
		payload: {
			email: res.locals.user.email,
			fullname: res.locals.user.fullname,
			phone: res.locals.user.phone,
			uid: res.locals.user.uid,
			verified: res.locals.user.verified,
			image: res.locals.user.image,
		},
	})
})

export default router
