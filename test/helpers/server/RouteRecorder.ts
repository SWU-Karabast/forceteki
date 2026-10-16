import express from 'express';

export type RouteMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

/** One HTTP route the server registered. */
export interface IRegisteredRoute {
    method: RouteMethod;
    path: string;
}

const routeMethods: readonly RouteMethod[] = ['get', 'post', 'put', 'delete', 'patch'];

/**
 * Starts recording every route registered on an Express app, and returns the list it fills in. Call it
 * **before the server is constructed**, since routes are registered during construction.
 *
 * Why this and not the app's own router: the app is not reachable from the server object, and
 * `httpServer.listeners('request')` does not expose it either, because socket.io re-wraps those
 * listeners when it attaches. Express copies the methods on `express.application` onto each new app
 * when the app is created, so wrapping them first sees every registration without touching production.
 *
 * jasmine removes the wrappers when the spec ends. If routes ever move into `express.Router` modules,
 * wrap `express.Router`'s methods the same way.
 */
export function recordRegisteredRoutes(): IRegisteredRoute[] {
    const routes: IRegisteredRoute[] = [];

    for (const method of routeMethods) {
        const original = express.application[method] as (this: express.Application, ...args: unknown[]) => unknown;

        spyOn(express.application, method).and.callFake(function (this: express.Application, ...args: unknown[]) {
            // `app.get('some setting')` reads a setting; it is not a route
            const isSettingRead = method === 'get' && args.length === 1;
            if (!isSettingRead) {
                routes.push({ method, path: String(args[0]) });
            }

            return original.apply(this, args); // eslint-disable-line no-invalid-this -- must forward the app it is called on
        } as never);
    }

    return routes;
}
