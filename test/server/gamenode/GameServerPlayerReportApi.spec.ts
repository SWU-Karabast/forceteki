import { ServerTestHarness } from '../../helpers/server/ServerTestHarness';

/**
 * The player report endpoints expose chat logs and moderation history, so none of them may answer
 * a caller without the moderator role.
 */
describe('GameServer player report API', function () {
    let harness: ServerTestHarness;

    beforeEach(async function () {
        harness = await ServerTestHarness.createAsync();
    });

    afterEach(async function () {
        await harness?.shutdownAsync();
    });

    const postEndpoints: { path: string; body: Record<string, unknown> }[] = [
        { path: '/api/mod/reports/list', body: { status: 'Open' } },
        { path: '/api/mod/reports/get', body: { reportId: 'some-report' } },
        { path: '/api/mod/reports/claim', body: { reportId: 'some-report' } },
        { path: '/api/mod/reports/close', body: { reportId: 'some-report', outcome: 'NoAction' } },
        { path: '/api/mod/reports/reopen', body: { reportId: 'some-report' } },
        { path: '/api/mod/submit-action', body: { playerId: 'p', actionType: 'Warning', note: 'n', reportId: 'some-report' } },
    ];

    for (const endpoint of postEndpoints) {
        it(`rejects an anonymous user calling ${endpoint.path}`, async function () {
            const response = await harness.api
                .post(endpoint.path)
                .send({ user: harness.anonymousUser(), ...endpoint.body });

            expect([401, 403]).toContain(response.status);
            expect(response.body.reports).toBeUndefined();
            expect(response.body.report).toBeUndefined();
        });
    }

    it('rejects an anonymous user reading the open report count', async function () {
        const response = await harness.api
            .get('/api/mod/reports/open-count')
            .query({ user: JSON.stringify(harness.anonymousUser()) });

        expect([401, 403]).toContain(response.status);
        expect(response.body.openCount).toBeUndefined();
    });
});
