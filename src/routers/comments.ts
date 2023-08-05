import { RequestHandler, Router } from 'express'
import tokenRequired, {
	TokenRequiredRes,
} from '../../middlewares/tokenRequired'
import { z } from 'zod'
import CommentModal, { comments } from '../models/comments'
import PostModal, { posts } from '../models/posts'
import { User } from '../models/users'

const router = Router()
router.use(tokenRequired)
const addCommentSchema = z.object({
	comment: z.string().min(1).max(1000),
	tags: z.array(z.string().max(50)).max(10).optional(),
})

type addCommentInput = z.infer<typeof addCommentSchema>

const validateaddComment: RequestHandler = (req, res, next) => {
	try {
		addCommentSchema.parse(req.body)
		next()
	} catch (error) {
		return res.status(400).json(error)
	}
}
interface PopuplatedComment extends Omit<comments, 'post' | 'commentedBy'> {
	post: posts
	commentedBy: User
}

router.post(
	'/addComment/:id',
	validateaddComment,
	async (req, res: TokenRequiredRes) => {
		try {
			console.log('created comment successfully')
			const { comment, tags } = req.body as addCommentInput

			const post: PopuplatedComment = await PostModal.findOne({
				id: req.params.id,
			})

			const newComment = await CommentModal.create({
				commentedBy: res.locals.user._id,
				post: post._id,
				comment,
				tags,
			})
			return res.status(200).json({
				message: 'added comment successfully',
				payload: {
					commentedBy: res.locals.user.uid,
					createdOn: newComment.createdOn,
					editedOn: newComment.editedOn,
					visibility: newComment.visibility,
					comment: newComment.comment,
					tags: newComment.tags,
				},
			})
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'internal server error' })
		}
	}
)

export default router
