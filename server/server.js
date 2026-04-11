import 'dotenv/config'
import express from 'express'
import {signUpSchema, signInSchema} from "./types.js"
import bcrypt from 'bcrypt'
import prisma from "./db.js"
import jwt from 'jsonwebtoken'
import cors from 'cors'
import admin from 'firebase-admin'
import serviceAccountkey from './migo-db28a-firebase-adminsdk-fbsvc-942c6061d7.json' with {type:"json"}
import {getAuth} from 'firebase-admin/auth'
import uploadRoutes from "./routes/upload.js"



admin.initializeApp({
    credential: admin.credential.cert(serviceAccountkey)
})


const app = express()
const PORT = 3003
app.use(express.json())
app.use(cors())
app.use(uploadRoutes)

const formatDataToSend = (user) => {
    const access_token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username
        },
        process.env.JWT_SECRET
    )

    return {
        access_token,
        profile_img: user.profile_img,
        username: user.username,
        fullname: user.fullName,
        email: user.email
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
            access_token: token,
            profile_img: user.profile_img,
            username: user.username,
            fullname: user.fullName,
            email: user.email
        })

    } catch(error){
        return res.status(500).json({
            success: false,
            message: 'something went wrong'
        })
    }

})

app.post('/google-auth', async (req, res) => {
    try {
        const { access_token } = req.body

        const decodedUser = await getAuth().verifyIdToken(access_token)

        const { email, name, picture } = decodedUser

        let user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            const username = email.split('@')[0]

            user = await prisma.user.create({
                data: {
                    email,
                    fullName: name,
                    username,
                    profile_img: picture,
                    password: null
                }
            })
        }

        return res.status(200).json(formatDataToSend(user))

    } catch (err) {
        console.log(err)

        return res.status(500).json({
            success: false,
            message: 'Google authentication failed'
        })
    }
})

app.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`)
})