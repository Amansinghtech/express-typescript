import express from 'express'
import OnboardingRoute from './routers/onboadring'
import UsersRoute from './routers/users'
import ProtectedRoute from './routers/protected'
import mongoose from 'mongoose'
import tokenRequired from '../middlewares/tokenRequired'
import { env } from './environment'
import cors from 'cors'

const app = express()
const port = 4000

app.use(
	cors({
		origin: 'http://localhost:3000',
	})
)
app.use(express.json())

// use the users route
app.use('/onboarding', OnboardingRoute)
app.use('/users', UsersRoute)

// hello world route for root
app.route('/').get((req, res) => {
	res.send('hello world')
})

app.use('/protected', tokenRequired, ProtectedRoute)

function main() {
	// connect to mongodb
	mongoose
		.connect(env.mongoURI)
		.then(() => {
			console.log('connected to mongodb')
			app.listen(port, () => {
				console.log(`listening at http://localhost:${port}`)
			})
		})
		.catch((err) => {
			console.log(err)
		})
}

main()
