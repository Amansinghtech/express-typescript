import { Request, Response, NextFunction, Router } from "express";
import tokenRequired from "../../middlewares/tokenRequired";
import UserSchema, { User } from "../models/users";
import { z, AnyZodObject } from "zod";

const router = Router();
router.use(tokenRequired);

router.get("/getUserInfo", (req, res) => {
  console.log("this is from getUserInfo", res.locals.user);

  return res.json({
    message: "Fetched User Successfully",
    payload: {
      email: res.locals.user.email,
      fullname: res.locals.user.fullname,
      phone: res.locals.user.phone,
      uid: res.locals.user.uid,
      verified: res.locals.user.verified,
      image: res.locals.user.image,
    },
  });
});

const updateschema = z.object({
  body: z.object({
    email: z.string().email(),
    fullname: z
      .string()
      .min(2, { message: "Username must be at least 2 character long" })
      .max(50, { message: "Username must be at most 50 characters long" }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .max(50, { message: "Password must be at most 50 characters" }),
    bio: z
      .string()
      .min(0)
      .max(50, { message: "bio must be atmost 50 characters" }),
    phone: z
      .string()
      .min(0)
      .max(10, { message: "please enter valid phone number" }),
    dialCode: z
      .string()
      .min(0)
      .max(4, { message: "dialCode must be atmost 4 characters" }),
    age: z.number().int().positive({ message: "invalid age" }),
  }),
});

// type updatedata = z.infer<typeof schema>;
// const updateschema = z.object({
//   body: z.object({
//     fullName: z.string().nullish(),
//     email: z.string().nullish(),
//     password: z.string().nullish(),
//     phone: z.string().nullish(),
//     dialCode: z.string().nullish(),
//     age: z.number().nullish(),
//   }),
// });

const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      return res.status(400).json(error);
    }
  };

// router.put("/updateUser", validate(updateschema), async (req, res, next) => {
//   try {
//     const updateData = req.body as User;

//     const user = await UserSchema.findOneAndUpdate(
//       {
//         id: res.locals.user.id,
//       },
//       {
//         new: true,
//       },
//       {
//         $set: {
//           fullname: updateData?.fullname,
//           bio: updateData?.bio,
//           password: updateData?.password,
//           phone: updateData?.phone,
//           dialCode: updateData?.dialCode,
//           age: updateData?.age,
//         },
//       }
//     );

//     if (user) {
//       console.log("Data base updated");
//       res.send(user);
//     }
//     // return res.status(404).send();
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: error.message || "internal server error" });
//   }
// });

router.put(
  "/updateUser",
  validate(updateschema),
  (req: Request, res: Response): Response => {
    try {
      const updateData = req.body as User;

      const user = UserSchema.findOneAndUpdate(
        {
          id: res.locals.user.id,
        },
        {
          new: true,
        },
        {
          $set: {
            fullname: updateData?.fullname,
            bio: updateData?.bio,
            password: updateData?.password,
            phone: updateData?.phone,
            dialCode: updateData?.dialCode,
            age: updateData?.age,
          },
        }
      );
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      } else {
        return res.json({ message: "Data base updated" });
      }
      // res.send(user);
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message || "internal server error" });
    }
  }
);

export default router;
