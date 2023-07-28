import mongoose, { Schema, Document, ObjectId } from 'mongoose'

export interface FollowRequest extends Document {
    followedUser: ObjectId
    createdOn:Date
    accepted:Boolean
    unfollowed:Boolean
    followedBy:String[]
}

const FollowRequestSchema = new Schema<FollowRequest>({
    followedUser: {type: Schema.Types.ObjectId, ref: 'user'},
    createdOn: {type: Date, default: Date.now},
    accepted: { type: Boolean,default: true  },
    unfollowed: { type: Boolean ,default: true  },
    followedBy: { type: [String], default: [] },

})

FollowRequestSchema.index({ followedUser: 1 })

export default mongoose.model<FollowRequest>('FollowRequest', FollowRequestSchema)
