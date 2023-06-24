const express = require("express")
const app = express()

const router = express.Router()

const invitationsController = require('../controllers/invitations.controller')
const isAuth = require("../middlewares/isAuthMiddleware")

router.post('/createInv', invitationsController.createInvitation)

router.get('/invitation/:id', isAuth, invitationsController.invitationExist)

router.get('/invitations/send', isAuth, invitationsController.getSendInvitations)

router.get('/invitations/receive', isAuth, invitationsController.getReceiveInvitations)

router.delete('/invitations/:id', isAuth, invitationsController.deleteInvitation)

module.exports = router