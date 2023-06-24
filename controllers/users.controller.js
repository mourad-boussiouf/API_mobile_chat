const express = require('express')
const app = express()

/**Import Base de données */
const pool = require('../services/database')

/**Import cryptage mot de passe */
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

var nodemailer = require('nodemailer');

/**
 * const usersController: Requêtes sql
 * Table: users
 * 
 */
const usersController = {
    avatar: async(req, res, next) => {
        try {

            const {pseudo} = req.body

            console.log(req.body)

            const filename = req.file.filename

            const sql = `UPDATE users SET urlAvatar = '${filename}' WHERE pseudo = '${pseudo}'`

            const sqlUpdateUser = await pool.query(sql)

            return res
                .status(200)
                .json({data: "Avatar mis à jour avec succès."})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    deleteAvatar: async(req, res, next) => {
        try {
            const AuthUserId = req.cookies.id

            const sql = `UPDATE users SET urlAvatar = NULL WHERE id = '${AuthUserId}'`

            const sqlUpdateUser = await pool.query(sql)

            return res
                .status(200)
                .json({data: "Avatar mis à jour avec succès."})
                .end()

        }
        catch (error) {
            console.log(error)
        }
    },
    searchUsersLikeKeyword: async (req, res, next) => {
        try {
            const keyword = req.params.keyword;
            const [rows, fields] = await pool.query(`SELECT * FROM users WHERE pseudo LIKE '%${keyword}%' OR mail LIKE '%${keyword}%'`)
            return res
                .status(200)
                .json({data: rows})
                .end()
        } catch (error) {
            console.log(error)
            res.json({status: "Aucunes occurences trouvée en BDD avec le/les mot(s)-clef(s)."})
        }
    }, 

    getAllUsers: async (req, res, next) => {

        try {
            const sql = "SELECT id, firstname, lastname, pseudo, urlAvatar, mail FROM users ORDER BY firstname ASC"

            const [query] = await pool.query(sql)

            return res.status(200)
                .send({data: query})
                .end()
        } catch (error) {
            console.log(error)
            res.json({status: "getAllUsers : erreur durant la connexion"})
        }
    },

    register: async (req, res, next) => {
        try {
           
            const { mail, pseudo, password, firstname, lastname } = req.body

            if (!mail){
                return res
                    .status(400)
                    .json({message: "Veuillez renseigner une adresse e-mail."})
                    .end()
            } else if (!pseudo){
                return res
                    .status(400)
                    .json({message: "Veuillez renseigner un pseudo."})
                    .end()
            } else if (!password){
                return res
                    .status(400)
                    .json({message: "Veuillez renseigner un mot de passe."})
                    .end()
            } else if (!firstname){
                return res
                    .status(400)
                    .json({message: "Veuillez renseigner votre prénom."})
                    .end()
            } else if (!lastname){
                return res
                    .status(400)
                    .json({message: "Veuillez renseigner votre nom."})
                    .end()
            } else {

                if (password.length < 6){
                    return res
                        .status(400)
                        .json({message: "Le mot de passe doit contenir au moins 6 caractères."})
                        .end()
                } else if (pseudo.length < 5){
                    return res
                        .status(400)
                        .json({message: "Votre pseudo doit contenir au moins 5 caractères."})
                } else {

                    const verifEmailExist = "SELECT firstname from users where mail = ?"

                    const [findEmailExist] = await pool.query(verifEmailExist, [mail])

                    if (findEmailExist.length > 0)
                    
                        return res
                            .status(400)
                            .json({message: "L'adresse e-mail est déjà utilisée."})
                            .end()
                    
                    const verifPseudoExist = "SELECT firstname from users where pseudo = ?"

                    const [findVerifPseudo] = await pool.query(verifPseudoExist, [pseudo])

                    if (findVerifPseudo.length > 0)
                    
                        return res
                            .status(400)
                            .json({message: "Le pseudo est déjà utilisé."})
                            .end()
                    
                    const sqlRegister = "INSERT INTO users (mail, pseudo, password, firstname, lastname, id_role) values ( ?, ?, ?, ?, ?, ?)"

                    const hash = await bcrypt.genSalt()
                    const passwordHash = await bcrypt.hash(password, hash)

                    const [query] = await pool.query(sqlRegister, [mail, pseudo, passwordHash, firstname, lastname, "2"])

                    res.status(200)
                        .json({message: "Inscription effectuée, bienvenue."})
                        .end()
                }
                
            }
            
        } catch (error) {
            console.log(error)
            res.json({status: "Register : erreur durant la connexion"})
        }
        
    },

    login: async (req, res, next) => {
        try {

            
            const {mail, password} = req.body

            if (!mail || !password){
                return res
                    .status(400)
                    .json({message: "Veuillez renseigner les champs requis."})
                    .end()
            }

            const verifAuthUser = "SELECT * from users where mail = ?"

            const [findUser] = await pool.query(verifAuthUser, [mail])

            console.log(findUser[0])

            if (findUser[0] === undefined)   
                return res
                    .status(400)
                    .json({message: "Email ou mot de passe incorrect."})
                    .end()

            if (findUser.length > 0){

                const correctPassword = await bcrypt.compare(
                    password,
                    findUser[0].password
                )

                console.log(correctPassword)

                if (!correctPassword){
                    return res
                        .status(401)
                        .json({message: "E-mail ou mot de passe incorrect."})
                } else {
                    const token = jwt.sign({
                        username: findUser[0].firstname,
                        userId: findUser[0].id
                    },
                    'SECRETKEY', {
                        expiresIn: '7d'
                    });

                    //send the token in an HTTP only cookie
                    res.cookie("token", token, {httpOnly: true});
                    res.cookie("id", findUser[0].id, {httpOnly: true});
                    res.cookie("role", findUser[0].id_role, {httpOnly: true})

                    res.status(200).send({message: "Connexion réussie.", token: token, user: findUser[0]})
                }
            } else {
                return res.status(400).json({message: "Email ou mot de passe incorrect."})
            }

        } catch (error) {
            console.log("Login" + error)
        }
    }, 

    logout: async (req, res) => {
        res.clearCookie("token")
        res.clearCookie("id")
        res.clearCookie("role")
        return res.status(200).send({message: "Déconnexion réussie."}).end()
    },

    getDetails: async (req, res) => {

        try {
        
            const reqToken = req.headers.authorization.split(' ')[1]

            const currentToken = req.cookies.token

            if (reqToken !== currentToken)
                return res
                    .status(400)
                    .send({message: "Token invalide"})
                    .end()
            
            const id_user = req.params.id

            const queryGetDetails = "SELECT * from users WHERE id = ? "

            const [queryResult] = await pool.query(queryGetDetails, id_user)

            if(!queryResult[0])
                return res
                    .status(400)
                    .send({message: "Aucun utilisateur trouvé"})
                    .end()

            return res
                .status(200)
                .send({data: queryResult[0]})
                .end()

        } catch (error) {
            console.log(error)
        }
    }, 

    getProfil: async (req, res, next) => {
        try {

            const reqToken = req.headers.authorization.split(' ')[1]

            const currentToken = req.cookies.token

            if (reqToken !== currentToken)
                return res
                    .status(400)
                    .send({message: "Token invalide"})
                    .end()
            
            const AuthUserId = req.cookies.id

            const getMe = "SELECT * from users where id = ?"

            const [query] = await pool.query(getMe, AuthUserId)

            if (!query)
                return res
                    .status(400)
                    .send({message: "Erreur de récupération de profil"})
                    .end()
            
            return res
                .status(200)
                .send({data: query[0]})
                .end

        } catch (error) {
            console.log(error)
        }
    },

    updateLastCo: async (req, res, next) => {

        try {

            let langage = req.body.langage
            
            const sql = `UPDATE users SET last_co = NOW(), langage = "${langage}" WHERE id = ${req.cookies.id}` 

            const updateSql = await pool.query(sql)

            if (updateSql[0].affectedRows === 1)
                return res
                    .status(200)
                    .json({message: "Connexion réussie"})
                    .end()
            else
                return res
                    .status(400)
                    .json({message: "Erreur lors de la connexion"})
                    .end()
            
        } catch (error) {
            console.log(error)
        }
    },

    updateMyProfile: async (req, res, next) => {
        try {

            console.log(req.body)
    
            const actualUserId = req.cookies.id;
            
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

    getMyContacts: async (req, res, next) => {

        try {
            
            const actualUserId = req.cookies.id;

            const sql = "SELECT users.id, users.urlAvatar, users.pseudo, users.firstname, users.lastname FROM contacts INNER JOIN users ON contacts.id_friend = users.id WHERE contacts.id_user = ?"

            const query = await pool.query(sql, actualUserId)

            if (!query)
            return res
                .status(400)
                .send({message: "Erreur de récupération de profil"})
                .end()
        
            return res
                .status(200)
                .send({data: query[0]})
                .end

        } catch (error) {
            console.log(error)
        }
    },

    contactExist: async (req, res, next) => {
        try {
            const actualUserId = req.cookies.id;

            const id_user = req.params.id

            const sql = `SELECT * FROM contacts WHERE id_user = ${actualUserId} AND id_friend = ${id_user}`

            const [query] = await pool.query(sql)

            return res.status(200)
                .send({data: query})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    createContact: async (req, res, next) => {
        try {

            const actualUserId = req.cookies.id;

            const otherId = req.body.id_other

            const sql = 'INSERT INTO contacts (id_user, id_friend, status) values (?,?,?) , (?,?,?)'

            const [query] = await pool.query(sql, [actualUserId, otherId, 1, otherId, actualUserId, 1])

            return res.status(200)
                .send({data: query})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    deleteContact: async (req, res, next) => {
        try {
            let currentId = req.cookies.id

            let id_other = req.params.id

            const sql = `DELETE FROM contacts WHERE id_user = ${currentId} AND id_friend = ${id_other}`
            const sql2 = `DELETE FROM contacts WHERE id_user = ${id_other} AND id_friend = ${currentId}`

            const [query] = await pool.query(sql)
            const [query2] = await pool.query(sql2)

            return res.status(200)
                .send({data: query})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    modifyPIN: async (req, res, next) => {
        try {

            console.log(req.body)

            const currentId = req.cookies.id

            const codePIN = req.body.codePIN

            console.log(codePIN)

            const sql = `UPDATE users SET PIN = '${codePIN}' WHERE id = ${currentId}`

            const [query] = await pool.query(sql)

            return res.status(200)
                .send({message: "Votre code PIN a été mis à jour."})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    getMyPIN: async (req, res, next) => {
        try {

            const currentId = req.cookies.id

            const sql = `SELECT PIN FROM users WHERE id = ${currentId}`

            const [query] = await pool.query(sql)

            return res.status(200)
                .send({data: query[0]})
                .end()

        } catch (error) {
            console.log(error)
        }
    },

    resetPassword: async (req, res, next) => {
        try {
            console.log(req.body)

            const email = req.body.email

            const sql = `SELECT * FROM users WHERE mail = '${email}'`

            const [query] = await pool.query(sql)

            if (query.length === 0){
                return res
                    .status(400)
                    .send({message: "Aucun utilisateur trouvé pour cette adresse mail."})
                    .end()
            } else {

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                      user: 'openspeechcontact@gmail.com',
                      pass: 'poqquxjwqbhltpig'
                    }
                });

                let newPassword = Math.random().toString(36).slice(-10)

                console.log(newPassword)

                const hash = await bcrypt.genSalt()

                const passwordHash = await bcrypt.hash(newPassword, hash)

                var mailOptions = {
                    from: 'openspeechcontact@gmail.com',
                    to: query[0].mail,
                    subject: 'Réinitialisation de votre mot de passe',
                    html: `
                        <h1>OpenSpeech</h1>
                        <h3>Vous avez demandé la réinitialisation de votre mot de passe.</h3>
                        <p>Voici votre nouveau mot de passe : <strong>${newPassword}</strong></p>
                        <p>Vous pouvez le modifier dans votre profil.</p>
                    `
                };

                let updatePassword = `UPDATE users SET password = '${passwordHash}' WHERE mail = '${email}'`

                let [queryUpdatePassword] = await pool.query(updatePassword)


                console.log(queryUpdatePassword)
                if (queryUpdatePassword.affectedRows === 0){
                    return res
                        .status(400)
                        .send({message: "Erreur lors de la réinitialisation du mot de passe."})
                        .end()
                } else {
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                        console.log(error);
                        } else {
                        console.log('Email sent: ' + info.response);
                        return res.status(200)
                            .send({message: "Un mail vous a été envoyé pour réinitialiser votre mot de passe."})
                            .end()
                        }
                    });
                }

                
                
            }
            
        } catch (error) {
            console.log(error)
        }
    }
}




module.exports = usersController