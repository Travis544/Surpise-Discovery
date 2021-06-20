
var pbkdf2 = require('pbkdf2')
var crypto = require("crypto")

function getNewSalt(){
    var salt = crypto.randomBytes(16).toString();
    return salt;
}


function hashPassword(password, salt) {
    var hash = pbkdf2(password, salt);
    return hash;
}

function isPasswordCorrect(password, salt, hash) {
    return hash == hashPassword(password,salt);
}

function register(username, password){
    var salt =getNewSalt();
    var hashpass = hashPassword(password,salt);
}



export { hashPassword, isPasswordCorrect, register };