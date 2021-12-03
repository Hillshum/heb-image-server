import express from 'express'

const app = express();


app.get('/images', (req, res)=> {res.sendStatus(200)})

const port =process.env.PORT || 4040 
app.listen(port, ()=> {
    console.log(`server started listening on ${port}`)
});