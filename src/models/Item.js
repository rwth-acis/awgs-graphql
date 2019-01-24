import {Sequelize, DataTypes} from 'sequelize';
import ItemType from './ItemType.js';

export default class Item extends Sequelize.Model {

  static init(sequelize) {
    super.init({
        id: {
          field: 'ID',
          type: DataTypes.STRING,
          primaryKey: true
        },
        name: {
          field: 'NAME',
          type: DataTypes.STRING
        },
        description: {
          field: 'DESCRIPTION',
          type: DataTypes.STRING
        },
        url: {
          field: 'URL',
          type: DataTypes.STRING
        },
        type: {
          field: 'TYPE',
          type: DataTypes.INTEGER
        },
        owner: {
          field: 'OWNER',
          type: DataTypes.STRING
        },
        lastupdate: {
          field: 'LASTUPDATE',
          type: DataTypes.DATE
        }
    }, {tableName: 'ITEM', sequelize})
  }

  static associate() {
    this.belongsTo(ItemType, {foreignKey: 'type'});
  }

}
