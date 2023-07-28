import mongoose, { Schema, Document, ObjectId } from 'mongoose'
export interface comments extends Document{
    commentedBy:ObjectId
    post:ObjectId
    createdOn:Date
    editedOn:Date
    visibility:boolean
    comment:string
    tags:string[]
}
const commentsSchema = new Schema<comments>({ 
    commentedBy: { type:Schema.Types.ObjectId, ref: 'users',required: true} ,
    post: { type:Schema.Types.ObjectId, ref: 'posts',required:true},
    createdOn:{ type:Date,default:Date.now,required:true},
    editedOn:{ type:Date},
    visibility:{type:Boolean,default:true,required:true},
    comment:{ type:String,required:true},
    tags:{type:[String],default:[]}
    
})
commentsSchema.index({ commentedBy: 1 })
commentsSchema.index({ post: 1 })
export default mongoose.model<comments>('comments', commentsSchema)