import express from 'express';

export type RouteMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

/** One HTTP route the server registered. */
export interface IRegisteredRoute {
    method: RouteMethod;
    path: string;
}

/** What {@link recordRegisteredRoutes} has seen so far. */
export interface IRouteRecording {
    readonly routes: readonly IRegisteredRoute[];

    /**
     * Throws if an app holds routes that {@link routes} is missing: a guard built on the list would then
     * pass without ever looking at them.
     */
    assertComplete(): void;
}

/** The parts of an Express router layer the completeness check reads. `app._router` is Express-internal. */
interface IRouterLayer {
    name: string;
    route?: unknown;
}

const routeMethods: readonly RouteMethod[] = ['get', 'post', 'put', 'delete', 'patch'];

/**
 * Starts recording every route registered on an Express app, and returns what it has seen. Call it
 * **before the server is constructed**, since routes are registered during construction.
 *
 * Why this and not the app's own router: the app is not reachable from the server object, and
 * `httpServer.listeners('request')` does not expose it either, because socket.io re-wraps those
 * listeners when it attaches. Express copies the methods on `express.application` onto each new app
 * when the app is created, so wrapping them first sees every registration without touching production.
 *
 * Only those five verbs are seen. A route registered any other way (`app.all`, `app.route()`,
 * `app.head` or `app.options`, an `express.Router` or a sub-app mounted with `app.use`) never reaches the
 * wrappers, so `assertComplete` compares what was recorded with the route layers the apps' routers really
 * hold and fails on a difference; extend this recorder when it does.
 *
 * jasmine removes the wrappers when the spec ends.
 */
export function recordRegisteredRoutes(): IRouteRecording {
    const routes: IRegisteredRoute[] = [];
    const apps = new Set<express.Application>();

    for (const method of routeMethods) {
        const original = express.application[method] as (this: express.Application, ...args: unknown[]) => unknown;

        spyOn(express.application, method).and.callFake(function (this: express.Application, ...args: unknown[]) {
            apps.add(this); // eslint-disable-line no-invalid-this -- the app the method was called on

            // `app.get('some setting')` reads a setting; it is not a route
            const isSettingRead = method === 'get' && args.length === 1;
            if (!isSettingRead) {
                routes.push({ method, path: String(args[0]) });
            }

            return original.apply(this, args); // eslint-disable-line no-invalid-this -- must forward the app it is called on
        } as never);
    }

    return {
        routes,
        assertComplete: () => {
            const layers = [...apps].flatMap((app) => (app._router?.stack ?? []) as IRouterLayer[]);
            const routeLayers = layers.filter((layer) => layer.route).length;
            const mounts = layers.filter((layer) => layer.name === 'router' || layer.name === 'mounted_app').length;

            if (routeLayers !== routes.length || mounts > 0) {
                throw new Error(
                    `RouteRecorder: the server registered routes the recorder cannot name (${routeLayers} route layers for ${routes.length} recorded registrations, ` +
                    `and ${mounts} mounted routers or sub-apps), so a guard built on its list would pass without checking them`
                );
            }
        },
    };
}
