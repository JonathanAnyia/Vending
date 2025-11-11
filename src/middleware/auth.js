const jwt = require('jsonwebtoken');


module.exports = function (req, res, next) {
// Expect token in header: x-auth-token
const token = req.header('x-auth-token');
if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });


try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // { id, role }
next();
} catch (err) {
res.status(401).json({ msg: 'Token is not valid' });
}
};