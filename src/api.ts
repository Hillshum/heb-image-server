import express from "express";
import { Op } from "sequelize";
import { sequelize, Image, DetectedObject } from "./db";
import axios from 'axios';
import { detectImageUrl, detectImageBlob } from "./detectObjects";


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
            return res.sendStatus(400);
        }
    // } else if (req.body.imageBody) {
    //     // process image
    //     image = Buffer.from(req.body.imageBody, 'base64');
    } else {
        res.sendStatus(400);
        return;
    }

    let detected: DetectedObject[] = [];
    if (req.body.detectObjects) {
        if (req.body.url) {
            detected =  await detectImageUrl(req.body.url)
        } else if (req.body.imageBody) {
            // detected = await detectImageBlob(image!);
        }

    }
    
    console.log(detected)
    const imageRecord = await Image.create({contents: image,  label: req.body.label})
   
    await imageRecord.setObjects(detected)

    const resp = {
        id: imageRecord.id,
        label: imageRecord.label,
        objects: detected.map(d => d.name)
    }

    res.send(resp)
};

const readImages = async (req: express.Request, res: express.Response) => {
    let images: Image[] = [];

    if (req.query.objects) {
        const searchTerms = req.query.objects;
        const terms = String(searchTerms).split(',').map(s=>s.trim())

        const obs = await DetectedObject.findAll({where: {name: {[Op.like]: {[Op.any]:terms}}}, include: (Image)})
        

        images = obs.flatMap(ob => ob.images || [])

    } else {
        images = await Image.findAll({include: DetectedObject});
    }

    
    const response = await Promise.all(images.map(async image => {
        const objects = image.objects || []
        return {
            label: image.get().label,
            id: image.get().id,
            objects: objects.map(ob => ob.name)
        }
    }))

    return res.send(response)
    
}

const getImageMetadata = async (req: express.Request, res: express.Response) => {
    const image = await Image.findByPk(req.params.id, {include: DetectedObject});
    if (!image) {
        return res.sendStatus(404);
    }

    const objects = image.objects || [];
    const response = {
        id: image.get().id,
        label: image.get().label,
        objects: objects.map(ob => ob.name)
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

