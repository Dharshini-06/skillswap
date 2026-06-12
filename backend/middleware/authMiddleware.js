const authMiddleware = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    if (!userId) {
        return res.status(401).json({ message: "No user ID provided, authorization denied" });
    }
    req.user = { id: userId };
    next();
};

module.exports = authMiddleware;
