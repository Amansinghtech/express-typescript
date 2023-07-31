import { RequestHandler, Router } from 'express'
import tokenRequired, {
	TokenRequiredRes,
} from '../../middlewares/tokenRequired'
import PostsModal, { posts } from '../models/posts'
import { z } from 'zod'
import UsersModal, { User } from '../models/users'

// input pust body schema
const createPostSchema = z.object({
	caption: z
		.string()
		.min(3, {
			message: 'caption must be at least 3 characters long',
		})
		.max(500, {
			message: 'caption must be at most 500 characters long',
		}),
	tags: z.array(z.string().max(50)).max(10).optional(),
	originalPostId: z.string().max(40).optional(),
})

const updatePostSchema = z.object({
	caption: z
		.string()
		.min(3, {
			message: 'caption must be at least 3 characters long',
		})
		.max(500, {
			message: 'caption must be at most 500 characters long',
		})
		.optional(),
	tags: z.array(z.string().max(50)).max(10).optional(),
})

type CreatePostInput = z.infer<typeof createPostSchema>

const router = Router()
router.use(tokenRequired)

const validateCreatePostInput: RequestHandler = (req, res, next) => {
	try {
		createPostSchema.parse(req.body)
		next()
	} catch (error) {
		return res.status(400).json(error)
		// return res.status(400).json({
		//     message: error.errors[0].message
		// })
	}
}

const validateUpdatePostInput: RequestHandler = (req, res, next) => {
	try {
		updatePostSchema.parse(req.body)
		next()
	} catch (error) {
		return res.status(400).json(error)
		// return res.status(400).json({
		//     message: error.errors[0].message
		// })
	}
}

interface PopuplatedPosts extends Omit<posts, 'originalPost' | 'user'> {
	originalPost: posts
	user: User
}

// Create Post
router.post(
	'/createPost',
	validateCreatePostInput,
	async (req, res: TokenRequiredRes) => {
		try {
			const { caption, tags, originalPostId } =
				req.body as CreatePostInput

			let originalPost: posts | undefined

			if (originalPostId) {
				originalPost = await PostsModal.findOne({
					id: originalPostId,
				})
				if (!originalPost) {
					return res.status(404).json({
						message: 'Original post not found',
					})
				}
			}

			const newPost = await PostsModal.create({
				caption,
				tags,
				user: res.locals.user._id,
				originalPost: originalPost ? originalPost._id : undefined,
			})

			return res.status(200).json({
				message: 'Post created',
				payload: {
					id: newPost.id,
					caption: newPost.caption,
					tags: newPost.tags,
					createdOn: newPost.createdOn,
					lastEdited: newPost.lastEdited,
					user: res.locals.user.uid,
					originalPost: originalPost ? originalPost.id : undefined,
				},
			})
		} catch (error) {
			console.log(error)

			return res.status(500).json({
				message: 'Internal Server Error',
			})
		}
	}
)

// Update Post
router.put('/updatePost/:id', validateCreatePostInput, async (req, res) => {
	try {
		const { caption, tags } = req.body as CreatePostInput

		const post = (await PostsModal.findOneAndUpdate(
			{ id: req.params.id },
			{
				$set: {
					caption: caption,
					tags: tags,
				},
			},
			{
				new: true,
			}
		).populate(['originalPost', 'user'])) as PopuplatedPosts

		if (!post) return res.status(404).json({ message: 'Post not found' })
		console.log('updated post successfully')

		return res.status(200).json({
			message: 'Post created',
			payload: {
				id: post.id,
				caption: post.caption,
				tags: post.tags,
				createdOn: post.createdOn,
				lastEdited: post.lastEdited,
				user: post.user?.uid,
				originalPost: post.originalPost?.id,
			},
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server error' })
	}
})

// Get Post
router.get('/getPost/:id', async (req, res) => {
	try {
		const post: PopuplatedPosts = await PostsModal.findOne({
			id: req.params.id,
		}).populate(['originalPost', 'user'])

		console.log(post)

		return res.status(200).json({
			message: 'Post created',
			payload: {
				id: post.id,
				caption: post.caption,
				tags: post.tags,
				createdOn: post.createdOn,
				lastEdited: post.lastEdited,
				user: post.user?.uid,
				originalPost: post.originalPost?.id,
			},
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})
// Delete Post2
router.delete('/deletePost/:id', async (req, res) => {
	try {
		const post = await PostsModal.findOneAndDelete({ id: req.params.id })
		// console.log(post)
		if (!post) return res.status(404).json({ message: 'post not found' })

		return res.send({
			message: 'Post deleted successfully',
		})
	} catch (error) {
		console.log(error)
		return res.status(500).json({ message: 'Internal Server Error' })
	}
})
export default router
