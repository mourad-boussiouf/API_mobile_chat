const express = require('express')
const app = express()

/**Import Base de données */
const pool = require('../services/database')

/**Import cryptage mot de passe */
const bcrypt = require("bcryptjs");

const adminController = {

    deleteMessage: async (req, res, next) => {

        try {

            const id_message = req.params.id

            const sql = "DELETE FROM messages WHERE id = ?"

            const [deleteMessage] = await pool.query(sql, id_message)

            return res
                .status(200)
                .json({message: "Message supprimé avec succés"})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    updateUser: async (req, res, next) => {
        try {

            var id_user = req.params.id

            var array = req.body

            var newArray = []

            for (const [key, value] of Object.entries(array)) {

                if (key === "password"){
                    if (key.length < 5){
                        return res 
                            .status(400)
                            .json({message: "Le mot de passe doit contenir au moins 5 caractères."})
                    } else {
                        const salt = await bcrypt.genSalt()
                        const passwordHash = await bcrypt.hash(req.body.password, salt)

                        newArray.push(` ${key} = '${passwordHash}' `)
                    }
                } else {
                    newArray.push(` ${key} = '${value}' `)
                }
            }

            if (newArray.length === 0)
                return

            const sql = `UPDATE users SET ${newArray} WHERE id = '${id_user}'`

            const sqlUpdateUser = await pool.query(sql)

            return res
                .status(400)
                .json({message: "Utilisateur mis à jour"})
                .end

        } catch (error) {
            console.log(error)
        }
    },

    deleteUser: async (req, res, next) => {
        try {

            var id_user = req.params.id

            var sql = "DELETE FROM users WHERE id = ? "

            var [sqlDeleteUser] = await pool.query(sql, id_user)

            console.log(sqlDeleteUser)

            return res
                .status(200)
                .json({message: "utilisateur supprimé avec succés"})
                .end()

        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = adminController