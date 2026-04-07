import 'dotenv/config'
import express from 'express'
import {signUpSchema, signInSchema} from "./types.js"
import bcrypt from 'bcrypt'
import prisma from "./db.js"
import jwt from 'jsonwebtoken'
import cors from 'cors'
import admin from 'firebase-admin'
import serviceAccountkey from 'migo-db28a-firebase-adminsdk-fbsvc-942c6061d7.json' assert {type:"json"}
import {getAuth} from 'firebase-admin/auth'

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountkey)
})


const app = express()
const PORT = 3003
app.use(express.json())
app.use(cors())

const formatDataToSend = (user) => {
    const access_token = jwt.sign({id: user._id}, process.env.SECRET_ACCESS_KEY)
    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}

app.post('/signup', async(req, res) => {
    try{
        const result = signUpSchema.safeParse(req.body)

        if(!result.success){
            return res.status(400).json({
                success: false,
                errors: result.error
            })
        }

        const {fullname: fullName, email, password, username} = result.data

        const existingUser = await prisma.user.findFirst({
            where:{
                OR:[
                    {email},
                    {username}
                ]
            }
        })

        if (existingUser){
            return res.status(409).json({
                success: false,
                message:
                    existingUser.email === email
                    ? 'Email already exists'
                    : 'Username already exists'
            })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const profileImgNameList = [
            'Garfield',
            'Tinkerbell',
            'Annie',
            'Loki',
            'Cleo'
        ]

        const profileImgsCollectionsList = [
            'notionists-neutral',
            'adventurer-neutral',
            'fun-emoji'
        ]

        const randomName = profileImgNameList[
            Math.floor(Math.random() * profileImgNameList.length)
        ]

        const randomCollection = profileImgsCollectionsList[
            Math.floor(Math.random() * profileImgsCollectionsList.length)
        ]

        const profile_img = `https://api.dicebear.com/6.x/${randomCollection}/svg?seed=${randomName}`

        const user = await prisma.user.create({
            data:{
                fullName,
                email,
                password: hashPassword,
                username,
                profile_img
            }
        })

        return res.status(201).json({
            success: true,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                profile_img: user.profile_img
            }
        })
    } catch(error){
        return res.status(500).json({
            success: false,
            message: 'something went wrong'
        })
    }
})

app.post('/signin', async(req, res) =>{

    try{
        const result = signInSchema.safeParse(req.body)

        if(!result.success){
            return res.status(400).json({
                success: false,
                errors: result.error.flatten().fieldErrors
            })
        }

        const {email, password} = result.data

        const user = await prisma.user.findUnique({
            where: {email}
        })

        if(!user){
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        if(!user.password){
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET, {expiresIn: '7d'})

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                profile_img: user.profile_img
            }
        })

    } catch(error){
        return res.status(500).json({
            success: false,
            message: 'something went wrong'
        })
    }

})

app.post('/google-auth', async(req, res) => {
    let {acess_token} = req.body

    getAuth().verifyIdToken(acess_token).then(async(decodeUser) => {
        let {email, name, picture} = decodedUser
        picture = picture.replace("s96-c", "s384-c")
        let user = await UserActivation.findOne({"personal_info.email": email}).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth").then((u) => {
            return u || null
        }).catch(error => {
            return res.status(500).json({"error": error.message})
        })

        if(user){
            if(!user.google_auth){
                return res.status(403).json({"error": "This email was signed up without google. Please log in with password to access the account"})
            }
        }else{
            let username = await generateUsername(email)

            user = new user({
                personal_info: {fullname: name, email, profile_img: picture, username},
                google_auth: true
            })

            await user.save().then(u => {
                user = u
            }).ctach(err => {
                return res.status(500).json({"error": err.message})
            })
        }

        return res.status(200).json(formatDataToSend(user))
    }).catch(err => {
        return res.status(500).json({"error": "Failed to authenticate you with google. Try with some other google account"})
    })
})

app.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`)
})