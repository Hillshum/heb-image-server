import { Optional, Sequelize, BelongsToManyGetAssociationsMixin, BelongsToManySetAssociationsMixin } from "sequelize";

import { DB_INFO } from "./credentials";

const sequelize = new Sequelize(DB_INFO.dbName, DB_INFO.username, DB_INFO.password, {
    dialect: 'postgres',
})

import { Model, DataTypes } from "sequelize";

interface ImageAttributes {
    contents: string;
    id: number;
    label: string;
}

interface ImageCreationAttributes extends Optional<ImageAttributes, 'id' |'label'>  {};

class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
    public id!: number;
    public label!: string;
    public contents!: string

     // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getObjects!: BelongsToManyGetAssociationsMixin<DetectedObject>
    public setObjects!: BelongsToManySetAssociationsMixin<DetectedObject, number>
    
    public objects?: DetectedObject[];

}
Image.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    contents: {
        type: DataTypes.TEXT,
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

    public readonly images?: Image[];
}
DetectedObject.init({
    name: {
        type: DataTypes.STRING,
        unique: true,
    }
}, {
    modelName: 'object',
    sequelize
})

sequelize.models.image.belongsToMany(sequelize.models.object, {through: 'objects_in_images'})
sequelize.models.object.belongsToMany(sequelize.models.image, {through: 'objects_in_images'})

sequelize.sync()
export { sequelize, Image, DetectedObject }