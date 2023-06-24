const express = require("express");
const app = express();

const router = express.Router();

const userController = require("../controllers/users.controller")

var multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/images");
    },
    filename: function (req, file, cb) {
      cb(null, Math.random().toString(36).slice(2, 7) + file.originalname);
    },
  });
const upload = multer({ storage: storage });

const isAuth = require('../middlewares/isAuthMiddleware')

router.post('/register', userController.register);
router.post('/login', userController.login)

router.put("/upload", upload.single("profile"), userController.avatar, (req, res, next) => {
    const file = req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    }
    res.status(200).send(file).end();
});

router.put("/deleteAvatar", userController.deleteAvatar)

router.get('/search/:keyword', userController.searchUsersLikeKeyword);

router.get("/details/:id", isAuth, userController.getDetails)

router.get("/profil/:id", isAuth, userController.getProfil)

router.post("/contact", isAuth, userController.createContact)

router.get("/contact/:id", isAuth, userController.contactExist)
router.get("/mesContacts", isAuth, userController.getMyContacts)
router.delete("/deleteContact/:id", isAuth, userController.deleteContact)

router.get("/allUsers", isAuth, userController.getAllUsers)

router.put("/profil/update",isAuth, userController.updateMyProfile);

router.put("/resetPassword", userController.resetPassword)

router.put("/PIN", isAuth, userController.modifyPIN)
router.get("/myPIN", isAuth, userController.getMyPIN)

router.patch('/lastCoUser', isAuth, userController.updateLastCo)

router.get('/logout', isAuth, userController.logout)


module.exports = router


