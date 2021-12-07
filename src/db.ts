import { Optional, Sequelize, ModelDefined } from "sequelize";

const sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'db.sqlite'
})

import { Model, DataTypes } from "sequelize";

interface ImageAttributes {
    contents: Blob;
    id: number;
    label: string;
}

interface ImageCreationAttributes extends Optional<ImageAttributes, 'id' |'label'>  {};

const Image: ModelDefined<ImageAttributes, ImageCreationAttributes> =
sequelize.define('image', {
    contents: {
        type: DataTypes.BLOB,
    },
    label: {
        type: DataTypes.TEXT,
    }
})



sequelize.define('object', {
    name: DataTypes.STRING,
})

sequelize.models.image.belongsToMany(sequelize.models.object, {through: 'objects_in_images'})
sequelize.models.object.belongsToMany(sequelize.models.image, {through: 'objects_in_images'})

sequelize.sync()
export { sequelize, Image} 