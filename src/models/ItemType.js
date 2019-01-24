import {Sequelize, DataTypes} from 'sequelize';
import Item from './Item.js';

export default class ItemType extends Sequelize.Model {

  static init(sequelize) {
    super.init({
        id: {
          field: 'ID',
          type: DataTypes.INTEGER,
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
    }, {tableName: 'ITEMTYPE', sequelize})
  }

  static associate() {
    this.hasMany(Item, {foreignKey: 'type'});
  }

}
