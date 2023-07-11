import express from 'express'
import UsersRoute from './routers/users'

const app = express()
const port = 3000

app.use(express.json())

// use the users route
app.use('/users', UsersRoute)

// hello world route for root
app.route('/').get((req, res) => {
	res.send('hello world')
})

function main() {
	app.listen(port, () => {
		console.log(`listening at http://localhost:${port}`)
	})
}

main()
