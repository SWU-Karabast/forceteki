import { AbilityContext } from '../../../server/game/core/ability/AbilityContext';
import type { Card } from '../../../server/game/core/card/Card';
import { DamageType, Duration, GameStateChangeRequired } from '../../../server/game/core/Constants';
import type { GameEvent } from '../../../server/game/core/event/GameEvent';
import type { Player } from '../../../server/game/core/Player';
import { CaptureSystem } from '../../../server/game/gameSystems/CaptureSystem';
import { ConditionalSystem } from '../../../server/game/gameSystems/ConditionalSystem';
import { DamageSystem, type IAbilityDamageProperties } from '../../../server/game/gameSystems/DamageSystem';
import { DrawSystem } from '../../../server/game/gameSystems/DrawSystem';
import { ExecuteHandlerSystem } from '../../../server/game/gameSystems/ExecuteHandlerSystem';
import { ExhaustResourcesSystem } from '../../../server/game/gameSystems/ExhaustResourcesSystem';
import { PlayerLastingEffectSystem } from '../../../server/game/gameSystems/PlayerLastingEffectSystem';
import { ReadyResourcesSystem } from '../../../server/game/gameSystems/ReadyResourcesSystem';
import { ShuffleDeckSystem } from '../../../server/game/gameSystems/ShuffleDeckSystem';
import { SimultaneousSystem } from '../../../server/game/gameSystems/SimultaneousSystem';
import OngoingEffects from '../../../server/game/ongoingEffects/OngoingEffectLibrary';

