import { DynamoDBService } from '../../../server/services/DynamoDBService';
import type { IPlayerReportEntity } from '../../../server/services/DynamoDBInterfaces';
import { PlayerReportOutcome, PlayerReportStatus } from '../../../server/services/DynamoDBInterfaces';

/**
 * The service specs use an in-memory fake of DynamoDBService, so these check the commands the real service
 * builds for the player report paths: the shapes DynamoDB accepts, and how cancelled
 * transactions are reported.
 */
describe('DynamoDBService player report commands', function() {
    let service: DynamoDBService;
    let send: jasmine.Spy;

    const report: IPlayerReportEntity = {
        id: 'report-1',
        createdAt: '2026-10-01T00:00:00.000Z',
        status: PlayerReportStatus.Open,
        reporterId: 'reporter-1',
        reporterUsername: 'Reporter',
        reportedPlayerId: 'reported-1',
        reportedPlayerUsername: 'Reported',
        offense: 'other',
        description: 'd',
        lobbyId: 'lobby-1',
        gameFormat: 'premier',
        matchType: 'quick',
        reportedPlayerPriorReportCount: 0,
        reporterRecentFalseReportCount: 0,
    };

    const cancelled = (...codes: string[]) => Object.assign(new Error('Transaction cancelled'), {
        name: 'TransactionCanceledException',
        CancellationReasons: codes.map((Code) => ({ Code })),
    });

    /** DynamoDB rejects a request whose expression attribute names or values are not all used, or undefined */
    const expectPlaceholdersMatch = (input: Record<string, any>) => {
        const expressions = [input.UpdateExpression, input.ConditionExpression, input.KeyConditionExpression].filter(Boolean).join(' ');
        const used = new Set(expressions.match(/[#:][A-Za-z0-9_]+/g) ?? []);
        const declared = [...Object.keys(input.ExpressionAttributeNames ?? {}), ...Object.keys(input.ExpressionAttributeValues ?? {})];
        expect(declared.sort()).toEqual([...used].sort());
        for (const [key, value] of Object.entries(input.ExpressionAttributeValues ?? {})) {
            expect(value).withContext(key)
                .toBeDefined();
        }
    };

    /** A path may not be both SET and REMOVEd in one update expression */
    const expectNoSetRemoveOverlap = (input: Record<string, any>) => {
        const [setPart, removePart = ''] = (input.UpdateExpression as string).split('REMOVE');
        const resolve = (token: string) => input.ExpressionAttributeNames?.[token] ?? token;
        const setPaths = [...setPart.matchAll(/([#\w]+) = /g)].map((match) => resolve(match[1]));
        const removePaths = removePart.split(',').map((path) => resolve(path.trim()))
            .filter(Boolean);
        expect(setPaths.filter((path) => removePaths.includes(path))).toEqual([]);
    };

    const sentInput = (call = 0) => send.calls.argsFor(call)[0].input;
    const transactItems = (call = 0): Record<string, any>[] => sentInput(call).TransactItems;

    beforeEach(function() {
        // Local mode only so the constructor needs no AWS credentials; the client is replaced below
        const environment = process.env.ENVIRONMENT;
        process.env.ENVIRONMENT = 'development';
        service = new DynamoDBService();
        // Assigning undefined would store the string 'undefined'
        if (environment === undefined) {
            delete process.env.ENVIRONMENT;
        } else {
            process.env.ENVIRONMENT = environment;
        }

        send = jasmine.createSpy('send').and.resolveTo({});
        (service as any).client = { send };
    });

    describe('transitionPlayerReportAsync', function() {
        const close = () => service.transitionPlayerReportAsync(
            report,
            PlayerReportStatus.Open,
            { status: PlayerReportStatus.Closed, closedAt: '2026-10-05T00:00:00.000Z', outcome: PlayerReportOutcome.ActionTaken },
            ['closingNote'],
            'CLOSED_PLAYER_REPORT#2026-10',
            'REPORT_LOG_EXPIRY#2026-11-04'
        );

        it('updates the report, both index entries and both logs in one valid transaction', async function() {
            const result = await close();

            const items = transactItems();
            expect(items.length).toBe(5);
            for (const item of items) {
                expectPlaceholdersMatch(item.Update);
                expectNoSetRemoveOverlap(item.Update);
            }
            const [meta, reporterIndex, reportedIndex, chatLog, gameLog] = items.map((item) => item.Update);
            expect(meta.Key).toEqual({ pk: 'REPORT#report-1', sk: 'META' });
            expect(meta.ConditionExpression).toContain('#status = :expectedStatus');
            expect(meta.ExpressionAttributeValues[':expectedStatus']).toBe(PlayerReportStatus.Open);
            expect(reporterIndex.Key).toEqual({ pk: 'USER#reporter-1', sk: 'PLAYERREPORT#ReportSubmitter#report-1' });
            expect(reportedIndex.ExpressionAttributeValues).toEqual({ ':status': PlayerReportStatus.Closed, ':outcome': PlayerReportOutcome.ActionTaken });
            expect(chatLog.Key.sk).toBe('LOG#Chat');
            expect(gameLog.ExpressionAttributeValues[':gsiPk']).toBe('REPORT_LOG_EXPIRY#2026-11-04');
            expect(items.every((item) => item.Update.ConditionExpression)).toBeTrue();

            expect(result).toEqual({ success: true, report: jasmine.objectContaining({ status: PlayerReportStatus.Closed, outcome: PlayerReportOutcome.ActionTaken }) });
        });

        it('removes the outcome and the log expiry on reopen', async function() {
            const closedReport = { ...report, status: PlayerReportStatus.Closed, outcome: PlayerReportOutcome.ActionTaken, closedAt: '2026-10-05T00:00:00.000Z' };

            const result = await service.transitionPlayerReportAsync(
                closedReport,
                PlayerReportStatus.Closed,
                { status: PlayerReportStatus.Open, reopenedAt: '2026-10-06T00:00:00.000Z' },
                ['closedAt', 'outcome', 'closingNote'],
                'OPEN_PLAYER_REPORT',
                null
            );

            const [meta, reporterIndex, , chatLog] = transactItems().map((item) => item.Update);
            for (const item of transactItems()) {
                expectPlaceholdersMatch(item.Update);
                expectNoSetRemoveOverlap(item.Update);
            }
            expect(meta.UpdateExpression).toContain('REMOVE');
            expect(reporterIndex.UpdateExpression).toBe('SET #status = :status REMOVE outcome');
            expect(chatLog.UpdateExpression).toBe('REMOVE GSI_PK');
            expect(result.success && result.report.outcome).toBeUndefined();
            expect(result.success && result.report.closedAt).toBeUndefined();
        });

        it('leaves logs out once they were deleted by the retention cleanup', async function() {
            await service.transitionPlayerReportAsync({ ...report, logsDeletedAt: '2026-11-05T00:00:00.000Z' }, PlayerReportStatus.Open, { status: PlayerReportStatus.Closed }, [], 'X', 'Y');

            expect(transactItems().length).toBe(3);
        });

        it('returns failed conditions and concurrent transactions instead of throwing', async function() {
            send.and.rejectWith(cancelled('None', 'ConditionalCheckFailed', 'None'));
            expect(await close()).toEqual({ success: false, reason: 'condition' });

            send.and.rejectWith(cancelled('TransactionConflict', 'None'));
            expect(await close()).toEqual({ success: false, reason: 'conflict' });
        });

        it('rethrows other errors', async function() {
            send.and.rejectWith(cancelled('ThrottlingError'));
            await expectAsync(close()).toBeRejectedWithError(/Transaction cancelled/);
        });
    });

    describe('retention deletes', function() {
        it('only delete logs of a report that is still closed and was closed before the cutoff', async function() {
            expect(await service.deletePlayerReportLogsAsync('report-1', '2026-11-05T00:00:00.000Z', '2026-10-06T00:00:00.000Z')).toBeTrue();

            const [meta, ...logs] = transactItems();
            expectPlaceholdersMatch(meta.Update);
            expect(meta.Update.ConditionExpression).toBe('#status = :closed AND closedAt < :closedBefore');
            expect(meta.Update.ExpressionAttributeValues[':closedBefore']).toBe('2026-10-06T00:00:00.000Z');
            expect(logs.map((item) => item.Delete.Key.sk)).toEqual(['LOG#Chat', 'LOG#Game']);
        });

        it('delete a report with its logs and index entries under the same condition', async function() {
            expect(await service.deletePlayerReportAsync('report-1', 'reporter-1', 'reported-1', '2025-11-01T00:00:00.000Z')).toBeTrue();

            const items = transactItems();
            expectPlaceholdersMatch(items[0].Delete);
            expect(items[0].Delete.ConditionExpression).toBe('#status = :closed AND closedAt < :closedBefore');
            expect(items.map((item) => item.Delete.Key.sk)).toEqual([
                'META', 'LOG#Chat', 'LOG#Game', 'PLAYERREPORT#ReportSubmitter#report-1', 'PLAYERREPORT#ReportedPlayer#report-1',
            ]);
        });

        it('skip a report whose condition no longer holds, but rethrow a concurrent transaction', async function() {
            send.and.rejectWith(cancelled('ConditionalCheckFailed', 'None', 'None'));
            expect(await service.deletePlayerReportLogsAsync('report-1', 'now', 'cutoff')).toBeFalse();

            send.and.rejectWith(cancelled('TransactionConflict'));
            await expectAsync(service.deletePlayerReportAsync('report-1', 'a', 'b', 'cutoff')).toBeRejected();
        });
    });

    describe('reading a report', function() {
        it('reads the record with a get, separately from the logs, so large logs cannot hide it', async function() {
            send.and.callFake((command: { input: Record<string, any> }) => Promise.resolve(
                command.input.Key ? { Item: { pk: 'REPORT#report-1', sk: 'META', ...report } } : { Items: [] }
            ));

            const stored = await service.getPlayerReportAsync('report-1', { consistentRead: true });

            expect(stored.report).toEqual(report);
            expect(stored.logs).toEqual([]);
            const inputs = send.calls.allArgs().map(([command]) => command.input);
            expect(inputs.find((input) => input.Key)).toEqual(jasmine.objectContaining({ Key: { pk: 'REPORT#report-1', sk: 'META' }, ConsistentRead: true }));
            expect(inputs.find((input) => input.KeyConditionExpression)?.ExpressionAttributeValues).toEqual({ ':pk': 'REPORT#report-1', ':skPrefix': 'LOG#' });
        });

        it('returns null for a missing report', async function() {
            send.and.resolveTo({});

            expect(await service.getPlayerReportMetaAsync('missing')).toBeNull();
            expect(await service.getPlayerReportAsync('missing')).toBeNull();
        });
    });

    it('creates a report and all its items atomically', async function() {
        await service.savePlayerReportAsync(report, [{ reportId: 'report-1', kind: 'Chat' as any, lines: [], truncated: false }], []);

        const items = transactItems();
        expect(items.length).toBe(2);
        expect(items.every((item) => item.Put.ConditionExpression === 'attribute_not_exists(pk)')).toBeTrue();
        expect(items[0].Put.Item.GSI_PK).toBe('OPEN_PLAYER_REPORT');
    });
});
