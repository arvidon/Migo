import express from express

const app = express()
const PORT = 3003
app.use(express.json())

app.post('/signin', (req, res) =>{
    res.json(req.body)
})

app.listen(PORT, () => {
    console.log(`server is listening on ${PORT}`)
})