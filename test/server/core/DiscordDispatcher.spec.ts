import type FormData from 'form-data';
import * as Util from '../../../server/Util';
import { DiscordDispatcher } from '../../../server/game/core/DiscordDispatcher';
import { SwuGameFormat } from '../../../server/game/core/Constants';
import { MatchmakingType } from '../../../server/gamenode/Lobby';
import { PlayerReportType, ReportType } from '../../../server/game/Interfaces';
import type { ISerializedMessage, ISerializedReportState } from '../../../server/game/Interfaces';

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

    const buildPlayerReport = (messages: ISerializedMessage[], chatMessages?: ISerializedMessage[]): ISerializedReportState => ({
        description: 'reported',
        gameState: null,
        playerReportType: PlayerReportType.ChatHarrasment,
        reporter,
        opponent,
        lobbyId: 'lobby-id',
        timestamp: new Date().toISOString(),
        messages,
        chatMessages,
        gameStepsSinceLastUndo: '0',
        gameId: 'game-id',
        gameFormat: SwuGameFormat.Premier,
        matchType: MatchmakingType.PrivateLobby,
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
        let originalWebhookUrl: string | undefined;
        let sentForm: FormData | null;

        beforeEach(function() {
            originalWebhookUrl = process.env.DISCORD_PLAYER_REPORT_WEBHOOK_URL;
            process.env.DISCORD_PLAYER_REPORT_WEBHOOK_URL = 'https://discord.invalid/webhook';
            sentForm = null;
            spyOn(Util, 'httpPostFormData').and.callFake((_url: string, formData: FormData) => {
                sentForm = formData;
                return Promise.resolve('');
            });
        });

        afterEach(function() {
            if (originalWebhookUrl === undefined) {
                delete process.env.DISCORD_PLAYER_REPORT_WEBHOOK_URL;
            } else {
                process.env.DISCORD_PLAYER_REPORT_WEBHOOK_URL = originalWebhookUrl;
            }
        });

        it('never attaches an empty chat log when the players did not chat', async function() {
            const dispatcher = new DiscordDispatcher();
            const report = buildPlayerReport([logMessage('Reporter attacks')], []);

            await dispatcher.formatAndSendReportAsync(report, ReportType.PlayerReport);

            const files = getFileParts(sentForm);
            expect(files.get('files[1]')).toBe('Reporter attacks');
            expect(files.get('files[2]')).toBe(DiscordDispatcher.EmptyMessagesPlaceholder);
        });

        it('never attaches an empty game log', async function() {
            const dispatcher = new DiscordDispatcher();
            const report = buildPlayerReport([], [chatMessage(opponent.id, 'y', 'gg')]);

            await dispatcher.formatAndSendReportAsync(report, ReportType.PlayerReport);

            const files = getFileParts(sentForm);
            expect(files.get('files[1]')).toBe(DiscordDispatcher.EmptyMessagesPlaceholder);
            expect(files.get('files[2]')).toBe('<Opponent>: gg');
        });
    });
});
