import { RequestHandler, Router } from 'express'
import tokenRequired, {
	TokenRequiredRes,
} from '../../middlewares/tokenRequired'
import PostsModal, { posts } from '../models/posts'
import { z } from 'zod'

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
				originalPosts: originalPost ? originalPost._id : undefined,
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
					originalPosts: originalPost ? originalPost.id : undefined,
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
// Get Post
// Delete Post

export default router
