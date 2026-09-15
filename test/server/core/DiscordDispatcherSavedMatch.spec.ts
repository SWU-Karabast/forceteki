/* global describe, it, expect, jasmine, spyOn */
import FormData from 'form-data';
import { DiscordDispatcher } from '../../../server/game/core/DiscordDispatcher';
import { MatchmakingType } from '../../../server/gamenode/Lobby';
import { ReportType } from '../../../server/game/Interfaces';
import type { ISerializedReportState } from '../../../server/game/Interfaces';
import { SwuGameFormat } from '../../../server/game/core/Constants';
import type { ISavedMatch } from '../../../server/game/core/stateSerialization/SavedMatchInterfaces';
import * as Util from '../../../server/Util';

/**
 * P2-D's `DiscordDispatcher` additions: `formatReport` carrying `savedMatch` through, and
 * `formatAndSendReportAsync` attaching it as `files[2]` on a bug report subject to the combined-attachment
 * size budget (`P2D-R1-08`: budgeted against `files[0]` and `files[1]` together, not `savedMatch` alone).
 * `httpPostFormData` is spied out (a real webhook POST would otherwise be attempted); `FormData.prototype
 * .append` is spied-and-called-through so the test can inspect what was actually attached without depending
 * on the `form-data` package's own internal representation.
 */
