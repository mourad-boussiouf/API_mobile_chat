const express = require("express")
const app = express()

const router = express.Router()

const chatController = require("../controllers/chats.controller")

const messageController = require("../controllers/messages.controller")

router.post('/user/:id', chatController.chatIndividuel)

router.get('/general', messageController.getChatGeneral)
router.post('/general', messageController.sendChatGeneral)



module.exports = router