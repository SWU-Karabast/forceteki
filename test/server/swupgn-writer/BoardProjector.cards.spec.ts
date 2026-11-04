import type { Board, Entity } from '@swupgn/format';
import type { Card } from '../../../server/game/core/card/Card';
import { cardIdOf } from '../../../server/game/core/swupgn/SwuPgnCardIds';
import { AudienceTracker } from '../../../server/game/core/swupgn/AudienceTracker';
import { BoardProjector } from '../../../server/game/core/swupgn/BoardProjector';
import { SwuPgnWriterState } from '../../../server/game/core/swupgn/SwuPgnWriterState';

describe('BoardProjector card and token entities', function() {
    integration(function(contextRef) {
        let state: SwuPgnWriterState;

        // One state per test, so ids persist across projections the way they do in the writer.
        function writerState(): SwuPgnWriterState {
            state ??= new SwuPgnWriterState(contextRef.context.game);
            return state;
        }

        function project(): Board {
            return new BoardProjector(contextRef.context.game, writerState(), new AudienceTracker(contextRef.context.game, writerState())).project();
        }

        function idOf(card: Card): number {
            return writerState().entityIdFor(writerState().cardKey(card));
        }

        function entityOf(card: Card, board: Board = project()): Entity {
            const entity = board.entities[String(idOf(card))];
            expect(entity).withContext(`no entity for ${card.internalName}`)
                .toBeDefined();
            return entity;
        }

        // AttrValue is recursive and makes jasmine's expect() generics too deep, so read attributes as unknown.
        function attr(card: Card, name: string): unknown {
            return entityOf(card).a[name];
        }

        function has(card: Card, name: string): boolean {
            return name in entityOf(card).a;
        }

        function entitiesWithCard(prefix: string, board: Board = project()): Entity[] {
            return Object.values(board.entities).filter((entity) => entity.card?.startsWith(prefix));
        }

        beforeEach(function () {
            state = undefined;
        });

        describe('in-play units and upgrades', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: [{ card: 'wampa', upgrades: ['academy-training', 'shield'] }, 'chopper#spectre-three'],
                        spaceArena: ['red-three#unstoppable'],
                        resources: ['pyke-sentinel', 'cartel-spacer'],
                        discard: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 2 }]
                    }
                });
            });

            it('gives a unit its zone, kind, owner and current power and hp after an upgrade', function () {
                const { context } = contextRef;
                const wampa = entityOf(context.wampa);

                expect(wampa.zone).toBe('ground');
                expect(wampa.owner).toBe(1);
                expect('controller' in wampa).toBeFalse();
                expect(wampa.card).toBe(cardIdOf(context.wampa));
                expect(wampa.to).toBe('all');
                expect(attr(context.wampa, 'kind')).toBe('unit');
                expect(attr(context.wampa, 'power')).toBe(6);
                expect(attr(context.wampa, 'hp')).toBe(7);
                expect(attr(context.wampa, 'exhausted')).toBe(false);
            });

            it('writes damage 0 on an undamaged unit and the count on a damaged one', function () {
                const { context } = contextRef;

                expect(attr(context.wampa, 'damage')).toBe(0);
                expect(attr(context.atst, 'damage')).toBe(2);
            });

            it('attaches the upgrade to its unit', function () {
                const { context } = contextRef;
                const upgrade = entityOf(context.academyTraining);

                expect(upgrade.parent).toBe(idOf(context.wampa));
                expect(upgrade.rel).toBe('attached');
                expect(upgrade.zone).toBe('ground');
                expect(attr(context.academyTraining, 'kind')).toBe('upgrade');
                expect(has(context.academyTraining, 'power')).toBeFalse();
                expect(has(context.academyTraining, 'damage')).toBeFalse();
            });

            it('projects a shield token as an attached token entity', function () {
                const { context } = contextRef;
                const shields = entitiesWithCard('TOKEN:shield#');

                expect(shields.length).toBe(1);
                expect(shields[0].parent).toBe(idOf(context.wampa));
                expect(shields[0].rel).toBe('attached');
                expect(shields[0].zone).toBe('ground');
                const kind: unknown = shields[0].a.kind;
                expect(kind).toBe('token');
            });

            it('writes a numbered keyword once with its sum, and traits in lower case', function () {
                const { context } = contextRef;

                expect(attr(context.chopper, 'keywords')).toEqual(['raid 2']);
                expect(attr(context.wampa, 'traits')).toEqual(['creature']);
                expect(attr(context.redThree, 'traits')).toEqual(['fighter', 'rebel', 'vehicle']);
            });

            it('gives resources their exhausted state and an owner-only audience', function () {
                const { context } = contextRef;
                const [first, second] = context.player1.resources;
                context.player1.exhaustResources(1);

                const resource = entityOf(first);
                expect(resource.zone).toBe('resource');
                expect(resource.to).toEqual([1]);
                expect(attr(first, 'exhausted')).toBe(first.exhausted);
                expect(attr(second, 'exhausted')).toBe(second.exhausted);
                expect([attr(first, 'exhausted'), attr(second, 'exhausted')]).toContain(true);
            });

            it('gives a card in hand an owner-only audience and a card in discard a public one', function () {
                const { context } = contextRef;

                expect(entityOf(context.battlefieldMarine).zone).toBe('hand');
                expect(entityOf(context.battlefieldMarine).to).toEqual([1]);
                expect(entityOf(context.allianceXwing).zone).toBe('discard');
                expect(entityOf(context.allianceXwing).to).toBe('all');
            });

            it('writes no deck entities', function () {
                const { context } = contextRef;
                const board = project();
                const deckEntities = Object.values(board.entities).filter((entity) => entity.zone === 'deck');

                expect(deckEntities.length).toBe(0);
                expect(context.player1.deck.length).toBeGreaterThan(0);
            });

            it('projects the bases and leaders in the base zone', function () {
                const { context } = contextRef;

                expect(entityOf(context.p1Base).zone).toBe('base');
                expect(attr(context.p1Base, 'kind')).toBe('base');
                expect(attr(context.p1Base, 'damage')).toBe(0);
                expect(attr(context.p1Base, 'hp')).toBe(context.p1Base.getHp());
                expect(attr(context.p1Base, 'defeated')).toBe(false);
                expect(entityOf(context.p2Leader).zone).toBe('base');
                expect(entityOf(context.p2Leader).owner).toBe(2);
                expect(attr(context.p2Leader, 'kind')).toBe('leader');
                expect(attr(context.p2Leader, 'deployed')).toBe(false);
                expect(attr(context.p2Leader, 'epicActionUsed')).toBe(false);
                expect(attr(context.p2Leader, 'exhausted')).toBe(false);
            });

            it('gives the same ids and the same board when nothing changed', function () {
                const first = project();
                const second = project();

                expect(second).toEqual(first);
            });

            it('makes a card that went into the deck and came back a new entity', function () {
                const { context } = contextRef;
                project();
                const before = idOf(context.battlefieldMarine);

                context.player1.moveCard(context.battlefieldMarine, 'deck');
                writerState().bumpGeneration(context.battlefieldMarine);
                context.player1.moveCard(context.battlefieldMarine, 'hand');

                const board = project();
                const after = idOf(context.battlefieldMarine);
                expect(after).not.toBe(before);
                expect(board.entities[String(after)].zone).toBe('hand');
                expect(String(before) in board.entities).toBeFalse();
            });
        });

        describe('pilots', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        hand: ['eject'],
                        spaceArena: ['fireball#an-explosion-with-wings', { card: 'alliance-xwing', upgrades: ['paige-tico#dropping-the-hammer'] }]
                    }
                });
            });

            it('attaches a leader deployed as a pilot to its vehicle', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Deploy Kazuda Xiono as a pilot');
                context.player1.clickCard(context.fireball);

                const pilot = entityOf(context.kazudaXiono);
                expect(pilot.parent).toBe(idOf(context.fireball));
                expect(pilot.rel).toBe('pilot');
                expect(pilot.zone).toBe('space');
                expect(attr(context.kazudaXiono, 'kind')).toBe('leader');
                expect(attr(context.kazudaXiono, 'deployed')).toBe(true);
                // the engine holds no ready state for an attached pilot, so there is nothing to write
                expect(has(context.kazudaXiono, 'exhausted')).toBeFalse();
                expect(has(context.kazudaXiono, 'damage')).toBeFalse();
                expect(attr(context.fireball, 'power')).toBe(context.fireball.getPower());
                expect(attr(context.fireball, 'leaderUnit')).toBe(true);
            });

            it('attaches a unit pilot with rel pilot, and detaches it with its own stats', function () {
                const { context } = contextRef;
                const attached = entityOf(context.paigeTico);
                expect(attached.parent).toBe(idOf(context.allianceXwing));
                expect(attached.rel).toBe('pilot');
                expect(attr(context.paigeTico, 'kind')).toBe('upgrade');
                expect(has(context.paigeTico, 'power')).toBeFalse();

                context.player1.clickCard(context.eject);
                context.player1.clickCard(context.paigeTico);

                const detached = entityOf(context.paigeTico);
                expect('parent' in detached).toBeFalse();
                expect('rel' in detached).toBeFalse();
                expect(detached.zone).toBe('ground');
                expect(attr(context.paigeTico, 'kind')).toBe('unit');
                expect(attr(context.paigeTico, 'power')).toBe(3);
                expect(attr(context.paigeTico, 'hp')).toBe(2);
                expect(attr(context.paigeTico, 'exhausted')).toBe(true);
            });
        });

        describe('two leaders', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city'
                    }
                });
            });

            it('projects both leaders in the base zone, undeployed', function () {
                const { context } = contextRef;
                const leaders = context.player1.player.getAllDeckLeaders();

                expect(leaders.length).toBe(2);
                for (const leader of leaders) {
                    expect(entityOf(leader).zone).toBe('base');
                    expect(attr(leader, 'deployed')).toBe(false);
                }
            });
        });

        describe('captured cards', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', capturedUnits: ['battlefield-marine'] }],
                        base: { card: 'kestro-city', capturedUnits: ['pyke-sentinel'] }
                    }
                });
            });

            it('puts a unit captured by a unit under its captor', function () {
                const { context } = contextRef;
                const captured = entityOf(context.battlefieldMarine);

                expect(captured.zone).toBe('captured');
                expect(captured.parent).toBe(idOf(context.wampa));
                expect(captured.rel).toBe('captured');
                expect(captured.owner).toBe(2);
                expect('controller' in captured).toBeFalse();
                expect(captured.to).toBe('all');
                expect(has(context.battlefieldMarine, 'power')).toBeFalse();
            });

            it('puts a unit captured by a base under the base', function () {
                const { context } = contextRef;
                const captured = entityOf(context.pykeSentinel);

                expect(captured.zone).toBe('captured');
                expect(captured.parent).toBe(idOf(context.p1Base));
                expect(captured.rel).toBe('captured');
                expect(captured.owner).toBe(2);
                expect('controller' in captured).toBeFalse();
            });
        });
    });
});
