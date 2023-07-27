import mongoose, { Schema, Document, ObjectId } from 'mongoose'
 
export interface savedPosts extends Document{
   post:ObjectId
   user:ObjectId
   createdAt:Date
}
const savedPostsSchema = new Schema<savedPosts>({ 
    post:{ type:Schema.Types.ObjectId, ref: 'user'},
    user:{ type:Schema.Types.ObjectId, ref: 'user'},
    createdAt:{type:Date, default:Date.now}
})
savedPostsSchema.index({user:1})
export default mongoose.model('savedPosts', savedPostsSchema)