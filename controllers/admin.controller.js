const express = require('express')
const app = express()

/**Import Base de données */
const pool = require('../services/database')

/**Import cryptage mot de passe */
const bcrypt = require("bcryptjs");

const adminController = {

    deleteMessage: async (req, res, next) => {

        try {

            // const id_message = req.params.id

            // const sql = "DELETE FROM messages WHERE id = ?"

            // const [deleteMessage] = await pool.query(sql, id_message)

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
    ,

    getUsers: async (req, res, next) => {
        try {

            const sql = "SELECT * FROM users WHERE id_role = 2"

            const [users] = await pool.query(sql)

            return res
                .status(200)
                .json({users})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    getMessagesGeneral: async (req, res, next) => {
        try {

            const sql = "SELECT m.id, m.content, u.pseudo, u.id as id_user, m.created_at FROM messages AS m INNER JOIN users AS u ON m.user_id = u.id WHERE isGeneral = 1"

            const [messages] = await pool.query(sql)

            return res
                .status(200)
                .json({messages})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    getAllContacts: async (req, res, next) => {

        try {
            const sql = "SELECT c.id_contacts, c.id_user, u.pseudo, c.created_at,  (SELECT pseudo FROM users WHERE id = c.id_friend) as ami, (SELECT id FROM users WHERE id = c.id_friend) as idAmi FROM contacts AS c INNER JOIN users AS u ON c.id_user = u.id ORDER BY c.id_user ASC"

            const [contacts] = await pool.query(sql)

            return res
                .status(200)
                .json({contacts})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    getAllInvitations: async (req, res, next) => {
        try {
            const sql = "SELECT i.id_invitation, i.id_sender, u.pseudo, i.status, i.message, i.created_at, (SELECT pseudo FROM users WHERE id = i.id_receveur) as pseudo_invite, (SELECT id FROM users WHERE id = i.id_receveur) as id_invite FROM invitations AS i INNER JOIN users AS u ON i.id_sender = u.id" 

            const [invitations] = await pool.query(sql)

            return res
                .status(200)
                .json({invitations})
                .end()
        } catch (error) {
            console.log(error)
        }
    },

    getAllConversations: async (req, res, next) => {
        try {
            const sql = "SELECT p.conversations_id, GROUP_CONCAT((SELECT GROUP_CONCAT(pseudo) FROM users WHERE id = p.user_id GROUP BY p.conversations_id)) as users, p.message_read_at FROM participants as p GROUP BY conversations_id"

            const [participants] = await pool.query(sql)

            return res
                .status(200)   
                .json({participants})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    getAllConversationMessage: async (req, res, next) => {
        try {

            const sql = `SELECT m.id, m.content, u.pseudo, u.id as id_user, m.created_at FROM messages AS m INNER JOIN users AS u ON m.user_id = u.id WHERE m.conversation_id = ${req.params.id}`

            const [messages] = await pool.query(sql)

            return res
                .status(200)
                .json({messages})
                .end()
        } catch (error) {
            console.log(error)
        }

    },

    deleteContact : async (req, res, next) => {
        try {

            // const id_contact = req.params.id

            // const sql = "DELETE FROM contacts WHERE id_contacts = ?"

            // const [deleteContact] = await pool.query(sql, id_contact)

            return res
                .status(200)
                .json({message: "Contact supprimé avec succés."})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    deleteInvitation: async (req, res, next) => {
        try {

            // const id_invitation = req.params.id

            // const sql = "DELETE FROM invitations WHERE id_invitation = ?"

            // const [deleteInvitation] = await pool.query(sql, id_invitation)

            return res
                .status(200)
                .json({message: "Invitation supprimée avec succés."})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    deleteMessageGeneral: async (req, res, next) => {

        try {

            // const id_message = req.params.id

            // const sql = "DELETE FROM messages WHERE id = ?"

            // const [deleteMessage] = await pool.query(sql, id_message)

            return res
                .status(200)
                .json({message: "Message supprimé avec succés"})
                .end()

        } catch (error) {
            console.log(error)
        }

    },

    updateMessageGeneral: async (req, res, next) => {

        try {
            
            const id_message = req.params.id

            const sql = "UPDATE messages SET content = ? WHERE id = ?"

            const [updateMessage] = await pool.query(sql, [req.body.content, id_message])

            return res
                .status(200)
                .json({message: "Message mis à jour avec succés"})
                .end()
        } catch (error) {
            console.log(error)
        }
    },

    deleteUser: async (req, res, next) => {
        try {

            // const id_user = req.params.id

            // const sql = "DELETE FROM users WHERE id = ?"

            // const [deleteUser] = await pool.query(sql, id_user)

            return res
                .status(200)
                .json({message: "Utilisateur supprimé avec succés"})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    updateUser: async (req, res, next) => {

        try {

            const actualUserId = req.params.id
            console.log(req.body)
    
            
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

            const sql = `UPDATE users SET ${newArray} WHERE id = '${actualUserId}'`

            const sqlUpdateUser = await pool.query(sql)

            return res
                .status(200)
                .send({message: "Vos données ont été mis à jour."})
                .end()
        } catch (error) {
            console.log(error)
            res.json({status: "Erreur"})
        }
    }, 



}

module.exports = adminController