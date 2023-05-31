const express = require('express')
const app = express()

/**Import Base de données */
const pool = require('../services/database')

/**Import cryptage mot de passe */
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

/**
 * const usersController: Requêtes sql
 * Table: users
 * 
 */
const usersController = {
    test: async(req, res, next) => {
        try {
            const {pseudo} = req.body

            const filename = req.file.filename

            const sql = `UPDATE users SET urlAvatar = '${filename}' WHERE pseudo = '${pseudo}'`

            const sqlUpdateUser = await pool.query(sql)

            return res
                .status(200)
                .end()

        } catch (error) {
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
    
    getAll: async (req, res, next) => {

        console.log(req.cookies)
        console.log(req.headers.cookie.split("=")[3])
        console.log(req.user)

        try {

            if (!req.headers.cookie.split("=")[3])
                return res
                    .status(400)
                    .send({message: "Pas de token en headers"})
                    .end()

            const reqToken = req.headers.cookie.split("=")[3]

            if (!req.cookies.token)
                return res
                    .status(400)
                    .send({message: "Pas de token cookies"})

            const currentToken = req.cookies.token

            if (reqToken !== currentToken)
                return res
                    .status(400)
                    .send({message: "Token invalide"})
                    .end()
            
            const [rows] = await pool.query('SELECT firstname, lastname, mail from users')
        
            return res.status(200)
                    .json({message: rows})
                    .end()

        } catch (error) {
            return res.status(400)
                .send({message: "Erreur durant la traitement"})
                .end()
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
                        .json({message: "Votre pseudo doit contenir au moins 5 caractères"})
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
                        .json({message: "Inscription effectué avec succés, bienvenue."})
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

            if (findUser.length > 0){

                const correctPassword = await bcrypt.compare(
                    password,
                    findUser[0].password
                )

                if (!correctPassword){
                    return res
                        .status(401)
                        .json({message: "E-mail ou mot de passe incorrect"})
                } else {
                    const token = jwt.sign({
                        username: findUser[0].firstname,
                        userId: findUser[0].id
                    },
                    'SECRETKEY', {
                        expiresIn: '7d'
                    });

                    //send the token in an HTTP only cookie
                    res.cookie("token", token, {secure:false});
                    res.cookie("id", findUser[0].id, {httpOnly: true , secure:false});
                    res.cookie("role", findUser[0].id_role, {httpOnly: true, secure:false})


                    res.status(200).send({message: "Connexion réussie", token: token, user: findUser[0]})
                }
            } else { 
                return res.status(400).json({message: "Email ou mot de passe incorrect"})
            }

        } catch (error) {
            console.log(error)
        }
    }, 

    logout: async (req, res) => {
        
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
      console.log("COOKIES",req.cookies)
        try {
            const sql = `UPDATE users SET last_co = NOW() WHERE id = ${req.cookies.id}` 

            const updateSql = await pool.query(sql)

            return res
                .status(200)
                .json({message: "Utilisateur mis à jour"})
                .end()
        } catch (error) {
            console.log(error)
        }
    },

    updateLanguage: async (req, res, next) => {
        console.log("COOKIES",req.language)
          try {
              const sql = `UPDATE users SET language = ${req.language} WHERE id = ${req.cookies.id}` 

              const updateSql = await pool.query(sql)
  
              return res
                  .status(200)
                  .json({message: "Utilisateur mis à jour"})
                  .end()
          } catch (error) {
              console.log(error)
          }
      },

    updateMyProfile: async (req, res, next) => {
        console.log("CA MARCHEe PAS",array);
        try {
    
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
                } 
                else if (key === "last_co"){
                    console.log("CA MARCHEe PAS",array);
                    newArray.push(` ${key} = NOW() `)
                }
                else {
                    console.log("CA MARCHEe PAS",array);
                    newArray.push(` ${key} = '${value}' `)
                }
            }
            
            if (newArray.length === 0)
                return

            const sql = `UPDATE users SET ${newArray} WHERE id = '${actualUserId}'`

            const sqlUpdateUser = await pool.query(sql)

            return res
                .status(200)
                .json({message: "Utilisateur mis à jour"})
                .end()
        } catch (error) {
            console.log(error)
            res.json({status: "Erreur"})
        }
    }, 
}




module.exports = usersController