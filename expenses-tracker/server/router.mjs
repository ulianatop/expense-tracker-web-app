export default class Router {
    constructor() {
        this.globals = [];
        this.routes = [];
    }

    // Add global middleware (runs on all requests)
    addGlobal(...handlers) {
        this.globals.push(...handlers);
    }

    // Add route with method, URL predicate, and handlers
    addRoute(method, urlPredicate, ...handlers) {
        this.routes.push(new Route(method, urlPredicate, handlers));
    }

    // Handle an incoming request
    async handle(req, res) {
        try {
            for (let i = 0; i < this.globals.length; i++) {
                await this.globals[i](req, res);
            };
            for (let i = 0; i < this.routes.length; i++) {
                const route = this.routes[i];
                if (route.method !== req.method || !route.urlPredicate(req.url)) {
                    continue;
                }
                for (let j = 0; j < route.handlers.length; j++) {
                    await route.handlers[j](req, res);
                }
                break;
            }
        } catch (err) {
            console.log(err)
            res.statusCode = err.statusCode || 500;
            res.writeHead(res.statusCode, {
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
                error: err.message
            }));
            return;
        }
    }

    // Returns the global middleware handlers (for tests)
    _getGlobals() {
        return this.globals;
    }

    // Returns the routes (for tests)
    _getRoutes() {
        return this.routes;
    }
}

class Route {
    constructor(method, urlPredicate, handlers) {
        this.method = method;
        this.urlPredicate = urlPredicate;
        this.handlers = handlers;
    }
}