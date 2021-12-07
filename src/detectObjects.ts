import  axios from "axios";
import FormData from 'form-data';
import { DetectedObject } from "./db";
import { API_AUTH_HEADER } from "./credentials";
const API_BASE = 'https://api.imagga.com/v2/tags?image_url='
const API_BASE_UPLOADED = 'https://api.imagga.com/v2/tags?image_upload_id='
const API_UPLOAD_PATH = 'https://api.imagga.com/v2/uploads'


const MIN_CONFIDENCE = 50;

interface Tag {
    en: string;
}

interface APIObject {
    confidence: number;
    tag: Tag;
}

const detectImageInner = async (url: string) => {

    const resp = await axios.get(url, {
        headers: {
            Authorization: API_AUTH_HEADER
        }
    })
    const tags: APIObject[] = resp.data.result.tags;
    const importantTags = tags.filter(tag => tag.confidence > MIN_CONFIDENCE)

    return await processObjects(importantTags);
}

const detectImageUrl = async (url: string) => {
   return await detectImageInner(API_BASE + url) 
}

const uploadImage = async (image: string) => {
    const data = new FormData();
    data.append('image_base64', image);
    

    const resp = await axios.post(API_UPLOAD_PATH, data, {
        headers: {
            ...data.getHeaders(),
            Authorization: API_AUTH_HEADER,
        }
    })
    return resp.data.result.upload_id;
}

const detectImageBlob = async (image: string) => {
    const id = await uploadImage(image);

    console.log(`Id is ${id}`);
    return await detectImageInner(API_BASE_UPLOADED + id)
}

const processObjects = async (objects: APIObject[]) => {
    const records = await Promise.all(objects.map(async object => {
        return await DetectedObject.findOrCreate({where: {name: object.tag.en}})
    }))

    return records.map(([ob])=> ob);
}


export { detectImageUrl, detectImageBlob }