import type { Board, Entity } from '@swupgn/format';
import type { Card } from '../../../server/game/core/card/Card';
import { BoardProjector } from '../../../server/game/core/swupgn/BoardProjector';
import { SwuPgnWriterState } from '../../../server/game/core/swupgn/SwuPgnWriterState';

describe('BoardProjector effects and ability uses', function() {
    integration(function(contextRef) {
        let state: SwuPgnWriterState;

        // One state per test, so ids persist across projections the way they do in the writer.
        function writerState(): SwuPgnWriterState {
            state ??= new SwuPgnWriterState(contextRef.context.game);
            return state;
        }

        function project(): Board {
            return new BoardProjector(contextRef.context.game, writerState(), null).project();
        }

        function idOf(card: Card): number {
            return writerState().entityIdFor(writerState().cardKey(card));
        }

        // AttrValue is recursive and makes jasmine's expect() generics too deep, so read attributes as unknown.
        function attrsOf(entity: Entity): Record<string, unknown> {
            return entity.a;
        }

        function effects(board: Board = project()): Entity[] {
            return Object.values(board.entities).filter((entity) => entity.a.kind === 'effect');
        }

        function entityOf(card: Card, board: Board = project()): Entity {
            const entity = board.entities[String(idOf(card))];
            expect(entity).withContext(`no entity for ${card.internalName}`)
                .toBeDefined();
            return entity;
        }

        beforeEach(function () {
            state = undefined;
        });

        describe('lasting effects', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bold-resistance'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('creates one effect entity for a phase-long stat change and removes it when the phase ends', function () {
                const { context } = contextRef;
                expect(effects()).toEqual([]);

                context.player1.clickCard(context.boldResistance);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                const board = project();
                const found = effects(board);
                expect(found.length).toBe(1);
                const effect = found[0];
                expect('zone' in effect).toBeFalse();
                expect('card' in effect).toBeFalse();
                expect(effect.owner).toBe(1);
                expect(effect.to).toBe('all');
                expect(attrsOf(effect)).toEqual({
                    kind: 'effect',
                    src: idOf(context.boldResistance),
                    targets: [idOf(context.wampa)],
                    duration: 'phase'
                });

                context.moveToRegroupPhase();
                expect(effects()).toEqual([]);
            });

            it('keeps the effect\'s audience frozen at creation', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.boldResistance);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();

                const first = effects()[0];
                const key = Object.keys(project().entities).find((id) => project().entities[id].a.kind === 'effect');
                expect(key).toBeDefined();

                // the source is in discard (public); the audience is read back from state afterwards
                context.player1.moveCard(context.boldResistance, 'hand');
                const again = project().entities[key];
                expect(again.to).toBe(first.to);
                expect(again.to).toBe('all');
            });
        });

        describe('constant abilities', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-dodonna#massassi-group-commander', 'battlefield-marine']
                    }
                });
            });

            it('creates no effect entity for a persistent aura', function () {
                const { context } = contextRef;
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(effects()).toEqual([]);
            });
        });

        describe('delayed effects', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'battlefield-marine'],
                        leader: 'han-solo#audacious-smuggler',
                        resources: 4
                    }
                });
            });

            it('has duration delayed and is removed once it fires', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.battlefieldMarine);

                const delayed = effects().filter((effect) => effect.a.duration === 'delayed');
                expect(delayed.length).toBe(1);
                expect(attrsOf(delayed[0])).toEqual({
                    kind: 'effect',
                    src: idOf(context.sneakAttack),
                    targets: [idOf(context.battlefieldMarine)],
                    duration: 'delayed'
                });
                expect(delayed[0].owner).toBe(1);

                context.moveToRegroupPhase();
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(effects().filter((effect) => effect.a.duration === 'delayed')).toEqual([]);
            });
        });

        describe('ability uses', function () {
            const prompt = 'Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack';

            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'chewbacca#relentless-rebel', deployed: true },
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['porg']
                    }
                });
            });

            it('records a once-per-round action on the leader and deletes it when the round resets', function () {
                const { context } = contextRef;
                expect('abilityUses' in entityOf(context.chewbacca).a).toBeFalse();

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt(prompt);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);

                const uses = attrsOf(entityOf(context.chewbacca)).abilityUses;
                expect(uses).toEqual([{ ability: jasmine.any(String), seat: 1, count: 1, per: 'round', max: 1 }]);
                expect('abilityUses' in entityOf(context.wampa).a).toBeFalse();

                context.moveToNextActionPhase();
                expect('abilityUses' in entityOf(context.chewbacca).a).toBeFalse();
            });
        });
    });
});
