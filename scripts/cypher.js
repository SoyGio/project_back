'use strict';
const crypto = require('crypto');
var CryptoJS = require("crypto-js");

const ENCRYPTION_KEY = '1234_MyProjectInTechU_1234_TechU'; // Must be 256 bytes (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encryptAES(text) {
 let iv = crypto.randomBytes(IV_LENGTH);
 let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
 let encrypted = cipher.update(text);

 encrypted = Buffer.concat([encrypted, cipher.final()]);

 return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptAES(text) {
 let textParts = text.split(':');
 let iv = new Buffer(textParts.shift(), 'hex');
 let encryptedText = new Buffer(textParts.join(':'), 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(ENCRYPTION_KEY), iv);
 let decrypted = decipher.update(encryptedText);

 decrypted = Buffer.concat([decrypted, decipher.final()]);

 return decrypted.toString();
}

function encryptSHA1(text){
	return CryptoJS.SHA1(text).toString();
}

module.exports = { decryptAES, encryptAES, encryptSHA1 };