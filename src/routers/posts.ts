import { RequestHandler, Router } from "express"
import tokenRequired, {
  TokenRequiredRes,
} from "../../middlewares/tokenRequired"
import PostsModal, { posts } from "../models/posts"
import { z } from "zod"
import UsersModal, { User } from "../models/users"
import { Query } from "mongoose"
import { Request, Response, NextFunction } from "express"

// input pust body schema
const createPostSchema = z.object({
  caption: z
    .string()
    .min(3, {
      message: "caption must be at least 3 characters long",
    })
    .max(500, {
      message: "caption must be at most 500 characters long",
    }),
  tags: z.array(z.string().max(50)).max(10).optional(),
  originalPostId: z.string().max(40).optional(),
})

const updatePostSchema = z.object({
  caption: z
    .string()
    .min(3, {
      message: "caption must be at least 3 characters long",
    })
    .max(500, {
      message: "caption must be at most 500 characters long",
    })
    .optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
})

const getAllPostQuerySchema = z.object({
  limit: z.number().min(0).max(100),
  skip: z.number().min(0).default(0),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
})

type CreatePostInput = z.infer<typeof createPostSchema>
type UpdatePostInput = z.infer<typeof updatePostSchema>
type GetAllPostInput = z.infer<typeof getAllPostQuerySchema>

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

// const validateGetAllPostInput: RequestHandler = (req, res, next) => {
//   try {
//     getAllPostQuerySchema.parse(req.query)
//     next()
//   } catch (error) {
//     return res.status(400).json(error)
//   }
// }
const validateGetAllPostInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { limit, skip, sortOrder } = req.query as GetAllPostInput

    // Parse the limit and skip parameters to integers
    const parsedLimit = parseInt(String(limit), 10) // Base 10 for decimal numbers
    const parsedSkip = parseInt(String(skip), 10)

    // Check if the parsed values are valid numbers
    if (isNaN(parsedLimit) || isNaN(parsedSkip)) {
      throw new Error("Invalid limit or skip value.")
    }

    // Assign the parsed values back to req.query
    req.query = {
      ...req.query,
      limit: String(parsedLimit),
      skip: String(parsedSkip),
    }

    next()
  } catch (error) {
    return res.status(400).json({ message: error.message })
  }
}

interface PopuplatedPosts extends Omit<posts, "originalPost" | "user"> {
  originalPost: posts
  user: User
}

// Create Post
router.post(
  "/createPost",
  validateCreatePostInput,
  async (req, res: TokenRequiredRes) => {
    try {
      console.log("create post")
      const { caption, tags, originalPostId } = req.body as CreatePostInput

      let originalPost: posts | undefined

      if (originalPostId) {
        originalPost = await PostsModal.findOne({
          id: originalPostId,
        })
        if (!originalPost) {
          return res.status(404).json({
            message: "Original post not found",
          })
        }
      }
      console.log(req.body, res.locals.user)
      const newPost = await PostsModal.create({
        caption,
        tags,
        user: res.locals.user._id,
        originalPost: originalPost ? originalPost._id : undefined,
      })

      return res.status(200).json({
        message: "Post created",
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
        message: "Internal Server Error",
      })
    }
  }
)

// Update Post
router.put("/updatePost/:id", validateUpdatePostInput, async (req, res) => {
  try {
    const { caption, tags } = req.body as UpdatePostInput

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
    ).populate(["originalPost", "user"])) as PopuplatedPosts

    if (!post) return res.status(404).json({ message: "Post not found" })
    console.log("updated post successfully")

    return res.status(200).json({
      message: "Post created",
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
    return res.status(500).json({ message: "Internal Server error" })
  }
})

// Get Post
router.get("/getPost/:id", async (req, res) => {
  try {
    const post: PopuplatedPosts = await PostsModal.findOne({
      id: req.params.id,
    }).populate(["originalPost", "user"])

    console.log(post)

    return res.status(200).json({
      message: "Post fetched successfully",
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
    return res.status(500).json({ message: "Internal Server Error" })
  }
})
// Delete Post2
router.delete("/deletePost/:id", async (req, res) => {
  try {
    const post = await PostsModal.findOneAndDelete({ id: req.params.id })
    // console.log(post)
    if (!post) return res.status(404).json({ message: "post not found" })

    return res.send({
      message: "Post deleted successfully",
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})
// get ALL posts

router.get("/getAllPost", validateGetAllPostInput, async (req, res) => {
  try {
    // const query = getAllPostQuerySchema.parse(req.query)

    const { limit, skip, sortOrder } = req.query as GetAllPostInput

    const posts: PopuplatedPosts[] = await PostsModal.find({
      // user: res.locals.user.uid,
    })
      .populate(["originalPost", "user"])
      .sort({ createdOn: sortOrder })
      .limit(limit)
      .skip(skip)
      .lean() // the lean() method is used to convert to plain JavaScript objects

    // return res.status(200).json({
    //   message: "Posts fetched successfully",
    //   payload: posts.map((post) => ({
    //     id: post.id,
    //     caption: post.caption,
    //     tags: post.tags,
    //     createdOn: post.createdOn,
    //     lastEdited: post.lastEdited,
    //     user: post.user?.uid,
    //     originalPost: post.originalPost?.id,
    //   })),
    // })
    return res.status(200).send(posts)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
})

export default router
