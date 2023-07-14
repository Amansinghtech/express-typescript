import mongoose, { Schema, Document } from 'mongoose'

export interface User extends Document {
	fullname: string
	username: string
	email: string
	password: string
	phone: string
}

const UserSchema = new Schema<User>({
	fullname: { type: String },
	username: { type: String, required: true },
	email: {
		type: String,
	},
	password: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
	},
})

export default mongoose.model<User>('User', UserSchema)
