import { ExpensesAPIHandler } from './handlers/api/expenses/expenses.mjs';
import { CategoriesAPIHandler } from './handlers/api/categories/categories.mjs';
import { UsersAPIHandler } from './handlers/api/users/usersHandler.mjs';
import { UserExtractor } from './handlers/middleware/userExtractor.mjs';
import FileHandler from './handlers/fileHandler.mjs';
import HTTPServer from './httpServer.mjs';
import Router from './router.mjs';
import { ExpensesState } from './state/expenses/expenses.mjs';
import CategoriesState from './state/categories/categories.mjs';
import { UsersState } from './state/users/usersState.mjs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, 'state/database/.env') });
console.log(process.env.MYSQL_DATABASE);

const filesDir = '../../public';
const fileHandler = new FileHandler(filesDir);

const router = new Router();

const userExtractor = new UserExtractor();
router.addGlobal((req, res) => userExtractor.handle(req, res));

let id = 1;
const requestArrivalHandler = (req, res) => {
    req.id = id;
    req.startTime = new Date();
    console.log(`${id} ${req.method} ${req.url}`);
    id++;
}
router.addGlobal(requestArrivalHandler);

const reqParser = async (req) => {
    let body = '';
    for await (const chunk of req) {
        body += chunk;
    }
    return JSON.parse(body);
};

const resCreator = (statusCode, data, res) => {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(data));
};

// Expenses API
const expensesState = new ExpensesState();
const expensesApiHandler = new ExpensesAPIHandler(expensesState, reqParser, resCreator);
router.addRoute('GET', url => url.startsWith('/api/expenses'), (req, res) => expensesApiHandler.handle(req, res));
router.addRoute('POST', url => url.startsWith('/api/expenses'), (req, res) => expensesApiHandler.handle(req, res));
router.addRoute('PUT', url => url.startsWith('/api/expenses'), (req, res) => expensesApiHandler.handle(req, res));
router.addRoute('DELETE', url => url.startsWith('/api/expenses'), (req, res) => expensesApiHandler.handle(req, res));

// Categories API
const categoriesState = new CategoriesState();
const categoriesApiHandler = new CategoriesAPIHandler(categoriesState, reqParser, resCreator);
router.addRoute('GET', url => url.startsWith('/api/categories'), (req, res) => categoriesApiHandler.handle(req, res));
router.addRoute('POST', url => url.startsWith('/api/categories'), (req, res) => categoriesApiHandler.handle(req, res));
router.addRoute('PUT', url => url.startsWith('/api/categories'), (req, res) => categoriesApiHandler.handle(req, res));
router.addRoute('DELETE', url => url.startsWith('/api/categories'), (req, res) => categoriesApiHandler.handle(req, res));

// Users API
const usersState = new UsersState();
const usersApiHandler = new UsersAPIHandler(usersState, reqParser, resCreator);
router.addRoute('POST', url => url === '/api/users', (req, res) => usersApiHandler.handle(req, res));
router.addRoute('POST', url => url === '/api/users/login', (req, res) => usersApiHandler.handle(req, res));

// Redirect '/' to '/users/login.html'
router.addRoute('GET', url => url === '/', (req, res) => {
    res.writeHead(302, {
        'Location': '/users/login.html'
    });
    res.end();
});

// Use file handler as a default for GET requests.
const defaultGetHandler = (req, res) => fileHandler.handle(req, res);
router.addRoute('GET', url => true, defaultGetHandler);

const port = 8000;
const httpServer = new HTTPServer(router, port);
await httpServer.start();

console.log(`========================================`);
console.log(`Server running at http://${httpServer.address}:${httpServer.port}/`);
console.log(`Press Ctrl+C to stop the server`);
console.log(`========================================`);

// Gracefully shutdown on Signal Interrupt e.g. when Ctrl+C is pressed.
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    await httpServer.stop();
    console.log('Server stopped.');
    process.exit(0);
});