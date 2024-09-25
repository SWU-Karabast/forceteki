class TestSetupError extends Error {
    constructor(msg, statusCode) {
        super(msg);
        this.statusCode = statusCode;
        this.name = TestSetupError.name;
    }
}

module.exports = TestSetupError;