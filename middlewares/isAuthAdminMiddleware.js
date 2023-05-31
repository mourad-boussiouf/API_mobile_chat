const isAuthAdmin = (req, res, next) => {

    const id_role = req.cookies.role
   
    if (id_role === "2"){
        next()
    } else {
        return res
            .status(400)
            .json({erreur: "Vous n'êtes pas connecté en admin"})
            .end()
    }
    
};

module.exports = isAuthAdmin 