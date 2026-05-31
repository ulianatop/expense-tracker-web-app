import Router from '../../../router.mjs';
import jwt from 'jsonwebtoken';

export class UsersAPIHandler {
    constructor(usersState, reqParser, resCreator) {
        this.usersState = usersState;
        this.reqParser = reqParser;
        this.resCreator = resCreator;

        this.router = new Router();
        this.router.addRoute('POST', url => url === '/api/users',
            (req, res) => this.registerUser(req, res));
        this.router.addRoute('POST', url => url === '/api/users/login',
            (req, res) => this.loginUser(req, res));
    }

    async handle(req, res) {
        await this.router.handle(req, res);
    }

    async registerUser(req, res) {
        try {
            const user = await this.reqParser(req);
            await this.usersState.addUser(user.username, user.password);
            this.resCreator(200, {}, res);
        } catch (err) {
            console.log(err);
            this.resCreator(err.statusCode || 500, { error: err.message }, res);
        }
    }

    async loginUser(req, res) {
        try {
            const user = await this.reqParser(req);
            await this.usersState.verifyUser(user.username, user.password);
            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET);
            this.resCreator(200, { token: token }, res);
        } catch (err) {
            console.log(err);
            this.resCreator(err.statusCode || 500, { error: err.message }, res);
        }
    }
}