describe('DiscordDispatcher saved-match attachment', function() {
    function buildDispatcher(): DiscordDispatcher {
        const dispatcher = new DiscordDispatcher();
        // formatAndSendReportAsync short-circuits (returns false, never builds the FormData) when no
        // webhook URL is configured, which is the case in this test environment by default.
        (dispatcher as unknown as { _bugReportWebhookUrl: string })._bugReportWebhookUrl = 'https://example.invalid/bug-report-webhook';
        (dispatcher as unknown as { _playerReportWebhookUrl: string })._playerReportWebhookUrl = 'https://example.invalid/player-report-webhook';
        return dispatcher;
    }

    function buildReport(overrides: Partial<ISerializedReportState> = {}): ISerializedReportState {
        return {
            description: 'test description',
            gameState: { phase: 'action', player1: {}, player2: {} },
            playerReportType: null,
            reporter: { id: 'r1', username: 'Reporter', playerInGameState: 'player1' },
            opponent: { id: 'o1', username: 'Opponent', playerInGameState: 'player2' },
            lobbyId: 'lobby-1',
            timestamp: new Date().toISOString(),
            messages: [],
            gameStepsSinceLastUndo: 'N/A',
            gameFormat: SwuGameFormat.Open,
            matchType: MatchmakingType.PrivateLobby,
            ...overrides,
        };
    }

    function spyOnAppends() {
        const appendSpy = spyOn(FormData.prototype, 'append').and.callThrough();
        return () => appendSpy.calls.allArgs().map((args) => args[0] as string);
    }

    it('formatReport carries a provided savedMatch through unchanged, and defaults to undefined', function() {
        const dispatcher = buildDispatcher();
        const savedMatch = { formatVersion: 1 } as unknown as ISavedMatch;
        const user = { getId: () => 'r1', getUsername: () => 'Reporter' } as unknown as Parameters<typeof dispatcher.formatReport>[3];

        const withSave = dispatcher.formatReport(
            'desc', { phase: 'action', player1: {}, player2: {} }, null, user, { id: 'o1', username: 'Opponent' },
            [], 'lobby-1', SwuGameFormat.Open, MatchmakingType.PrivateLobby, undefined, undefined, null, null, undefined, savedMatch
        );
        expect(withSave.savedMatch).toBe(savedMatch);

        const withoutSave = dispatcher.formatReport(
            'desc', { phase: 'action', player1: {}, player2: {} }, null, user, { id: 'o1', username: 'Opponent' },
            [], 'lobby-1', SwuGameFormat.Open, MatchmakingType.PrivateLobby
        );
        expect(withoutSave.savedMatch).toBeUndefined();
    });

    it('attaches a normally-sized savedMatch as files[2] on a bug report', async function() {
        const dispatcher = buildDispatcher();
        spyOn(Util, 'httpPostFormData').and.resolveTo('ok');
        const getAppendedFields = spyOnAppends();

        const report = buildReport({ savedMatch: { formatVersion: 1, small: true } as unknown as ISavedMatch });
        const success = await dispatcher.formatAndSendReportAsync(report, ReportType.BugReport);

        expect(success).toBeTrue();
        expect(getAppendedFields()).toContain('files[2]');
    });

    it('omits a savedMatch that would push the combined attachment size over budget, and notes the omission in the embed instead', async function() {
        const dispatcher = buildDispatcher();
        spyOn(Util, 'httpPostFormData').and.resolveTo('ok');
        const appendSpy = spyOn(FormData.prototype, 'append').and.callThrough();

        // Comfortably over the combined budget by itself; files[0]/files[1] for this minimal report are tiny.
        const hugeString = 'x'.repeat(8 * 1024 * 1024);
        const report = buildReport({ savedMatch: { formatVersion: 1, huge: hugeString } as unknown as ISavedMatch });
        const success = await dispatcher.formatAndSendReportAsync(report, ReportType.BugReport);

        expect(success).toBeTrue();
        const fields = appendSpy.calls.allArgs().map((args) => args[0] as string);
        expect(fields).not.toContain('files[2]');

        const payloadJson = appendSpy.calls.allArgs().find((args) => args[0] === 'payload_json')[1] as string;
        expect(payloadJson).toContain('Omitted');
    });

    it('omits a savedMatch that is under budget alone, but pushes the combined gameState+messages+savedMatch total over budget (P2D-I1-07)', async function() {
        const dispatcher = buildDispatcher();
        spyOn(Util, 'httpPostFormData').and.resolveTo('ok');
        const appendSpy = spyOn(FormData.prototype, 'append').and.callThrough();

        // savedMatch alone (~6 MB) is under the 7 MB budget by itself -- discriminating from the sibling
        // "omits" case above, whose 8 MB savedMatch trips a savedMatch-alone threshold just as readily as
        // the combined one and so doesn't actually pin R1-08's fix (the budget is against
        // gameState + messages + savedMatch together, not savedMatch in isolation). A ~2 MB gameState
        // pushes the combined total over 7 MB while leaving savedMatch itself well under it.
        const savedMatchString = 'x'.repeat(6 * 1024 * 1024);
        const gameStateString = 'y'.repeat(2 * 1024 * 1024);
        const report = buildReport({
            gameState: { phase: 'action', player1: {}, player2: {}, huge: gameStateString } as unknown as ISerializedReportState['gameState'],
            savedMatch: { formatVersion: 1, huge: savedMatchString } as unknown as ISavedMatch,
        });
        const success = await dispatcher.formatAndSendReportAsync(report, ReportType.BugReport);

        expect(success).toBeTrue();
        const fields = appendSpy.calls.allArgs().map((args) => args[0] as string);
        expect(fields).not.toContain('files[2]');

        const payloadJson = appendSpy.calls.allArgs().find((args) => args[0] === 'payload_json')[1] as string;
        expect(payloadJson).toContain('Omitted');
    });

    it('does not attach a saved match at all when none was provided (existing bug-report shape unaffected)', async function() {
        const dispatcher = buildDispatcher();
        spyOn(Util, 'httpPostFormData').and.resolveTo('ok');
        const getAppendedFields = spyOnAppends();

        const report = buildReport();
        const success = await dispatcher.formatAndSendReportAsync(report, ReportType.BugReport);

        expect(success).toBeTrue();
        expect(getAppendedFields()).not.toContain('files[2]');
    });

    it('still attaches chat messages as files[2] for a player report (unaffected by the bug-report saved-match guard)', async function() {
        const dispatcher = buildDispatcher();
        spyOn(Util, 'httpPostFormData').and.resolveTo('ok');
        const getAppendedFields = spyOnAppends();

        const report = buildReport({ chatMessages: [{ date: new Date(), message: 'hi' }] });
        const success = await dispatcher.formatAndSendReportAsync(report, ReportType.PlayerReport);

        expect(success).toBeTrue();
        expect(getAppendedFields()).toContain('files[2]');
    });
});
