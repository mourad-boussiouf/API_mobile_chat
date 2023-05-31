const express = require("express");
const app = express();

const router = express.Router();

const userController = require("../controllers/users.controller")

var multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, Math.random().toString(36).slice(2, 7) + file.originalname);
    },
  });
const upload = multer({ storage: storage });

const isAuth = require('../middlewares/isAuthMiddleware')

router.post('/register', userController.register);
router.post('/login', userController.login)

router.post("/upload", upload.single("profile"), userController.test, (req, res, next) => {
    const file = req.file;
    console.log(req.body)
    console.log(file)
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    }
    res.status(200).send(file).end();
  });

router.get('/search/:keyword', userController.searchUsersLikeKeyword);

router.get("/list", isAuth, userController.getAll)
router.get("/details/:id", isAuth, userController.getDetails)
router.get("/profil/:id", isAuth, userController.getProfil)

router.put("/profil/update",isAuth, userController.updateMyProfile);
router.patch('/lastCoUser', isAuth, userController.updateLastCo);
router.patch('/languageUser', isAuth, userController.updateLastCo);


module.exports = router


