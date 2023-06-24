const express = require('express')
const app = express()

/**Import Base de données */
const pool = require('../services/database')

const invitationsController = {

    createInvitation: async (req, res, next) => {

        try {

            const queryCurrentUserId = req.body.id_sender

            const currentUserId = req.cookies.id;

            const id_receveur = req.body.id_receveur

            const message = req.body.message


            if (!queryCurrentUserId || !currentUserId || !id_receveur)
                return res  
                    .status(400)
                    .send({message: "Une erreur est survenue"})
                    .end()
            
            if (parseInt(queryCurrentUserId) !== parseInt(currentUserId))
                return res
                    .status(400)
                    .send({message: "Erreur : Id différents"})
                    .end()
            
            if (!message)
                return res
                    .status(400)
                    .send({message: 'Erreur : Pas de message'})
                    .end()

            const sql = 'INSERT INTO invitations (id_sender, id_receveur, status, message) VALUES (?, ?, ?, ?)'

            const [execSql] = await pool.query(sql, [queryCurrentUserId, id_receveur, 0, message])

            if (execSql.warningStatus !== 0)
                return res
                    .status(400)
                    .json({message: "Erreur durant la traitement"})
                    .end()

            return res.status(200).send({message: "Invitation envoyée"}).end()

        } catch (error) {
            console.log(error)
        }
    },

    invitationExist: async (req, res, next) => {

        try {

            const actualUserId = req.cookies.id;

            const id_user = req.params.id

            const sql = `SELECT * FROM invitations WHERE id_sender = ${actualUserId} AND id_receveur = ${id_user}`

            const [query] = await pool.query(sql)

            return res.status(200)
                .send({data: query})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    getSendInvitations: async (req, res, next) => {
        try {
            const actualUserId = req.cookies.id

            const sql = `SELECT *, invitations.created_at as createdAt FROM invitations INNER JOIN users ON invitations.id_receveur = users.id WHERE id_sender = ${actualUserId}`

            const [query] = await pool.query(sql)

            return res.status(200)
                .send({data: query})
                .end()
                
        } catch (error) {
            console.log(error)
        }
    },

    getReceiveInvitations: async (req, res, next) => {
        try {
            const actualUserId = req.cookies.id

            const sql = `SELECT *, invitations.created_at as createdAt FROM invitations INNER JOIN users ON invitations.id_sender = users.id WHERE id_receveur = ${actualUserId}`

            const [query] = await pool.query(sql)

            return res.status(200)
                .send({data: query})
                .end()
                
        } catch (error) {
            console.log(error)
        }
    },

    deleteInvitation: async (req, res, next) => {
        try {

            const idInvitations = req.params.id

            const sql = "DELETE FROM invitations WHERE id_invitation = ?"

            const [deleteInv] = await pool.query(sql, idInvitations)

            return res
                .status(200)
                .json({message: "Invitation supprimée avec succés"})
                .end()

        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = invitationsController