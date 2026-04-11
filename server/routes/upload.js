import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import crypto from "crypto"
import { s3 } from "../config/r2.js"
import express from "express"

const router = express.Router()

router.get("/get-upload-url", async (req, res) => {
  try {
    const imageName = `${crypto.randomUUID()}.jpg`

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: imageName,
      ContentType: "image/jpeg",
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 60 })

    res.json({
      uploadURL: url,
      imageURL: `https://${process.env.R2_BUCKET}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${imageName}`
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Failed to generate upload URL" })
  }
})

export default router