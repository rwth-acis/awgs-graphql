import {Sequelize, DataTypes} from 'sequelize';

export default class User extends Sequelize.Model {

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
        sub: {
          field: 'SUB',
          type: DataTypes.STRING
        },
        authorization: {
          field: 'AUTHORIZATION',
          type: DataTypes.BOOLEAN
        },
        lastlogin: {
          field: 'LASTLOGIN',
          type: DataTypes.DATE
        }
    }, {tableName: 'USER', sequelize})
  }

}
