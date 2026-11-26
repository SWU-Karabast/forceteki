import type FormData from 'form-data';
import * as Util from '../../../../server/Util';
import { DiscordDispatcher } from '../../../../server/gamenode/DiscordDispatcher';
import { GameErrorSeverity, SwuGameFormat } from '../../../../server/game/core/Constants';
import { MatchmakingType } from '../../../../server/gamenode/Lobby';
import { PlayerReportType, ReportType } from '../../../../server/game/Interfaces';
import { getDiscordEmbedFields, getDiscordFileParts } from '../../../helpers/server/DiscordWebhookForms';
import type { IGameErrorHistory, IGameErrorRecord, ISerializedMessage, ISerializedReportState } from '../../../../server/game/Interfaces';

describe('DiscordDispatcher', function() {
    const reporter = { id: 'reporter-id', username: 'Reporter', playerInGameState: 'player1' };
    const opponent = { id: 'opponent-id', username: 'Opponent', playerInGameState: 'player2' };

    const chatMessage = (id: string, name: string, text: string): ISerializedMessage => ({
        date: new Date(),
        message: [{ type: 'playerChat', id, name }, ': ', text]
    } as unknown as ISerializedMessage);

    const logMessage = (text: string): ISerializedMessage => ({
        date: new Date(),
        message: [text]
    } as unknown as ISerializedMessage);

    const buildBugReport = (messages: ISerializedMessage[]): ISerializedReportState => ({
        description: 'card did not trigger',
        gameState: null,
        playerReportType: null,
        reporter,
        opponent,
        lobbyId: 'lobby-id',
        timestamp: new Date().toISOString(),
        messages,
        gameStepsSinceLastUndo: '0',
        gameId: 'game-id',
        gameFormat: SwuGameFormat.Premier,
        matchType: MatchmakingType.PrivateLobby,
    });

    const gameError = (message: string, stack?: string): IGameErrorRecord => ({
        timestamp: '2026-01-01T00:00:00.000Z',
        severity: GameErrorSeverity.Normal,
        message,
        stack,
    });

    const buildPlayerReport = (messages: ISerializedMessage[], chatMessages?: ISerializedMessage[]): ISerializedReportState => ({
        ...buildBugReport(messages),
        description: 'reported',
        playerReportType: PlayerReportType.ChatHarrasment,
        chatMessages,
    });

    describe('formatMessagesToAttachmentText', function() {
        it('returns a placeholder instead of an empty string when there are no messages', function() {
            expect(DiscordDispatcher.formatMessagesToAttachmentText([], reporter.id, opponent.id, reporter.username, opponent.username))
                .toBe(DiscordDispatcher.EmptyMessagesPlaceholder);
            expect(DiscordDispatcher.formatMessagesToAttachmentText(undefined, reporter.id, opponent.id, reporter.username, opponent.username))
                .toBe(DiscordDispatcher.EmptyMessagesPlaceholder);
        });

        it('formats player chat with the reporter and opponent usernames', function() {
            const text = DiscordDispatcher.formatMessagesToAttachmentText(
                [chatMessage(reporter.id, 'x', 'hi'), chatMessage(opponent.id, 'y', 'go away')],
                reporter.id, opponent.id, reporter.username, opponent.username
            );
            expect(text).toBe('<Reporter>: hi\n<Opponent>: go away');
        });
    });

    describe('formatGameErrorsToText', function() {
        it('lists the errors oldest first, each with its stack', function() {
            const text = DiscordDispatcher.formatGameErrorsToText({ totalCount: 2, errors: [gameError('first', 'Error: first\n    at somewhere'), gameError('second')] });

            expect(text).toBe('[2026-01-01T00:00:00.000Z] (normal) first\nError: first\n    at somewhere\n\n[2026-01-01T00:00:00.000Z] (normal) second');
        });

        it('says when older errors were left out', function() {
            const text = DiscordDispatcher.formatGameErrorsToText({ totalCount: 25, errors: [gameError('first'), gameError('second')] });

            expect(text).toBe('Showing the last 2 of 25 errors\n\n[2026-01-01T00:00:00.000Z] (normal) first\n\n[2026-01-01T00:00:00.000Z] (normal) second');
        });
    });

    describe('formatAndSendReportAsync', function() {
        const bugReportWebhookUrl = 'https://discord.invalid/bug-report-webhook';
        const playerReportWebhookUrl = 'https://discord.invalid/player-report-webhook';
        let originalBugReportWebhookUrl: string | undefined;
        let originalPlayerReportWebhookUrl: string | undefined;
        let sentUrl: string | null;
        let sentForm: FormData | null;

        beforeEach(function() {
            originalBugReportWebhookUrl = process.env.DISCORD_BUG_REPORT_WEBHOOK_URL;
            originalPlayerReportWebhookUrl = process.env.DISCORD_PLAYER_REPORT_WEBHOOK_URL;
            process.env.DISCORD_BUG_REPORT_WEBHOOK_URL = bugReportWebhookUrl;
            process.env.DISCORD_PLAYER_REPORT_WEBHOOK_URL = playerReportWebhookUrl;
            sentUrl = null;
            sentForm = null;
            spyOn(Util, 'httpPostFormData').and.callFake((url: string, formData: FormData) => {
                sentUrl = url;
                sentForm = formData;
                return Promise.resolve('');
            });
        });

        afterEach(function() {
            if (originalBugReportWebhookUrl === undefined) {
                delete process.env.DISCORD_BUG_REPORT_WEBHOOK_URL;
            } else {
                process.env.DISCORD_BUG_REPORT_WEBHOOK_URL = originalBugReportWebhookUrl;
            }
            if (originalPlayerReportWebhookUrl === undefined) {
                delete process.env.DISCORD_PLAYER_REPORT_WEBHOOK_URL;
            } else {
                process.env.DISCORD_PLAYER_REPORT_WEBHOOK_URL = originalPlayerReportWebhookUrl;
            }
        });

        describe('for a bug report', function() {
            it('posts to the bug report webhook, attaching the game state and the game log', async function() {
                const dispatcher = new DiscordDispatcher();

                await dispatcher.formatAndSendReportAsync(buildBugReport([logMessage('Reporter attacks')]), ReportType.BugReport);

                expect(sentUrl).toBe(bugReportWebhookUrl);
                const files = getDiscordFileParts(sentForm);
                expect(files.get('files[0]')).toBe('null');
                expect(files.get('files[1]')).toBe('Reporter attacks');
            });

            it('never attaches an empty game log', async function() {
                const dispatcher = new DiscordDispatcher();

                await dispatcher.formatAndSendReportAsync(buildBugReport([]), ReportType.BugReport);

                const files = getDiscordFileParts(sentForm);
                expect(files.get('files[1]')).toBe(DiscordDispatcher.EmptyMessagesPlaceholder);
            });

            it('attaches the earlier game errors and counts them in the embed when there were any', async function() {
                const dispatcher = new DiscordDispatcher();
                const gameErrors: IGameErrorHistory = { totalCount: 1, errors: [gameError('boom', 'Error: boom\n    at somewhere')] };

                await dispatcher.formatAndSendReportAsync({ ...buildBugReport([]), gameErrors }, ReportType.BugReport);

                expect(getDiscordFileParts(sentForm).get('files[2]')).toBe('[2026-01-01T00:00:00.000Z] (normal) boom\nError: boom\n    at somewhere');
                expect(getDiscordEmbedFields(sentForm)).toContain(['Game Errors', '1']);
            });

            it('attaches no game errors file when there were none', async function() {
                const dispatcher = new DiscordDispatcher();

                await dispatcher.formatAndSendReportAsync({ ...buildBugReport([]), gameErrors: { totalCount: 0, errors: [] } }, ReportType.BugReport);
                expect(getDiscordFileParts(sentForm).has('files[2]')).toBeFalse();
                expect(getDiscordEmbedFields(sentForm)).toContain(['Game Errors', '0']);

                await dispatcher.formatAndSendReportAsync(buildBugReport([]), ReportType.BugReport);
                expect(getDiscordFileParts(sentForm).has('files[2]')).toBeFalse();
            });
        });

        describe('for a player report', function() {
            it('posts to the player report webhook with the reported player and the offense, and no game state', async function() {
                const dispatcher = new DiscordDispatcher();

                await dispatcher.formatAndSendReportAsync(buildPlayerReport([logMessage('Reporter attacks')], []), ReportType.PlayerReport);

                expect(sentUrl).toBe(playerReportWebhookUrl);
                const fields = getDiscordEmbedFields(sentForm);
                expect(fields).toContain(['Reported Player', 'Opponent (opponent-id)']);
                expect(fields).toContain(['Offense', PlayerReportType.ChatHarrasment]);
                expect(fields.map(([name]) => name)).not.toContain('Game State');
            });

            it('never attaches an empty chat log when the players did not chat', async function() {
                const dispatcher = new DiscordDispatcher();

                await dispatcher.formatAndSendReportAsync(buildPlayerReport([logMessage('Reporter attacks')], []), ReportType.PlayerReport);

                const files = getDiscordFileParts(sentForm);
                expect(files.get('files[1]')).toBe('Reporter attacks');
                expect(files.get('files[2]')).toBe(DiscordDispatcher.EmptyMessagesPlaceholder);
            });

            it('never attaches an empty game log', async function() {
                const dispatcher = new DiscordDispatcher();

                await dispatcher.formatAndSendReportAsync(buildPlayerReport([], [chatMessage(opponent.id, 'y', 'gg')]), ReportType.PlayerReport);

                const files = getDiscordFileParts(sentForm);
                expect(files.get('files[1]')).toBe(DiscordDispatcher.EmptyMessagesPlaceholder);
                expect(files.get('files[2]')).toBe('<Opponent>: gg');
            });
        });
    });

    describe('formatAndSendServerErrorAsync', function() {
        const serverErrorWebhookUrl = 'https://discord.invalid/server-error-webhook';
        let originalServerErrorWebhookUrl: string | undefined;
        let sentForm: FormData | null;

        beforeEach(function() {
            originalServerErrorWebhookUrl = process.env.DISCORD_ERROR_REPORT_WEBHOOK_URL;
            process.env.DISCORD_ERROR_REPORT_WEBHOOK_URL = serverErrorWebhookUrl;
            sentForm = null;
            spyOn(Util, 'httpPostFormData').and.callFake((_url: string, formData: FormData) => {
                sentForm = formData;
                return Promise.resolve('');
            });
        });

        afterEach(function() {
            if (originalServerErrorWebhookUrl === undefined) {
                delete process.env.DISCORD_ERROR_REPORT_WEBHOOK_URL;
            } else {
                process.env.DISCORD_ERROR_REPORT_WEBHOOK_URL = originalServerErrorWebhookUrl;
            }
        });

        const sendServerErrorAsync = (dispatcher: DiscordDispatcher, earlierGameErrors?: IGameErrorHistory) =>
            dispatcher.formatAndSendServerErrorAsync(
                'Severe game error reported', new Error('current'), null, [], 'lobby-id', reporter.id, opponent.id,
                SwuGameFormat.Premier, MatchmakingType.PrivateLobby, 0, earlierGameErrors
            );

        it('attaches the earlier game errors next to the stack trace of the current one', async function() {
            const dispatcher = new DiscordDispatcher();

            await sendServerErrorAsync(dispatcher, { totalCount: 1, errors: [gameError('earlier')] });

            const files = getDiscordFileParts(sentForm);
            expect(files.get('files[2]')).toContain('Error: current');
            expect(files.get('files[3]')).toBe('[2026-01-01T00:00:00.000Z] (normal) earlier');
            expect(getDiscordEmbedFields(sentForm)).toContain(['Earlier Game Errors', '1']);
        });

        it('attaches no earlier errors file when there were none', async function() {
            const dispatcher = new DiscordDispatcher();

            await sendServerErrorAsync(dispatcher, { totalCount: 0, errors: [] });
            expect(getDiscordFileParts(sentForm).has('files[3]')).toBeFalse();
            expect(getDiscordEmbedFields(sentForm)).toContain(['Earlier Game Errors', '0']);

            await sendServerErrorAsync(dispatcher);
            expect(getDiscordFileParts(sentForm).has('files[3]')).toBeFalse();
        });
    });
});
