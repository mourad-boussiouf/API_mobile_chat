const express = require('express')
const app = express()

/**Import Base de données */
const pool = require('../services/database')

const messageController = {
    getChatGeneral: async (req, res, next) => {
        try {
            const getChatGeneral = "SELECT * FROM messages WHERE isGeneral = 1"

            const [sqlGetChatGeneral] = await pool.query(getChatGeneral)

            return res
                .status(200)
                .json({data: sqlGetChatGeneral})
                .end()
        } catch (error) {
            console.log(error)
        }
    },

    sendChatGeneral: async (req, res, next) => {
        try {

            const {message} = req.body

            const postChatGeneral = "INSERT INTO messages (message, id_user, id_chat, isGeneral) values ( ?, ?, ?, ?)"

            const [sqlPostChatGeneral] = await pool.query(postChatGeneral, [message, req.cookies.id, null, "1"])

            return res
                .status(200)
                .json({message: "Message posté sur le chat général"})
                .end()

        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = messageController