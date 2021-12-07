import express from "express";
import { sequelize, Image, DetectedObject } from "./db";
import axios from 'axios';
import { detectImageUrl } from "./detectObjects";


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
    // } else if (req.body.imageBody) {
    //     // process image
    //     image =  new Blob();
    } else {
        res.sendStatus(400);
        return;
    }

    let detected: any[] = [];
    if (req.body.detectObjects) {
        detected =  await detectImageUrl(req.body.url)
    }
    
    console.log(detected)
    const imageRecord = await Image.create({contents: image!, label: req.body.label})
   
    await imageRecord.setObjects(detected)


    res.sendStatus(200)
};

const readImages = async (req: express.Request, res: express.Response) => {
    const images = await Image.findAll({include: DetectedObject});
    
    const response = await Promise.all(images.map(async image => {
        return {
            label: image.get().label,
            id: image.get().id,
            objects: (await image.getObjects()).map(ob => ob.name)
        }
    }))

    return res.send(response)
    
}

const getImageMetadata = async (req: express.Request, res: express.Response) => {
    const image = await Image.findByPk(req.params.id, {include: DetectedObject});
    if (!image) {
        return res.sendStatus(404);
    }

    const response = {
        id: image.get().id,
        label: image.get().label,
        objects: (await image.getObjects()).map(ob => ob.name)
    }

    return res.send(response)
}

const getImage = async (req: express.Request, res: express.Response) => {
    const image = await Image.findByPk(req.params.id);
    if (!image) {
        return res.sendStatus(404);
    }

    const contents = image.get().contents;
    res.writeHead(200, {
        'Content-Type': 'image/jpg',
    })
    return res.end(contents);
}

export {uploadImage, readImages, getImageMetadata, getImage}

