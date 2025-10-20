import mongoose, { Schema } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = Schema(
  {
    videoFile: {
      type: String,
      required: [true, 'Video required']
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail required']
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      required: [true, 'Title required']
    },
    desciption: {
      type: String,
      required: [true, 'Description required']
    },
    duration: {
      type: Number,
      required: [true, 'Duration required']
    },
    views: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    },
  }, {timestamps: true}
);

videoSchema.plugin(aggregatePaginate); //iski help se ab aggregation queries likh saktey hai

export const Video = mongoose.model('Video', videoSchema);