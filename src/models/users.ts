import mongoose, { Schema, Document } from 'mongoose'

export interface User extends Document {
	fullname: string
	email: string
	password: string
	phone: string
}

const UserSchema = new Schema<User>({
	fullname: { type: String },
	email: {
		type: String,
		unique: true,
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
