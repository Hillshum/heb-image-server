import { Sequelize } from "sequelize";

const sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'db.sqlite'
})

import { Model, DataTypes } from "sequelize";


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
export { sequelize} 