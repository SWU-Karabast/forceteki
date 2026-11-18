import type { CardId, DeckLine } from '@swupgn/format';
import { parse } from '@swupgn/format';
import { validate } from '@swupgn/format/validate';
import type { SwuPgnFileView, SwuPgnWriter } from '../../../../server/game/core/swupgn/SwuPgnWriter';
import type { ISwuDbFormatCardEntry, ISwuDbFormatDecklist } from '../../../../server/utils/deck/DeckInterfaces';
import { Lobby } from '../../../../server/gamenode/Lobby';
import { premierBestOfOne } from '../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { TestClient } from '../../../helpers/server/TestClient';

/**
 * The SWU-PGN file of a game played through a real lobby: the decks come from the players' decklists
 * (`Player.lobbyDeck`), which no game built by the card test harness has, so this is the only spec of the `DECKS` lines a served
 * file will carry (W-47..W-49) and of the file's views being valid for such a game.
 */
describe('SWU-PGN file of a lobby game', function () {
    const views: SwuPgnFileView[] = ['full', 1, 2, 'public'];

    /** A decklist entry's id (`SOR_095`) as the card id `DECKS` names it by (`SOR#095`). */
    function cardIdOfEntry(id: string): CardId {
        const [set, num] = id.split('_');
        return `${set.toUpperCase()}#${num.padStart(3, '0')}`;
    }

    function countsOf(entries: readonly ISwuDbFormatCardEntry[] | undefined): [CardId, number][] {
        return (entries ?? []).map((entry): [CardId, number] => [cardIdOfEntry(entry.id), entry.count])
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    }

    /** A `DECKS` entry's count may be left out when it is 1. */
    function sorted(entries: readonly ([CardId, number] | [CardId])[] | undefined): [CardId, number][] {
        return (entries ?? []).map(([id, count]): [CardId, number] => [id, count ?? 1])
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    }

    /** What a seat's `DECKS` line holds for a decklist, without its seat. */
    function expectedLineOf(decklist: ISwuDbFormatDecklist) {
        return { main: countsOf(decklist.deck), sideboard: countsOf(decklist.sideboard) };
    }

    function actualLineOf(line: DeckLine) {
        return { main: sorted(line.main), sideboard: sorted(line.sideboard) };
    }

    function promptOf(client: TestClient) {
        return client.gameState?.players?.[client.id]?.promptState ?? {};
    }

    /**
     * Answers each seat's setup prompts the way a player would: takes the first choice offered (the coin flip, keeping
     * the opening hand), and picks the first selectable hand cards as resources, until the game reaches the action phase.
     */
    async function playIntoActionPhaseAsync(clients: TestClient[]): Promise<void> {
        for (let step = 0; step < 40 && clients[0].gameState?.phase !== 'action'; step++) {
            let answered = false;
            for (const client of clients) {
                const prompt = promptOf(client);
                const hand: { uuid: string; selectable?: boolean; selected?: boolean }[] =
                    client.gameState?.players?.[client.id]?.cardPiles?.hand ?? [];
                const toSelect = hand.find((card) => card.selectable && !card.selected);
                const buttons: { command?: string; arg: string | number; uuid?: string; disabled?: boolean; text?: string }[] = prompt.buttons ?? [];
                const enabled = buttons.filter((button) => !button.disabled);
                const done = enabled.find((button) => button.arg === 'done');
                if (toSelect && !done) {
                    await client.sendGameMessageAsync('cardClicked', toSelect.uuid);
                    answered = true;
                } else if (enabled.length > 0) {
                    const button = done ?? enabled.find((b) => b.text === 'Keep') ?? enabled[0];
                    await client.sendGameMessageAsync(button.command ?? 'menuButton', button.arg, button.uuid ?? prompt.promptUuid);
                    answered = true;
                }
            }
            if (!answered) {
                break;
            }
        }
    }

    serverIntegration(function (contextRef) {
        it('validates in every view and names each seat\'s decklist in DECKS, sideboard included', async function () {
            const { harness } = contextRef;
            const decklists = [harness.decklists.validDecklist({ sideboardSize: 3 }), harness.decklists.validDecklist()];
            expect(decklists[0].sideboard.length).toBe(3);

            const clients = decklists.map(() => harness.createClient());
            for (const [i, client] of clients.entries()) {
                const response = await client.enterQueueAsync({ deck: decklists[i], ...premierBestOfOne });
                expect(response.status).withContext(`${client.id} entering the queue`)
                    .toBe(200);
                await client.connectAsync();
            }
            await harness.clock.advanceAsync(Lobby.QuickLobbyCountdownMs);
            for (const client of clients) {
                expect(client.gameState).withContext(`${client.id} has a game state`)
                    .toBeDefined();
            }

            await playIntoActionPhaseAsync(clients);
            expect(clients[0].gameState.phase).withContext('the game reached the action phase')
                .toBe('action');

            // both seats pass: the game moves on to the regroup phase, its draws and its resource prompt
            for (let pass = 0; pass < 2; pass++) {
                const active = clients.find((client) => (promptOf(client).buttons ?? []).some((button) => button.arg === 'pass'));
                expect(active).withContext(`a seat can pass (pass ${pass + 1})`)
                    .toBeDefined();
                await active.sendGameMessageAsync('menuButton', 'pass', promptOf(active).promptUuid);
            }
            expect(clients[0].gameState.phase).withContext('both seats passed')
                .toBe('regroup');

            const writer: SwuPgnWriter | null | undefined = harness.server.testSwuPgnWriterFor(clients[0].id);
            expect(writer).withContext('the lobby game has a writer')
                .toBeTruthy();

            for (const view of views) {
                const report = validate(writer.fileFor(view));
                expect(report.level).withContext(`validate(fileFor(${view})): ${JSON.stringify(report.issues)}`)
                    .toBe('valid');
            }

            const full = parse(writer.fileFor('full'));
            expect(full.decks.map((line) => line.p)).toEqual([1, 2]);
            for (const line of full.decks) {
                expect(line.complete).toBeTrue();
            }
            // which seat each client sits in is the engine's choice: compare the two lines as a set
            const actual = full.decks.map(actualLineOf);
            const expected = decklists.map(expectedLineOf);
            expect(actual).toEqual(jasmine.arrayWithExactContents(expected));
            expect(full.decks.some((line) => line.sideboard?.length === 3)).withContext('the sideboard line')
                .toBeTrue();
            // a sideboard card is never loaded into the game, but the file still names it
            const named = new Set(full.cards.map((card) => card.id));
            for (const entry of decklists[0].sideboard) {
                expect(named.has(cardIdOfEntry(entry.id))).withContext(`CARDS names sideboard card ${entry.id}`)
                    .toBeTrue();
            }
            expect(full.header.WriterErrors).withContext('writer errors')
                .toBeUndefined();
            expect(writer.errors).toBe(0);
        });
    });
});
