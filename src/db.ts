import { Optional, Sequelize, ModelDefined, BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin } from "sequelize";

const sequelize = new Sequelize('heb', 'heb', 'herebetter', {
    dialect: 'postgres',
})

import { Model, DataTypes } from "sequelize";

interface ImageAttributes {
    contents: Blob;
    id: number;
    label: string;
}

interface ImageCreationAttributes extends Optional<ImageAttributes, 'id' |'label'>  {};

class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
    public id!: number;
    public label!: string;
    public contents!: Blob

     // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getObjects!: BelongsToManyGetAssociationsMixin<DetectedObject>
    public setObjects!: BelongsToManySetAssociationsMixin<DetectedObject, number>

}
Image.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    contents: {
        type: DataTypes.BLOB,
    },
    label: {
        type: DataTypes.TEXT,
    }
}, {
    modelName: 'image',
    sequelize,
})


interface ObjectAttributes {
    name: string;
}
class DetectedObject extends Model<ObjectAttributes> implements ObjectAttributes {
    public name!: string;
    public id!: number;
}
DetectedObject.init({
    name: DataTypes.STRING,
}, {
    modelName: 'object',
    sequelize
})

sequelize.models.image.belongsToMany(sequelize.models.object, {through: 'objects_in_images'})
sequelize.models.object.belongsToMany(sequelize.models.image, {through: 'objects_in_images'})

sequelize.sync()
export { sequelize, Image, DetectedObject }