import express from "express";
import { Op } from "sequelize";
import { Image, DetectedObject } from "./db";
import {Blob}  from 'buffer'
import axios from 'axios';
import { detectImageUrl, detectImageBlob } from "./detectObjects";


interface UploadParams {
    url?: string;
    imageBody?: string;
    detectObjects?: boolean;
    label?: string;
}

const uploadImage = async (req: express.Request<{}, {}, UploadParams>, res: express.Response) => {
    let image: string; 
    if (req.body.url) {
        // fetch image
        try {

            const resp = await axios.get(req.body.url, {responseType: 'arraybuffer'})
            image = resp.data.toString('base64');
        } catch (e) {
            // TODO: Improve this
            console.error(e);
            return res.sendStatus(400);
        }
    } else if (req.body.imageBody) {
        // process image
        image = req.body.imageBody
    } else {
        res.sendStatus(400);
        return;
    }

    let detected: DetectedObject[] = [];
    if (req.body.detectObjects) {
        if (req.body.url) {
            detected =  await detectImageUrl(req.body.url)
        } else if (req.body.imageBody) {
            detected = await detectImageBlob(req.body.imageBody);
        }

    }
    
    const imageRecord = await Image.create({contents: image,  label: req.body.label})
   
    await imageRecord.setObjects(detected)

    const resp = {
        id: imageRecord.id,
        label: imageRecord.label,
        path: `/actualImage/${imageRecord.id}`,
        objects: detected.map(d => d.name),
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
        const objects = image.objects || await image.getObjects() ;
        return {
            label: image.label,
            id: image.id,
            path: `/actualImage/${image.id}`,
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
        id: image.id,
        label: image.label,
        objects: objects.map(ob => ob.name),
        path: `/actualImage/${image.id}`
    }

    return res.send(response)
}

const getImage = async (req: express.Request, res: express.Response) => {
    const image = await Image.findByPk(req.params.id);
    if (!image) {
        return res.sendStatus(404);
    }

    const contents = image.get().contents;
    const buff = Buffer.from(contents, 'base64')
    res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': buff.byteLength,
    })
    return res.end(buff);
}

export {uploadImage, readImages, getImageMetadata, getImage}