describe('Game system property contracts', function() {
    integration(function(contextRef) {
        beforeEach(async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    resources: [{ card: 'underworld-thug', exhausted: true }, 'underworld-thug'],
                    deck: ['underworld-thug', 'underworld-thug', 'underworld-thug']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    resources: ['underworld-thug', 'underworld-thug'],
                    deck: ['underworld-thug', 'underworld-thug', 'underworld-thug']
                }
            });
        });

        describe('Target normalization', function() {
            it('normalizes scalar and singleton-array player inputs identically', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const scalarProperties = new DrawSystem({ target: context.player2.player }).generatePropertiesFromContext(abilityContext);
                const arrayProperties = new DrawSystem({ target: [context.player2.player] }).generatePropertiesFromContext(abilityContext);

                const players: Player[] = scalarProperties.target;
                expect(players).toEqual([context.player2.player]);
                expect(arrayProperties.target).toEqual(players);
            });

            it('normalizes card inputs without changing per-card legality checks', function() {
                const { context } = contextRef;
                const abilityContext = new AbilityContext({
                    game: context.game,
                    player: context.player1.player,
                    source: context.wampa
                });
                const system = new DamageSystem<AbilityContext, IAbilityDamageProperties>({
                    type: DamageType.Ability,
                    amount: 1,
                    target: context.battlefieldMarine
                });

                const cards: Card[] = system.generatePropertiesFromContext(abilityContext).target;
                expect(cards).toEqual([context.battlefieldMarine]);
                expect(system.canAffect(context.battlefieldMarine, abilityContext)).toBeTrue();
            });

            it('uses the existing default target when no target is supplied', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);

                expect(new DrawSystem({}).generatePropertiesFromContext(abilityContext).target).toEqual([context.player1.player]);
            });

            it('preserves an explicitly empty target collection', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const system = new DrawSystem({ target: [] });

                expect(system.generatePropertiesFromContext(abilityContext).target).toEqual([]);
                expect(system.hasLegalTarget(abilityContext)).toBeFalse();
            });

            it('does not mutate the caller target array when normalizing it', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const targets = [context.player2.player];
                const system = new DrawSystem({ target: targets });
                const properties = system.generatePropertiesFromContext(abilityContext);

                expect(properties.target).toEqual(targets);
                expect(properties.target).not.toBe(targets);
                expect(targets).toEqual([context.player2.player]);
            });

            it('re-evaluates a property factory against the current context', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const system = new DrawSystem((currentContext) => ({
                    target: currentContext.player,
                    amount: 1
                }));

                expect(system.generatePropertiesFromContext(abilityContext).target).toEqual([context.player1.player]);
                abilityContext.player = context.player2.player;
                expect(system.generatePropertiesFromContext(abilityContext).target).toEqual([context.player2.player]);
            });

            it('does not evaluate a target-dependent factory for a default choice-metadata query', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const factory = jasmine.createSpy('draw properties').and.throwError('Targets have not been selected');
                const system = new DrawSystem(factory);

                expect(system.hasTargetsChosenByPlayer(abilityContext, context.player2.player)).toBeFalse();
                expect(factory).not.toHaveBeenCalled();
            });
        });

        describe('Property precedence and forwarding', function() {
            it('uses additional properties ahead of defaults', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const properties = new DrawSystem({}).generatePropertiesFromContext(abilityContext, {
                    target: context.player2.player,
                    amount: 2
                });

                expect(properties.target).toEqual([context.player2.player]);
                expect(properties.amount).toBe(2);
            });

            it('keeps explicit configuration ahead of additional properties', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const properties = new DrawSystem({ target: context.player1.player, amount: 1 })
                    .generatePropertiesFromContext(abilityContext, { target: context.player2.player, amount: 2 });

                expect(properties.target).toEqual([context.player1.player]);
                expect(properties.amount).toBe(1);
            });

            it('keeps factory configuration ahead of additional properties', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const properties = new DrawSystem(() => ({ target: context.player1.player, amount: 1 }))
                    .generatePropertiesFromContext(abilityContext, { target: context.player2.player, amount: 2 });

                expect(properties.target).toEqual([context.player1.player]);
                expect(properties.amount).toBe(1);
            });

            it('honors the cost flag in resource-readying legality and event conditions', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const system = new ReadyResourcesSystem({ amount: 2 });

                expect(system.canAffect(context.player1.player, abilityContext)).toBeTrue();
                expect(system.canAffect(context.player1.player, abilityContext, { isCost: true })).toBeFalse();
                expect(system.canAffect(context.player1.player, abilityContext, {}, GameStateChangeRequired.MustFullyResolve)).toBeFalse();

                const event = system.generateEvent(abilityContext, { isCost: true });
                expect(event.condition(event)).toBeFalse();
            });

            it('uses the additional shuffle recipient in both messages and events', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const system = new ShuffleDeckSystem({});
                const additionalProperties = { target: context.player2.player };
                const [, messageArgs] = system.getEffectMessage(abilityContext, additionalProperties);
                const event = system.generateEvent(abilityContext, additionalProperties);

                expect(messageArgs).toEqual([{
                    format: 'shuffle {0} deck',
                    args: [{ format: '{0}\'s', args: [context.player2.player] }]
                }]);
                expect(event['player']).toBe(context.player2.player);
            });

            it('uses an additional captor instead of the context default', function() {
                const { context } = contextRef;
                const abilityContext = new AbilityContext({
                    game: context.game,
                    player: context.player1.player,
                    source: context.wampa
                });
                const system = new CaptureSystem({});
                const event = system.generateEvent(abilityContext, {
                    target: context.wampa,
                    captor: context.battlefieldMarine
                });

                expect(event['captor']).toBe(context.battlefieldMarine);
            });

            it('passes an individual unit to a function-valued damage cost', function() {
                const { context } = contextRef;
                const abilityContext = new AbilityContext({
                    game: context.game,
                    player: context.player1.player,
                    source: context.wampa
                });
                const amount = jasmine.createSpy('damage amount').and.returnValue(2);
                const system = new DamageSystem<AbilityContext, IAbilityDamageProperties>({
                    type: DamageType.Ability,
                    amount,
                    target: context.wampa
                });

                system.getCostMessage(abilityContext);

                expect(amount).toHaveBeenCalledOnceWith(context.wampa);
            });

            it('reports a failed legality check once when the error reporter throws', function() {
                const { context } = contextRef;
                const abilityContext = new AbilityContext({
                    game: context.game,
                    player: context.player1.player,
                    source: context.wampa
                });
                const reportingFailure = new Error('Error reporting failed');
                const originalHasRestriction = context.wampa.hasRestriction;
                const originalReportError = context.game.reportError;
                spyOn(context.wampa, 'hasRestriction').and.throwError('Legality evaluation failed');
                const reportError = spyOn(context.game, 'reportError').and.throwError(reportingFailure);
                const system = new DamageSystem<AbilityContext, IAbilityDamageProperties>({
                    type: DamageType.Ability,
                    amount: 1
                });

                try {
                    expect(() => system.canAffect(context.wampa, abilityContext, { isCost: true })).toThrow(reportingFailure);
                    expect(reportError).toHaveBeenCalledTimes(1);
                } finally {
                    // Method spies are not rolled back with game state.
                    context.wampa.hasRestriction = originalHasRestriction;
                    context.game.reportError = originalReportError;
                }
            });
        });

        describe('Event construction', function() {
            it('uses a scalar recipient for direct scalar and singleton-array draw inputs', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const scalarEvent = new DrawSystem({ target: context.player2.player }).generateEvent(abilityContext);
                const arrayEvent = new DrawSystem({ target: [context.player2.player] }).generateEvent(abilityContext);

                expect(scalarEvent['player']).toBe(context.player2.player);
                expect(arrayEvent['player']).toBe(context.player2.player);
            });

            it('identifies the same recipient through direct, retargeted, and queued generation', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const system = new DrawSystem({ target: context.player2.player });
                const directEvent = system.generateEvent(abilityContext);
                const retargetedEvent = system.generateRetargetedEvent(context.player2.player, abilityContext);
                const queuedEvents: GameEvent[] = [];
                system.queueGenerateEventGameSteps(queuedEvents, abilityContext);

                expect(queuedEvents.length).toBe(1);
                expect(directEvent['player']).toBe(context.player2.player);
                expect(retargetedEvent['player']).toBe(context.player2.player);
                expect(queuedEvents[0]['player']).toBe(context.player2.player);
            });

            it('executes a directly generated draw for the intended player only', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const player1HandSize = context.player1.hand.length;
                const player2HandSize = context.player2.hand.length;
                const event = new DrawSystem({ target: context.player2.player }).generateEvent(abilityContext);

                event.executeHandler();

                expect(context.player1.hand.length).toBe(player1HandSize);
                expect(context.player2.hand.length).toBe(player2HandSize + 1);
                expect(context.player2.deck.length).toBe(2);
            });

            it('resolves a property factory once for queued event construction', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const factory = jasmine.createSpy('draw properties').and.returnValue({
                    target: context.player2.player,
                    amount: 1
                });
                const events: GameEvent[] = [];

                new DrawSystem(factory).queueGenerateEventGameSteps(events, abilityContext);

                expect(events.length).toBe(1);
                expect(factory).toHaveBeenCalledOnceWith(abilityContext);
            });

            it('preserves existing batched player-lasting-effect event construction', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const players = [context.player1.player, context.player2.player];
                const system = new PlayerLastingEffectSystem({
                    target: players,
                    duration: Duration.UntilEndOfRound,
                    effect: OngoingEffects.drawAdditionalCardsInRegroup(1)
                });
                const event = system.generateEvent(abilityContext);

                expect(event['player']).toEqual(players);
                expect(event['effectProperties'].map((properties) => properties.matchTarget)).toEqual(players);
            });
        });

        describe('Event conditions', function() {
            it('generates properties once when checking a player-targeting event condition', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const factory = jasmine.createSpy('draw properties').and.returnValue({ target: context.player2.player });
                const event = new DrawSystem(factory).generateEvent(abilityContext);
                factory.calls.reset();

                expect(event.condition(event)).toBeTrue();
                expect(factory).toHaveBeenCalledTimes(1);
            });

            it('generates properties once when checking a card-targeting event condition', function() {
                const { context } = contextRef;
                const abilityContext = new AbilityContext({
                    game: context.game,
                    player: context.player1.player,
                    source: context.wampa
                });
                const factory = jasmine.createSpy('damage properties').and.returnValue({
                    type: DamageType.Ability,
                    amount: 1,
                    target: context.battlefieldMarine
                });
                const event = new DamageSystem<AbilityContext, IAbilityDamageProperties>(factory).generateEvent(abilityContext);
                factory.calls.reset();

                expect(event.condition(event)).toBeTrue();
                expect(factory).toHaveBeenCalledTimes(1);
            });

            it('reports a property factory that fails at resolution time and cancels the event instead of throwing', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                let factoryFails = false;
                const event = new ExecuteHandlerSystem(() => {
                    if (factoryFails) {
                        throw new Error('Property factory failed');
                    }
                    return { handler: () => undefined };
                }).generateEvent(abilityContext);
                const originalReportError = context.game.reportError;
                const reportError = spyOn(context.game, 'reportError');

                try {
                    factoryFails = true;
                    event.checkCondition();

                    expect(reportError).toHaveBeenCalledTimes(1);
                    expect(event.isCancelled).toBeTrue();
                } finally {
                    // Method spies are not rolled back with game state.
                    context.game.reportError = originalReportError;
                }
            });
        });

        describe('Wrapped effects', function() {
            it('retains each child system default instead of forwarding parent defaults', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const draw = new DrawSystem({});
                const exhaust = new ExhaustResourcesSystem({ amount: 1 });
                const system = new SimultaneousSystem({ gameSystems: [draw, exhaust] });

                system.generatePropertiesFromContext(abilityContext);

                expect(draw.generatePropertiesFromContext(abilityContext).target).toEqual([context.player1.player]);
                expect(exhaust.generatePropertiesFromContext(abilityContext).target).toEqual([context.player2.player]);
            });

            it('forwards additional cost properties to a wrapped resource-readying effect', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const system = new SimultaneousSystem({
                    gameSystems: [new ReadyResourcesSystem({ amount: 2 })]
                });

                expect(system.hasLegalTarget(abilityContext)).toBeTrue();
                expect(system.hasLegalTarget(abilityContext, { isCost: true })).toBeFalse();
            });

            it('uses the same effective condition for legality and messages', function() {
                const { context } = contextRef;
                const abilityContext = context.game.getFrameworkContext(context.player1.player);
                const system = new ConditionalSystem({
                    condition: (_context, properties) => properties.isCost === true,
                    onTrue: new ReadyResourcesSystem({ amount: 2 }),
                    onFalse: new DrawSystem({ amount: 1 })
                });

                expect(system.hasLegalTarget(abilityContext, { isCost: true })).toBeFalse();
                expect(system.getEffectMessage(abilityContext, { isCost: true })).toEqual([
                    'ready {0}',
                    [{ format: '{0} {1}', args: ['2', 'resources'] }]
                ]);
            });
        });
    });
});
