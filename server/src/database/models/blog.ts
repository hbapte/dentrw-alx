import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface Blog extends Document {
  title: string
  slug: string
  content: string
  author: mongoose.Types.ObjectId
  category: string
  tags: string[]
  featuredImage?: string
  status: "draft" | "published"
  publishedAt?: Date
  language: "en" | "fr" | "rw"
  views: number
  likes: number
  comments: {
    user: mongoose.Types.ObjectId
    content: string
    createdAt: Date
  }[]
}

const blogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    featuredImage: { type: String },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: { type: Date },
    language: { type: String, enum: ["en", "fr", "rw"], required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        content: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Pre-save hook to generate slug from title
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
  }
  next()
})

const Blog: Model<Blog> = mongoose.model<Blog>("Blog", blogSchema)

export default Blog

