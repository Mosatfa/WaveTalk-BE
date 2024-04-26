export const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(err => {
            return next(new Error(err, { cause: 500 }))
        })
    }
}

export const gloablErrorHandling = (err, req, res, next) => {
    if (process.env.MOOD == "DEV") {
        return res.status(err.cause || 500).json({ message: err.message, err, stack: err.stack })
    }
    return res.status(err.cause || 500).json({ message: err.message })
}