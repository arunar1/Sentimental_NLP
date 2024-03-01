const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const admin = require('../databasemodel/registrationmodel/admin');
const user = require('../databasemodel/registrationmodel/usermodel');
const JWT_SECRET = process.env.jwt_code;

const router = express.Router();

router.post('/', async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    const search = { "email": email };

    try {
        const userRecord = await user.findOne(search);
        const adminRecord = await admin.findOne(search);

        let foundUser = null;
        if (userRecord) {
            foundUser = userRecord;
        } else if (adminRecord) {
            foundUser = adminRecord;
        } else {
            return res.json({ error: "User not available" });
        }

        if (foundUser && foundUser.password) {
            if (await bcrypt.compare(password, foundUser.password)) {
                const token = jwt.sign({ email: foundUser.email }, JWT_SECRET);
                return res.status(201).json({ status: 'ok', token: token, details: foundUser });
            } else {
                return res.json({ status: 'error', error: "Invalid password" });
            }
        } else {
            return res.json({ status: 'error', error: "User not found or password not available" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



module.exports = router;
