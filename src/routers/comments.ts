import { RequestHandler, Router } from "express"
import tokenRequired, {
  TokenRequiredRes,
} from "../../middlewares/tokenRequired"
import { z } from "zod"
import CommentModal, { comments } from "../models/comments"
import PostModal, { posts } from "../models/posts"
import { User } from "../models/users"

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
interface PopuplatedComment extends Omit<comments, "post" | "commentedBy"> {
  post: posts
  commentedBy: User
}

router.post(
  "/addComment/:id",
  validateaddComment,
  async (req, res: TokenRequiredRes) => {
    try {
      console.log("created comment successfully")
      const { comment, tags } = req.body as addCommentInput
      const post = (await PostModal.findOne({
        id: req.params.id,
      })) as PopuplatedComment

      console.log(post)

      const newComment = await CommentModal.create({
        commentedBy: res.locals.user._id,
        post: post._id,
        comment,
        tags,
      })
      return res.status(200).json({
        message: "added comment successfully",
        payload: {
          commentedBy: res.locals.user._id,
          createdOn: newComment.createdOn,
          editedOn: newComment.editedOn,
          visibility: newComment.visibility,
          comment: newComment.comment,
          tags: newComment.tags,
        },
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({ message: "internal server error" })
    }
  }
)
// delete comment
router.delete("deleteComment/:id", async (req, res) => {
  console.log("harshall comment")
  try {
    // console.log("harsh")
    const post = await CommentModal.findOneAndDelete({
      _id: req.params.id,
    })
    console.log(post)

    if (!post) return res.status(404).json({ message: "Comment not found" })
    return res.status(200).json({ message: "Comment deleted" })
  } catch (error) {
    return res.status(500).json({ message: "internal server error" })
  }
})

export default router
