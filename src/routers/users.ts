import { Router } from 'express'
const router = Router()

type User = {
	name: string
	age: number
}

const users: User[] = [
	{
		age: 20,
		name: 'John',
	},
	{
		age: 21,
		name: 'Jane',
	},
]

router.get('/', (req, res) => {
	return res.json(users)
})

router.post('/', (req, res) => {
	const { name, age } = req.body as User
	users.push({ name, age })
	// console.log(users)
	return res.json({ message: 'hello from users route, but ye wala alag h' })
})

router.delete('/:name', (req, res) => {
	const name = req.params.name

	const index = users.findIndex((user) => user.name === name)
	if (index === -1) {
		return res.status(404).json({ message: 'user not found' })
	}

	users.splice(index, 1)
	return res.json({ message: 'user deleted' })
})

export default router
