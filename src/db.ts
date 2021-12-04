import { Sequelize } from "sequelize";

const sequelize = new Sequelize("sqlite::memory")

import { Model, DataTypes } from "sequelize";

class Image extends Model {}

Image.init({
    contents: {
        type: DataTypes.BLOB,
    },
    label: {
        type: DataTypes.TEXT,
    }
}, {
    sequelize,
    modelName: 'image'
})


class DetectedObject extends Model {}

DetectedObject.init({
    name: DataTypes.STRING,
}, {
    sequelize,
    modelName: 'object'
})

Image.belongsToMany(DetectedObject, {through: 'objects_in_images'})
DetectedObject.belongsToMany(Image, {through: 'objects_in_images'})

export { sequelize} 