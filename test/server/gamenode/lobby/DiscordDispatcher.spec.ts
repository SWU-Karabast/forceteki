import type FormData from 'form-data';
import * as Util from '../../../../server/Util';
import { DiscordDispatcher } from '../../../../server/gamenode/DiscordDispatcher';
import { SwuGameFormat } from '../../../../server/game/core/Constants';
import { MatchmakingType } from '../../../../server/gamenode/Lobby';
import { PlayerReportType, ReportType } from '../../../../server/game/Interfaces';
import type { ISerializedMessage, ISerializedReportState } from '../../../../server/game/Interfaces';

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

    const buildPlayerReport = (messages: ISerializedMessage[], chatMessages?: ISerializedMessage[]): ISerializedReportState => ({
        ...buildBugReport(messages),
        description: 'reported',
        playerReportType: PlayerReportType.ChatHarrasment,
        chatMessages,
    });

    /** Splits the multipart body into its file parts, keyed by form field name. */
    const getFileParts = (formData: FormData): Map<string, string> => {
        const body = formData.getBuffer().toString('utf8');
        const parts = body.split(`--${formData.getBoundary()}`);
        const files = new Map<string, string>();
        for (const part of parts) {
            const match = (/name="(files\[\d+\])"; filename="[^"]*"\r\nContent-Type: [^\r]*\r\n\r\n([\s\S]*)\r\n$/).exec(part);
            if (match) {
                files.set(match[1], match[2]);
            }
        }
        return files;
    };

    /** The `[name, value]` of each field in the message's embed. */
    const getEmbedFields = (formData: FormData): string[][] => {
        const body = formData.getBuffer().toString('utf8');
        const payloadJson = (/name="payload_json"\r\n\r\n(.*)\r\n/).exec(body)[1];
        return JSON.parse(payloadJson).embeds[0].fields.map((field: { name: string; value: string }) => [field.name, field.value]);
    };

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
                const files = getFileParts(sentForm);
                expect(files.get('files[0]')).toBe('null');
                expect(files.get('files[1]')).toBe('Reporter attacks');
            });

            it('never attaches an empty game log', async function() {
                const dispatcher = new DiscordDispatcher();

                await dispatcher.formatAndSendReportAsync(buildBugReport([]), ReportType.BugReport);

                const files = getFileParts(sentForm);
                expect(files.get('files[1]')).toBe(DiscordDispatcher.EmptyMessagesPlaceholder);
            });
        });

        describe('for a player report', function() {
            it('posts to the player report webhook with the reported player and the offense, and no game state', async function() {
                const dispatcher = new DiscordDispatcher();

                await dispatcher.formatAndSendReportAsync(buildPlayerReport([logMessage('Reporter attacks')], []), ReportType.PlayerReport);

                expect(sentUrl).toBe(playerReportWebhookUrl);
                const fields = getEmbedFields(sentForm);
                expect(fields).toContain(['Reported Player', 'Opponent (opponent-id)']);
                expect(fields).toContain(['Offense', PlayerReportType.ChatHarrasment]);
                expect(fields.map(([name]) => name)).not.toContain('Game State');
            });

            it('never attaches an empty chat log when the players did not chat', async function() {
                const dispatcher = new DiscordDispatcher();

                await dispatcher.formatAndSendReportAsync(buildPlayerReport([logMessage('Reporter attacks')], []), ReportType.PlayerReport);

                const files = getFileParts(sentForm);
                expect(files.get('files[1]')).toBe('Reporter attacks');
                expect(files.get('files[2]')).toBe(DiscordDispatcher.EmptyMessagesPlaceholder);
            });

            it('never attaches an empty game log', async function() {
                const dispatcher = new DiscordDispatcher();

                await dispatcher.formatAndSendReportAsync(buildPlayerReport([], [chatMessage(opponent.id, 'y', 'gg')]), ReportType.PlayerReport);

                const files = getFileParts(sentForm);
                expect(files.get('files[1]')).toBe(DiscordDispatcher.EmptyMessagesPlaceholder);
                expect(files.get('files[2]')).toBe('<Opponent>: gg');
            });
        });
    });
});
