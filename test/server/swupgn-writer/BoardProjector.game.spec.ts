import { AudienceTracker } from '../../../server/game/core/swupgn/AudienceTracker';
import { BoardProjector } from '../../../server/game/core/swupgn/BoardProjector';
import { SwuPgnWriterState } from '../../../server/game/core/swupgn/SwuPgnWriterState';

describe('BoardProjector game and seat entities', function() {
    integration(function(contextRef) {
        function project() {
            const { game } = contextRef.context;
            const state = new SwuPgnWriterState(game);
            return new BoardProjector(game, state, new AudienceTracker(game, state)).project();
        }

        // AttrValue is recursive and makes jasmine's expect() generics too deep, so read attributes as unknown.
        function attr(key: string, name: string): unknown {
            return project().entities[key].a[name];
        }

        function has(key: string, name: string): boolean {
            return name in project().entities[key].a;
        }

        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['battlefield-marine'], groundArena: ['wampa'], deck: ['atst', 'cartel-spacer'], hasForceToken: true, credits: 2 },
                player2: { hand: ['pyke-sentinel'] },
            });
        });

        it('projects the game entity', function () {
            const { game } = contextRef.context;
            const round: number = game.roundNumber;
            const claimed: boolean = game.isInitiativeClaimed;

            expect(attr('g', 'round')).toBe(round);
            expect(attr('g', 'phase')).toBe('action');
            expect(attr('g', 'active')).toBe(1);
            expect(attr('g', 'initiative')).toBe(1);
            expect(attr('g', 'initiativeTaken')).toBe(claimed);
            expect(has('g', 'result')).toBeFalse();
        });

        it('omits active outside the action phase (a board never holds null; the diff deletes it)', function () {
            const { context } = contextRef;
            context.player1.passAction();
            context.player2.passAction();

            expect(attr('g', 'phase')).toBe('regroup');
            expect(has('g', 'active')).toBeFalse();
        });

        it('maps the winner to a seat in result', function () {
            const { context } = contextRef;
            context.setDamage(context.p2Base, context.p2Base.getHp() - 1);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(attr('g', 'result')).toBe('p1');
            context.player1.clickPrompt('Continue Playing');
            context.player2.clickPrompt('Continue Playing');
        });

        it('writes no result, and reports an error once, for a winner no seat maps to', function () {
            const { game } = contextRef.context;
            // the undo suite runs this body a second time in the same spec, when the getters are spied on already
            const isSpied = (name: string) => jasmine.isSpy(Object.getOwnPropertyDescriptor(game, name)?.get);
            const isEnded = isSpied('isEnded') ? Object.getOwnPropertyDescriptor(game, 'isEnded').get as jasmine.Spy : spyOnProperty(game, 'isEnded', 'get');
            const winnerNames = isSpied('winnerNames') ? Object.getOwnPropertyDescriptor(game, 'winnerNames').get as jasmine.Spy : spyOnProperty(game, 'winnerNames', 'get');
            isEnded.and.returnValue(true);
            winnerNames.and.returnValue(['nobody at this table']);
            const errors: string[] = [];
            const state = new SwuPgnWriterState(game);
            const projector = new BoardProjector(game, state, new AudienceTracker(game, state), (what) => errors.push(what));

            expect('result' in projector.project().entities.g.a).toBeFalse();
            expect('result' in projector.projectFull().entities.g.a).toBeFalse();
            expect(errors).toEqual(['game result']);
            // the game's own writer projects again after the spec body (the suite-wide checks): the real game has not ended
            isEnded.and.callThrough();
            winnerNames.and.callThrough();
        });

        it('projects the seat entities', function () {
            const [p1, p2] = contextRef.context.game.getPlayers();

            expect(attr('p1', 'deckCount')).toBe(p1.drawDeck.length);
            expect(attr('p1', 'handCount')).toBe(p1.hand.length);
            expect(attr('p2', 'handCount')).toBe(p2.hand.length);
        });

        it('projects credits and the Force when present', function () {
            expect(attr('p1', 'credits')).toBe(2);
            expect(attr('p1', 'force')).toBeTrue();
            expect(has('p2', 'credits')).toBeFalse();
            expect(has('p2', 'force')).toBeFalse();
        });

        it('carries no fixed fields on g, p1 or p2', function () {
            for (const key of ['g', 'p1', 'p2']) {
                for (const field of ['zone', 'owner', 'controller', 'parent', 'rel']) {
                    expect(field in project().entities[key]).toBeFalse();
                }
            }
        });
    });
});
