const express = require("express")
const app = express()

const router = express.Router()

const conversationsController = require("../controllers/conversations.controller")

router.post('/manage', conversationsController.manageConversations)
router.get('/mine', conversationsController.getMyConversations)

router.get('/general', conversationsController.getMessages)
router.get('/randomGeneral', conversationsController.getRandomMessages)
router.post('/general', conversationsController.postMessageGeneral)
router.delete('/general/:id', conversationsController.deleteMessageGeneral)

router.get('/:id', conversationsController.getIndividualConversation)






module.exports = router