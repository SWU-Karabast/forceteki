import express from 'express';
import { recordRegisteredRoutes } from '../../../helpers/server/RouteRecorder';

describe('RouteRecorder', function () {
    const handler: express.RequestHandler = (req, res) => {
        res.end();
    };

    it('records the routes registered with the verbs it wraps, and not a setting read with app.get', function () {
        const recording = recordRegisteredRoutes();
        const app = express();

        app.get('/read', handler);
        app.post('/write', handler);
        app.put('/replace', handler);
        app.delete('/remove', handler);
        app.patch('/amend', handler);
        app.get('env');

        expect(recording.routes).toEqual([
            { method: 'get', path: '/read' },
            { method: 'post', path: '/write' },
            { method: 'put', path: '/replace' },
            { method: 'delete', path: '/remove' },
            { method: 'patch', path: '/amend' },
        ]);
        expect(() => recording.assertComplete()).not.toThrow();
    });

    describe('a route registered in a form the recorder cannot name', function () {
        const forms: Record<string, (app: express.Application) => void> = {
            'with app.all': (app) => {
                app.all('/any', handler);
            },
            'with app.route': (app) => {
                app.route('/chained').get(handler);
            },
            'with app.head': (app) => {
                app.head('/head', handler);
            },
            'inside a router mounted with app.use': (app) => {
                const router = express.Router();
                router.get('/nested', handler);
                app.use('/router', router);
            },
            'inside a sub-app mounted with app.use': (app) => {
                const subApp = express();
                subApp.get('/nested', handler);
                app.use('/sub', subApp);
            },
        };

        for (const [form, register] of Object.entries(forms)) {
            it(`is reported when it is registered ${form}`, function () {
                const recording = recordRegisteredRoutes();
                const app = express();
                app.get('/read', handler);

                register(app);

                expect(() => recording.assertComplete()).toThrowError(/cannot name/);
            });
        }
    });
});
