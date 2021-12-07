import express from "express";
import { sequelize } from "./db";
import axios from 'axios';


interface UploadParams {
    url?: string;
    imageBody?: string;
    detectObjects?: boolean;
    label?: string;
}

const uploadImage = async (req: express.Request<{}, {}, UploadParams>, res: express.Response) => {
    let image: Blob;
    if (req.body.url) {
        // fetch image
        try {

            const resp = await axios.get(req.body.url, {responseType: 'blob'})
            image = resp.data;
        } catch (e) {
            // TODO: Improve this
            console.error(e);
            res.sendStatus(400);
        }
    } else if (req.body.imageBody) {
        // process image
        image =  new Blob();
    } else {
        res.sendStatus(400);
        return;
    }
    
    await sequelize.models.image.create({contents: image!, label: req.body.label})


    res.sendStatus(200)
};

export {uploadImage}

