import express from 'express'
import { readImages, uploadImage, getImage } from "./api";

const app = express();

const promiseWrapper = (handler : (req: express.Request, res: express.Response)=> Promise<any>) => {
    return (req: express.Request, res: express.Response, next:any ) => {
       handler(req, res).catch(next) 
    }
}

app.use(express.json());

app.get('/actualImage/:id', promiseWrapper(getImage));
app.post('/image', promiseWrapper(uploadImage))

app.get('/images', promiseWrapper(readImages))

const port =process.env.PORT || 4040 
app.listen(port, ()=> {
    console.log(`server started listening on ${port}`)
});