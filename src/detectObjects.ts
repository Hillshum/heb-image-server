import  axios from "axios";

import { DetectedObject } from "./db";
const API_BASE = 'https://api.imagga.com/v2/tags?image_url='

const API_AUTH_HEADER = 'Basic YWNjXzQwNjkwYmNmZmQwN2Y4MjpmOTUzZjk2MzA0YTdlMGJkZjRiYmYyM2IzYWIzM2U4Mg=='

const MIN_CONFIDENCE = 90;

interface Tag {
    en: string;
}

interface APIObject {
    confidence: number;
    tag: Tag;
}

const detectImageUrl = async (url: string) => {
    const resp = await axios.get(API_BASE + url, {
        headers: {
            Authorization: API_AUTH_HEADER
        }
    })
    const tags: APIObject[] = resp.data.result.tags;
    console.log(tags);
    const importantTags = tags.filter(tag => tag.confidence > MIN_CONFIDENCE)

    return await processObjects(importantTags);
}

const processObjects = async (objects: APIObject[]) => {
    const records = await Promise.all(objects.map(async object => {
        return await DetectedObject.findOrCreate({where: {name: object.tag.en}})
    }))

    return records.map(([ob])=> ob);
}


export { detectImageUrl }