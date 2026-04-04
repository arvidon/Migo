import express from 'express'
import {signUpSchema, signInSchema} from "./types"
import bcrypt from 'bcrypt'
import prisma from "./db"
import jwt from 'jsonwebtoken'


const app = express()
const PORT = 3003
app.use(express.json())

app.post('/signup', async(req, res) => {
    try{
        const result = signUpSchema.safeParse(req.body)

        if(!result.success){
            return res.status(400).json({
                success: false,
                errors: result.error
            })
        }

        const {fullname, email, password, username} = result.data

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
                fullname,
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
                fullname: user.fullname,
                email: user.email,
                username: user.username,
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
                fullname: user.fullname,
                email: user.email,
                username: user.username,
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

app.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`)
})