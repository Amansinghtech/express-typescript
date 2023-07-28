import mongoose, { Schema, Document, ObjectId } from 'mongoose'
export interface posts extends Document{
    id:string
    user:ObjectId
    caption:string
    tags:string[]
    createdOn:Date
    lastEdited:Date
  originalPosts:ObjectId
}
const postsSchema = new Schema({
    id:{ type: String, unique: true, required: true},
    user:{type:Schema.Types.ObjectId, ref: 'users',required: true},
    caption:{type:String,required:true},
    tags:{type:[String],default:null},
    createdOn:{type:Date,default:Date.now,required:true},
    lastEdited:{type:Date,default:null},
    originalPosts:{type:Schema.Types.ObjectId,ref:'posts'}
})
postsSchema.index({ user: 1 })
postsSchema.index({ createdOn: 1 })
export default mongoose.model<posts>('posts',postsSchema)