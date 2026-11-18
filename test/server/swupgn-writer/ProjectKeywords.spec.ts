import type { Board, Entity } from '@swupgn/format';
import type { Card } from '../../../server/game/core/card/Card';
import { cardIdOf } from '../../../server/game/core/swupgn/SwuPgnCardIds';

/**
 * The `keywords` attribute follows the registry row: sorted, lower case, stacked as CR 7.5.4 says. A numbered keyword
 * appears once with its numbers added, a keyword with a cost or a dash and an ability once per instance by name, any
 * other keyword once. The engine's `card.keywords` already stacks them (`KeywordHelpers.dedupeKeywords`); this pins
 * that the written attribute does too.
 */
describe('SWU-PGN keywords attribute', function() {
    integration(function(contextRef) {
        function keywordsOf(card: Card): unknown {
            const writer = contextRef.context.game.swuPgnWriter;
            expect(writer).withContext('the game has a writer')
                .not.toBeNull();
            const board: Board = writer.currentBoard();
            const entities = Object.values<Entity>(board.entities)
                .filter((entity) => entity.card === cardIdOf(card));
            expect(entities.length).withContext(`entities for ${card.internalName}`)
                .toBe(1);
            return entities[0].a?.keywords;
        }

        it('adds the numbers of a numbered keyword, keeps a non-stacking keyword once and a dash keyword per instance (CR 7.5.4)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wookiee-guerilla', { card: 'pyke-sentinel', upgrades: ['protector'] }],
                    spaceArena: ['red-three#unstoppable']
                },
                player2: {
                    groundArena: [{ card: 'guavian-antagonizer', upgrades: ['death-mark'] }]
                }
            });
            const { context } = contextRef;

            // printed Raid 2, and Raid 1 from Red Three
            expect(keywordsOf(context.wookieeGuerilla)).toEqual(['hidden', 'raid 3']);
            // printed Sentinel, and Sentinel from Protector
            expect(keywordsOf(context.pykeSentinel)).toEqual(['sentinel']);
            // printed Bounty, and Death Mark's Bounty: each is its own ability
            expect(keywordsOf(context.guavianAntagonizer)).toEqual(['bounty', 'bounty', 'saboteur']);
        });
    });
});
