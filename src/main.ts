import express from 'express'
import UsersRoute from './routers/users'
import mongoose from 'mongoose'

const app = express()
const port = 3000
app.use(express.json())
const mongoURI = process.env.MONGO_URI

console.log(mongoURI)

// use the users route
app.use('/users', UsersRoute)

// hello world route for root
app.route('/').get((req, res) => {
	res.send('hello world')
})

function main() {
	// connect to mongodb
	mongoose
		.connect(mongoURI)
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
