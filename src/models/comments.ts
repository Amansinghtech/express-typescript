import mongoose, { Schema, Document, ObjectId } from 'mongoose'
export interface comments extends Document{
    commentedBy:ObjectId
    post:ObjectId
    createdOn:Date
    editedOn:Date
    visibility:boolean
    comment:Date
    tags:string[]
}
const commentsSchema = new Schema<comments>({ 
    commentedBy: { type:Schema.Types.ObjectId, ref: 'user'} ,
    post: { type:Schema.Types.ObjectId, ref: 'user'},
    createdOn:{ type:Date,default:Date.now},
    editedOn:{ type:Date,default:null},
    visibility:{type:Boolean,default:true},
    comment:{ type:Date,default:null},
    tags:{type:[String],default:[]}
    
})
commentsSchema.index({ user: 1 })
export default mongoose.model<comments>('comments', commentsSchema)