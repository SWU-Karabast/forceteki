import { ATTRIBUTES } from '@swupgn/format';
import type { Player } from '../../../server/game/core/Player';
import { PROJECTION_MANIFEST } from './ProjectionManifest';

/** The entity fields that are not attributes. */
const ENTITY_FIELDS = ['zone', 'owner', 'controller', 'parent', 'rel', 'card'];

type Summary = Record<string, unknown>;

/** The nested objects of a player summary whose keys are classified one by one. */
const NESTED_OBJECTS = ['cardPiles', 'forceToken'];

describe('Projection manifest', function() {
    integration(function(contextRef) {
        // every summary key seen anywhere on the board, from either player's perspective
        const seen = new Set<string>();

        function noteCard(summary: Summary | undefined): void {
            for (const key of Object.keys(summary ?? {})) {
                seen.add(key);
            }
        }

        function notePlayer(player: Player, perspective: Player): void {
            const summary = player.getStateSummary(perspective) as Summary;
            for (const [key, value] of Object.entries(summary)) {
                if (NESTED_OBJECTS.includes(key)) {
                    for (const inner of Object.keys(value as Summary)) {
                        seen.add(`player.${key}.${inner}`);
                    }
                } else {
                    seen.add(`player.${key}`);
                }
            }
            const piles = summary.cardPiles as Record<string, Summary[]>;
            for (const pile of Object.values(piles)) {
                pile.forEach(noteCard);
            }
            (summary.leaders as Summary[]).forEach(noteCard);
            noteCard(summary.base as Summary);
            noteCard(summary.topCardOfDeck as Summary | undefined);
            // upgrades of a base are nested summaries
            for (const base of [summary.base as Summary]) {
                ((base.upgrades ?? []) as Summary[]).forEach(noteCard);
            }
        }

        function noteBoard(): void {
            const players = contextRef.context.game.getPlayers();
            for (const perspective of players) {
                for (const player of players) {
                    notePlayer(player, perspective);
                }
            }
        }

        beforeEach(async function () {
            seen.clear();
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    base: 'echo-base',
                    hand: ['vanquish', 'battlefield-marine'],
                    resources: ['pyke-sentinel', 'cartel-spacer', 'atst', 'wampa', 'alliance-xwing', 'avenger#hunting-star-destroyer'],
                    discard: ['repair'],
                    deck: ['atst', 'cartel-spacer'],
                    groundArena: [
                        { card: 'wampa', damage: 1, upgrades: ['academy-training', 'shield', 'experience'], capturedUnits: ['battlefield-marine'] },
                        'battle-droid'
                    ],
                    spaceArena: [{ card: 'fireball#an-explosion-with-wings', upgrades: ['paige-tico#dropping-the-hammer'] }],
                    hasForceToken: true,
                    credits: 2
                },
                player2: {
                    leader: 'chancellor-palpatine#playing-both-sides',
                    base: { card: 'kestro-city', capturedUnits: ['pyke-sentinel'] },
                    hand: ['wampa'],
                    groundArena: [{ card: 'atst', damage: 2 }],
                    discard: ['cartel-spacer']
                }
            });
        });

        it('classifies every summary field the engine sends the client', function () {
            const { context } = contextRef;
            noteBoard();

            // a prompt with selectable cards adds the selection fields
            context.player1.clickCard(context.vanquish);
            noteBoard();
            context.player1.clickPrompt('Cancel');

            const unclassified = [...seen].filter((key) => !(key in PROJECTION_MANIFEST)).sort();
            expect(unclassified).withContext('summary fields with no ProjectionManifest row')
                .toEqual([]);
        });

        it('names a registry attribute or entity field for every recordedAs row', function () {
            const names = new Set([...ATTRIBUTES.map((attribute) => attribute.name), ...ENTITY_FIELDS]);
            for (const [field, row] of Object.entries(PROJECTION_MANIFEST)) {
                if ('recordedAs' in row) {
                    expect(names.has(row.recordedAs)).withContext(`${field} -> ${row.recordedAs}`)
                        .toBeTrue();
                }
            }
        });

        it('gives every uiOnly and registryGap row a reason', function () {
            for (const [field, row] of Object.entries(PROJECTION_MANIFEST)) {
                const reason = 'uiOnly' in row ? row.uiOnly : 'registryGap' in row ? row.registryGap : 'recordedAs';
                expect(reason.trim().length).withContext(field)
                    .toBeGreaterThan(0);
            }
        });
    });
});
