const User = require('../models/user');
const Token = require('../models/token');
const { sendVerificationEmail } = require('../services/index');

// @route POST api/auth/register
// @desc Register user
// @access Public
exports.register = async (req, res) => {
    try {
        const { email } = req.body;

        // Make sure this account doesn't already exist
        const user = await User.findOne({ email });

        if (user) {
            return res.status(401).json({ message: 'The email address you have entered is already associated with another account.' });
        }

        const newUser = new User(req.body);

        const savedUser = await newUser.save();

        console.log('savedUser', savedUser)

        await sendVerificationEmail(savedUser, req);

        console.log('email sent')

        res.status(200).json({ message: "Registration successful. Please check your email to verify your account." });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @route POST api/auth/login
// @desc Login user and return JWT token
// @access Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ msg: 'The email address ' + email + ' is not associated with any account. Double-check your email address and try again.' });

        //validate password
        const isMatch = await user.comparePassword(password);
        if (isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        // Make sure the user has been verified
        if (!user.isVerified) return res.status(401).json({ type: 'not-verified', message: 'Your account has not been verified.' });

        // Login successful, write token, and send back user
        const token = user.generateJWT();
        res.status(200).json({ token, user: user });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};


// @route GET api/verify/:token
// @desc Email verification
// @access Public
exports.verify = async (req, res) => {
    if (!req.params.token) return res.status(400).json({ message: "We were unable to find a user for this token." });

    try {
        // Find a matching token
        const token = await Token.findOne({ token: req.params.token });

        if (!token) return res.status(400).json({ message: 'We were unable to find a valid token. Your token my have expired.' });

        // If we found a token, find a matching user
        const user = await User.findOne({ _id: token.userId });

        if (!user) return res.status(400).json({ message: 'We were unable to find a user for this token.' });

        if (user.isVerified) return res.status(400).json({ message: 'This user has already been verified.' });

        // Verify and save the user
        user.isVerified = true;
        await user.save();

        res.status(200).send("The account has been verified. Please log in.");

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

// @route POST api/resend
// @desc Resend Verification Token
// @access Public
exports.resendToken = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.' });

        if (user.isVerified) return res.status(400).json({ message: 'This account has already been verified. Please log in.' });

        await sendVerificationEmail(user, req, res);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
};

