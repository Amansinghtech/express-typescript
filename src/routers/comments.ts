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
const updateCommentSchema = z.object({
  comment: z.string().min(1).max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
})
const getCommentSchema = z.object({
  limit: z.coerce.number().min(0).max(100).default(10).optional(),
  skip: z.coerce.number().min(0).default(0).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc").optional(),
})

type addCommentInput = z.infer<typeof addCommentSchema>
type updateCommentInput = z.infer<typeof updateCommentSchema>
type getCommentInput = z.infer<typeof getCommentSchema>

const validateaddComment: RequestHandler = (req, res, next) => {
  try {
    addCommentSchema.parse(req.body)
    next()
  } catch (error) {
    return res.status(400).json(error)
  }
}
const validateupdateComment: RequestHandler = (req, res, next) => {
  try {
    updateCommentSchema.parse(req.body)
    next()
  } catch (error) {
    return res.status(400).json(error)
  }
}
const validategetComment: RequestHandler = (req, res, next) => {
  try {
    updateCommentSchema.parse(req.body)
    next()
  } catch (error) {
    return res.status(400).json(error)
  }
}
interface PopuplatedComment extends Omit<comments, "post" | "commentedBy"> {
  post: posts
  commentedBy: User
}
// add comment
router.post(
  "/addComment/:id",
  validateaddComment,
  async (req, res: TokenRequiredRes) => {
    try {
      console.log("created comment successfully")
      const { comment, tags } = req.body as addCommentInput
      const post: PopuplatedComment = await PostModal.findOne({
        id: req.params.id,
      })

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
          post: post._id,
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
// update comment
router.put("/updateComment/:id", validateupdateComment, async (req, res) => {
  try {
    const commentId = req.params.id

    const { comment, tags } = req.body as updateCommentInput

    const updatedComment: PopuplatedComment =
      await CommentModal.findOneAndUpdate(
        { _id: commentId },
        {
          $set: {
            comment: comment,
            tags: tags,
          },
        },
        {
          new: true,
        }
      ).populate(["post", "commentedBy"])

    if (!updatedComment) {
      return res.status(404).json({ message: "Comment not found" })
    }

    console.log("Updated comment successfully")

    return res.status(200).json({
      message: "Comment updated",
      payload: {
        comment: updatedComment.comment,
        tags: updatedComment.tags,
      },
    })
  } catch (error) {
    console.log("Error:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
})

router.get("/getComments/:id", validategetComment, async (req, res) => {
  try {
    const { limit, skip, sortOrder } = req.query as getCommentInput

    const comments: PopuplatedComment = await CommentModal.find({
      post: req.params.id,
    })
      .populate(["comment", "tags"])
      .sort({ createdOn: sortOrder })
      .limit(limit)
      .skip(skip)
      .lean()

    return res.status(200).json({
      message: "Fetched comments successfully",
      payload: comments,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: "Internal server error" })
  }
})
// delete comment
router.delete("/deleteComment/:id", async (req, res) => {
  try {
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
