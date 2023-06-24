const express = require('express')
const app = express()

/**Import Base de données */
const pool = require('../services/database')

const conversationsController = {

    manageConversations: async (req, res, next) => {
        try {

            if (!req.body.id_participant)
                return res
                    .status(400)
                    .json({message: "Aucun utilisateur selectionné"})
                    .end()
            
            if (!req.cookies.id)
                return res
                    .status(400)
                    .json({message: "Aucun utilisateur authentifié"})

            const otherParticipantId = req.body.id_participant

            var verifExistUser = "SELECT * FROM users WHERE id = ?"

            var [ExecVerifExistUser] = await pool.query(verifExistUser, otherParticipantId)

            if (ExecVerifExistUser.length === 0)
                return res  
                    .status(400)
                    .json({message: "Utilisateur introuvable"})
                    .end()
            
            var getChatOtherParticipant = 'SELECT * FROM participants WHERE user_id = ?'

            var [ExecGetChatOtherParticipant] = await pool.query(getChatOtherParticipant, otherParticipantId)

            const authUserId = req.cookies.id

            var getChatAuthUser = 'SELECT * FROM participants WHERE user_id = ?'

            var [ExecGetChatAuthUser] = await pool.query(getChatAuthUser, authUserId)

            var isExist = false
            var idChat = 0

            ExecGetChatAuthUser.map((item) => {

                let verifyExistantChat = ExecGetChatOtherParticipant.some(participant => participant.conversations_id == item.conversations_id);

                if (verifyExistantChat){
                    isExist = true
                    idChat = item.conversations_id
                } 
            })


            /* Conversation Existante */
            if (isExist === true){

                if (!req.body.message)
                    return res
                        .status(400)
                        .json({message: "Veuillez insérer un message"})
                        .end()

                const message = req.body.message

                if (message.length < 1)
                    return res
                        .status(400)
                        .json({message: "Veuillez insérer un message"})
                        .end()

                /* AJOUT D'UN NOUVEAU MESSAGE */
                var insertMessage = "INSERT INTO messages (content, user_id, conversation_id) values (?, ?, ?)"

                const [ExecInsertMessage] = await pool.query(insertMessage, [message, authUserId, idChat])

                if (ExecInsertMessage.warningStatus !== 0)
                    return res
                        .status(400)
                        .json({message: "Erreur durant le traitement"})
                        .end()

                /* UPDATE CONVERSATIONS APRES ENVOI D'UN NOUVEAU MESSAGE  */
                var insertMessageId = ExecInsertMessage.insertId

                var updateConvLastMessage = "UPDATE conversations SET last_message_id = ? WHERE id = ?"

                const [ExecUpdateConvLastMessage] = await pool.query(updateConvLastMessage, [insertMessageId, idChat])

                if (ExecUpdateConvLastMessage.changedRows == 0)
                    return res
                        .status(400)
                        .json({message: "Erreur durant le traitement"})
                        .end()
                 
                if (ExecUpdateConvLastMessage.warningStatus !== 0)
                    return res
                        .status(400)
                        .json({message: "Erreur durant le traitement"})
                        .end()

                return res.status(200).send({message: "Message envoyé"}).end()

            }

            /* Nouvelle Conversation */
            if (isExist === false){

                if (!req.body.message)
                    return res
                        .status(400)
                        .json({message: "Veuillez insérer un message"})
                        .end()

                const message = req.body.message

                if (message.length < 1)
                    return res
                        .status(400)
                        .json({message: "Veuillez insérer un message"})
                        .end()

                var createNewConversation = "INSERT INTO conversations (last_message_id) values (NULL)"

                const [ExecCreateNewConversation] = await pool.query(createNewConversation)

                if (ExecCreateNewConversation.warningStatus !== 0)
                    return res
                        .status(400)
                        .json({message: "Erreur durant le traitement"})
                        .end()

                const newConversationId = ExecCreateNewConversation.insertId

                var createNewParticipants = "INSERT INTO participants (user_id, conversations_id) values (?,?) , (?,?)"

                const [ExecCreateNewParticipants] = await pool.query(createNewParticipants, [authUserId, newConversationId, otherParticipantId, newConversationId])

                if (ExecCreateNewParticipants.warningStatus !== 0)
                    return res
                        .status(400)
                        .json({message: "Erreur durant le traitement"})
                        .end()
                
                var createNewMessage = "INSERT INTO messages (content, user_id, conversation_id, isGeneral) values (?, ?, ?, ?)"

                const [ExecCreateNewMessage] = await pool.query(createNewMessage, [message, authUserId, newConversationId, "0"])

                if (ExecCreateNewMessage.warningStatus !== 0)
                    return res
                        .status(400)
                        .json({message: "Erreur durant le traitement"})
                        .end()

                const newMessageId = ExecCreateNewMessage.insertId

                var updateConversationLastMessage = "UPDATE conversations SET last_message_id = ? WHERE id = ?"

                const [ExecUpdateConversationLastMessage] = await pool.query(updateConversationLastMessage, [newMessageId, newConversationId])

                if (ExecUpdateConversationLastMessage.warningStatus !== 0)
                    return res
                        .status(400)
                        .json({message: "Erreur durant le traitement"})
                        .end()

                return res.status(200).json({message: "Conversation créée"})

            }
        } catch (error) {
            console.log(error)
        }
    },


    getMyConversations: async (req, res, next) => {
        try {

            const id = req.cookies.id

            const sql = 
            `SELECT
			    conversations.id as conversation_id,
                auth_user.message_read_at < messages.created_at AS has_unread_messages,
                (SELECT COUNT(*) FROM messages as m WHERE m.conversation_id = conversations.id AND m.created_at > auth_user.message_read_at) as notifications,
                messages.id as message_id,
                messages.content,
                messages.created_at as last_send_date,
                messages.user_id = ${id} AS mine,
                other_users.id,
                other_users.pseudo,
                other_users.urlAvatar
            FROM conversations
            INNER JOIN messages ON conversations.last_message_id = messages.id
            INNER JOIN participants other_participants
                ON other_participants.conversations_id = conversations.id
                    AND other_participants.user_id != ${id}
            INNER JOIN users other_users ON other_participants.user_id = other_users.id
            INNER JOIN participants auth_user
                ON auth_user.conversations_id = conversations.id
                    AND auth_user.user_id = ${id}
            ORDER BY messages.created_at DESC`

            const [ExecQuery] = await pool.query(sql)

            return res.status(200)
                .json({data: ExecQuery})
                .end()
        } catch (error) {
            console.log("GetConversation" + error)
        }
    },

    getIndividualConversation: async (req, res, next) => {
        try {
            const idConv = req.params.id

            const getIndivConv = "SELECT * FROM conversations as c INNER JOIN messages as m ON c.id = m.conversation_id WHERE conversation_id = ? ORDER BY created_at DESC"

            const [ExecGetIndivConv] = await pool.query(getIndivConv, idConv)

            return res
                .status(200)
                .json({data: ExecGetIndivConv})
                .end()
        } catch (error) {
            console.log("conv indiv :" + error)
        }
    },

    getMessages: async (req, res, next) => {
        try {

            const sql = "SELECT m.id, m.content, u.pseudo, u.id as id_user, m.created_at FROM messages AS m INNER JOIN users AS u ON m.user_id = u.id WHERE isGeneral = 1 ORDER BY m.created_at DESC"

            const [messages] = await pool.query(sql)

            return res
                .status(200)
                .json({data: messages})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    getRandomMessages : async (req, res, next) => {
        try {
            const sql = "SELECT m.id, m.content, u.pseudo, u.id as id_user, m.created_at FROM messages AS m INNER JOIN users AS u ON m.user_id = u.id WHERE isGeneral = 1 LIMIT 3"

            const [messages] = await pool.query(sql)

            return res
                .status(200)
                .json({data: messages})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    postMessageGeneral: async (req, res, next) => {
        try {

            if (!req.cookies.id)
                return res
                    .status(400)
                    .json({message: "Aucun utilisateur authentifié"})

            let currentID = req.cookies.id

            if (!req.body.message)
                return res
                    .status(400)
                    .json({message: "Veuillez insérer un message"})

            let message = req.body.message

            var createNewMessage = "INSERT INTO messages (content, user_id, conversation_id, isGeneral) values (?, ?, ?, ?)"

            const [ExecCreateNewMessage] = await pool.query(createNewMessage, [message, currentID, "0", "1"])

            if (ExecCreateNewMessage.warningStatus !== 0)
                return res
                    .status(400)
                    .json({message: "Erreur durant le traitement"})
                    .end()

            return res.status(200).send({message: "Message envoyé avec succés"}).end()
        } catch (error) {
            console.log(error)
        }
    },

    deleteMessageGeneral: async (req, res, next) => {
        try {
            let idMessage = req.params.id

            let sql = "DELETE FROM messages WHERE id = ?"

            const [ExecDeleteMessage] = await pool.query(sql, idMessage)

            if (ExecDeleteMessage.warningStatus !== 0)
                return res
                    .status(400)
                    .json({message: "Erreur durant le traitement"})
                    .end()
            
            return res.status(200).json({message: "Message supprimé avec succés"}).end()
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = conversationsController