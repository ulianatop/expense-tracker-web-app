import Router from '../../../router.mjs';

export class CategoriesAPIHandler {
    constructor(catState, reqParser, resCreator) {
        this.catState = catState;
        this.reqParser = reqParser;
        this.resCreator = resCreator;

        this.router = new Router();
        this.router.addRoute('POST', url => url === '/api/categories',
            (req, res) => this.createCategory(req, res));
        this.router.addRoute('GET', url => url === '/api/categories',
            (req, res) => this.listCategories(req, res));
        this.router.addRoute('PUT', url => /\/api\/categories\/\d+/.test(url),
            (req, res) => this.updateCategory(req, res));
        this.router.addRoute('DELETE', url => /\/api\/categories\/\d+/.test(url),
            (req, res) => this.deleteCategory(req, res));
    }

    async handle(req, res) {
        await this.router.handle(req, res);
    }

    requireUsername(req) {
        if (!req.username) {
            const err = new Error('Unauthorized');
            err.statusCode = 401;
            throw err;
        }
    }

    async createCategory(req, res) {
        try {
            this.requireUsername(req);
            const cat = await this.reqParser(req);
            const id = await this.catState.addCategory(req.username, cat);
            this.resCreator(200, { id: id }, res);
        } catch (err) {
            console.log(err);
            this.resCreator(err.statusCode || 500, { error: err.message }, res);
        }
    }

    async listCategories(req, res) {
        try {
            this.requireUsername(req);
            const cats = await this.catState.listCategories(req.username);
            this.resCreator(200, cats, res);
        } catch (err) {
            console.log(err);
            this.resCreator(err.statusCode || 500, { error: err.message }, res);
        }
    }

    async updateCategory(req, res) {
        try {
            this.requireUsername(req);
            const id = req.url.match(/\d+/)[0];
            const cat = await this.reqParser(req);
            await this.catState.updateCategory(req.username, id, cat);
            this.resCreator(200, {}, res);
        } catch (err) {
            console.log(err);
            this.resCreator(err.statusCode || 500, { error: err.message }, res);
        }
    }

    async deleteCategory(req, res) {
        try {
            this.requireUsername(req);
            const id = req.url.match(/\d+/)[0];
            await this.catState.deleteCategory(req.username, id);
            this.resCreator(200, {}, res);
        } catch (err) {
            console.log(err);
            this.resCreator(err.statusCode || 500, { error: err.message }, res);
        }
    }
}