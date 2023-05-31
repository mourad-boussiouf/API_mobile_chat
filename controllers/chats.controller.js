const express = require('express')
const app = express()

/**Import Base de données */
const pool = require('../services/database')

const chatController = {

    chatIndividuel: async (req, res, next) => {

        const id_userTo = req.params.id

        var verifExistUser = 'SELECT * FROM users where id = ?'

        var [sqlVerifExistUser] = await pool.query(verifExistUser, id_userTo)

        if (sqlVerifExistUser.length <= 0)
            return res
                .status(400)
                .json({message: "Utilisateur inexistant"})
                .end()

        var getChatTo = 'SELECT * FROM users_chats WHERE id_user = ?'

        var [sqlGetChatTo] = await pool.query(getChatTo, id_userTo)


        const id_userFrom = req.cookies.id

        var getChatFrom = 'SELECT * FROM users_chats WHERE id_user = ?'

        var [sqlGetChatFrom] = await pool.query(getChatFrom, id_userFrom)

        var isExist = false
        var idChat = 0

        sqlGetChatFrom.map((item, index) => {

            let verifyExistantChat = sqlGetChatTo.some(chat => chat.id_chat == item.id_chat);

            if (verifyExistantChat){
                isExist = true
                idChat = item.id_chat
            } 
        })

        if (isExist === true){

            const { message } = req.body

            if (!message)
                return res
                    .status(400)
                    .json({message: "Veuillez insérer un message"})
                    .end()

            if (message.length < 1)
                return res
                    .status(400)
                    .json({message: "Veuillez insérer un message"})
                    .end()

            var insertMessage = "INSERT INTO messages (message, id_user, id_chat, isGeneral) values ( ?, ?, ?, ?)"

            const [sqlInsertInto] = await pool.query(insertMessage, [message, id_userFrom, idChat, "0"])

            return res
                .status(200)
                .json({message: "Message envoyé avec succés"})
                .end()
        } else {
            const { message } = req.body

            if (!message)
                return res
                    .status(400)
                    .json({message: "Veuillez insérer un message"})
                    .end()

            if (message.length < 1)
                return res
                    .status(400)
                    .json({message: "Veuillez insérer un message"})
                    .end()

            var insertChat = "INSERT INTO chats (created_at) VALUES (NOW())"

            const [sqlInsertChat] = await pool.query(insertChat)

            console.log(sqlInsertChat.insertId)

            const idNewChat = sqlInsertChat.insertId

            var insertUserChat = "INSERT INTO users_chats (id_user, id_chat) VALUES (?, ?)"

            const [sqlInsertUserChatTo] = await pool.query(insertUserChat, [id_userTo, idNewChat])

            const [sqlInsertUserChatFrom] = await pool.query(insertUserChat, [id_userFrom, idNewChat])

            var insertMessage = "INSERT INTO messages (message, id_user, id_chat, isGeneral) values ( ?, ?, ?, ?)"

            const [sqlInsertInto] = await pool.query(insertMessage, [message, id_userFrom, idNewChat, "0"])

            res.status(200).json({message: "Création d'un chat et d'un chat user"})
        

        }
    }
}

module.exports = chatController