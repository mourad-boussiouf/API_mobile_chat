const express = require("express")
const app = express()

const router = express.Router()

const adminController = require('../controllers/admin.controller')

const isAuthAdmin = require('../middlewares/isAuthAdminMiddleware')

router.get('/users', adminController.getUsers)
router.delete('/deleteUser/:id', adminController.deleteUser)
router.patch('/updateUser/:id', adminController.updateUser)

router.get('/general', adminController.getMessagesGeneral)

router.delete('/deleteGeneral/:id', adminController.deleteMessageGeneral)
router.patch('/updateGeneral/:id', adminController.updateMessageGeneral)

router.get('/conversations', adminController.getAllConversations)
router.get('/conversationMessages/:id', adminController.getAllConversationMessage)
router.delete('/deleteMessage/:id', adminController.deleteMessage)

router.get('/contacts', adminController.getAllContacts)
router.delete('/deleteContact/:id', adminController.deleteContact)

router.get('/invitations', adminController.getAllInvitations)
router.delete('/deleteInvitation/:id', adminController.deleteInvitation)

router.delete('/message/:id', isAuthAdmin, adminController.deleteMessage)

router.patch("/user/:id", isAuthAdmin, adminController.updateUser)

router.delete("/user/:id", isAuthAdmin, adminController.deleteUser)


module.exports = router