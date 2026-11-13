import type { IOngoingCardEffectProps } from '../../../../server/game/Interfaces';
import type { Card } from '../../../../server/game/core/card/Card';
import { AbilityType, Duration, EffectName, KeywordName, RelativePlayer, WildcardCardType, WildcardRelativePlayer, WildcardZoneName, ZoneName } from '../../../../server/game/core/Constants';
import type { Game } from '../../../../server/game/core/Game';
import { OngoingEffectBuilder } from '../../../../server/game/core/ongoingEffect/OngoingEffectBuilder';
import { GainAbility } from '../../../../server/game/core/ongoingEffect/effectImpl/GainAbility';

function effectFor(game: Game, source: Card, type: EffectName, value?: unknown, properties: IOngoingCardEffectProps = {}) {
    return OngoingEffectBuilder.card.static(type, value)(game, source, {
        duration: Duration.UntilEndOfPhase,
        isLastingEffect: true,
        targetController: WildcardRelativePlayer.Any,
        targetZoneFilter: WildcardZoneName.Any,
        targetCardTypeFilter: WildcardCardType.Any,
        matchTarget: () => true,
        ...properties
    });
}

function gainAbilityFrom(game: Game, source: Card, properties: IOngoingCardEffectProps = {}) {
    const value = new GainAbility(game, {
        type: AbilityType.Action,
        title: 'Test gained action',
        handler: () => undefined
    });
    return effectFor(game, source, EffectName.GainAbility, value, properties);
}

describe('Ongoing card effect targeting', function() {
    integration(function(contextRef) {
        beforeEach(async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'wampa'],
                    hand: ['atst'],
                    resources: ['pyke-sentinel']
                },
                player2: { groundArena: ['death-star-stormtrooper'] }
            });
        });

        it('should skip blanking scans for effects that grant neither abilities nor keywords', function() {
            const { context } = contextRef;
            const target = context.wampa;
            effectFor(context.game, context.battlefieldMarine, EffectName.Blank).addTarget(target);
            const effect = effectFor(context.game, context.battlefieldMarine, EffectName.ModifyStats, { power: 1, hp: 1 });
            const originalIsBlank = target.isBlank;
            const blankQuery = jasmine.createSpy('isBlank').and.callFake(() => originalIsBlank.call(target));
            target.isBlank = blankQuery;

            try {
                expect(effect.isValidTarget(target)).toBe(true);
                expect(blankQuery).not.toHaveBeenCalled();
            } finally {
                // Whole-suite undo runs the same assertion twice on the same card instance.
                target.isBlank = originalIsBlank;
            }
        });

        it('should still enforce controller, zone, card type and custom targeting restrictions on ordinary effects', function() {
            const { context } = contextRef;
            const matched: Card[] = [];
            const effect = effectFor(context.game, context.battlefieldMarine, EffectName.ModifyStats, { power: 1, hp: 1 }, {
                targetController: RelativePlayer.Self,
                targetZoneFilter: ZoneName.GroundArena,
                targetCardTypeFilter: WildcardCardType.Unit,
                matchTarget: (target) => {
                    matched.push(target);
                    return target === context.wampa;
                }
            });

            expect(effect.isValidTarget(context.wampa)).toBe(true);
            expect(effect.isValidTarget(context.battlefieldMarine)).toBe(false);
            expect(effect.isValidTarget(context.deathStarStormtrooper)).toBe(false);
            expect(effect.isValidTarget(context.atst)).toBe(false);
            expect(effect.isValidTarget(context.p1Base)).toBe(false);
            expect(matched).toEqual([context.wampa, context.battlefieldMarine]);
        });

        it('should honor full blanking and the source exception when granting an ability', function() {
            const { context } = contextRef;
            const target = context.wampa;
            const fromMarine = gainAbilityFrom(context.game, context.battlefieldMarine);
            const fromOpponent = gainAbilityFrom(context.game, context.deathStarStormtrooper);

            expect(fromMarine.isValidTarget(target)).toBe(true);
            const partialBlank = effectFor(context.game, context.battlefieldMarine, EffectName.BlankExceptFromSourceCard);
            partialBlank.addTarget(target);
            expect(target.isBlank()).toBe(true);
            expect(fromMarine.isValidTarget(target)).toBe(true);
            expect(fromOpponent.isValidTarget(target)).toBe(false);

            const fullBlank = effectFor(context.game, context.battlefieldMarine, EffectName.Blank);
            fullBlank.addTarget(target);
            expect(fromMarine.isValidTarget(target)).toBe(false);
            fullBlank.removeTarget(target);
            expect(fromMarine.isValidTarget(target)).toBe(true);
            partialBlank.removeTarget(target);
            expect(fromOpponent.isValidTarget(target)).toBe(true);
        });

        it('should grant only permitted keywords to a partially blanked target and respect later removal', function() {
            const { context } = contextRef;
            const target = context.wampa;
            effectFor(context.game, context.battlefieldMarine, EffectName.BlankExceptKeyword, {
                exceptKeyword: KeywordName.Sentinel
            }).addTarget(target);
            const sentinel = effectFor(context.game, context.battlefieldMarine, EffectName.GainKeyword, KeywordName.Sentinel);
            const raid = effectFor(context.game, context.battlefieldMarine, EffectName.GainKeyword, { keyword: KeywordName.Raid, amount: 1 });
            const mixed = effectFor(context.game, context.battlefieldMarine, EffectName.GainKeyword, [
                KeywordName.Sentinel, { keyword: KeywordName.Raid, amount: 1 }
            ]);

            expect(sentinel.isValidTarget(target)).toBe(true);
            expect(raid.isValidTarget(target)).toBe(false);
            expect(mixed.isValidTarget(target)).toBe(true);
            expect(gainAbilityFrom(context.game, context.battlefieldMarine).isValidTarget(target)).toBe(false);

            const removeSentinel = effectFor(context.game, context.battlefieldMarine, EffectName.LoseKeyword, KeywordName.Sentinel);
            removeSentinel.addTarget(target);
            expect(sentinel.isValidTarget(target)).toBe(false);
            expect(mixed.isValidTarget(target)).toBe(false);
            removeSentinel.removeTarget(target);
            expect(mixed.isValidTarget(target)).toBe(true);
        });

        it('should allow a blanked card to gain Smuggle in hidden zones but reject it in an arena', function() {
            const { context } = contextRef;
            const smuggle = effectFor(context.game, context.battlefieldMarine, EffectName.GainKeyword, {
                keyword: KeywordName.Smuggle, cost: 3, aspects: []
            });
            for (const target of [context.wampa, context.atst, context.pykeSentinel]) {
                effectFor(context.game, context.battlefieldMarine, EffectName.Blank).addTarget(target);
                expect(target.isBlank()).toBe(true);
            }

            expect(smuggle.isValidTarget(context.wampa)).toBe(false);
            expect(smuggle.isValidTarget(context.atst)).toBe(true);
            expect(smuggle.isValidTarget(context.pykeSentinel)).toBe(true);
        });

        it('should preserve source-only and explicit-card targeting shortcuts', function() {
            const { context } = contextRef;
            effectFor(context.game, context.battlefieldMarine, EffectName.Blank).addTarget(context.battlefieldMarine);
            const sourceOnly = OngoingEffectBuilder.card.static(EffectName.GainKeyword, KeywordName.Sentinel)(
                context.game, context.battlefieldMarine, {}
            );
            expect(sourceOnly.isValidTarget(context.battlefieldMarine)).toBe(true);
            expect(sourceOnly.isValidTarget(context.wampa)).toBe(false);

            const explicitTarget = effectFor(context.game, context.battlefieldMarine, EffectName.ModifyStats, { power: 1, hp: 1 }, {
                matchTarget: context.deathStarStormtrooper,
                targetController: RelativePlayer.Self,
                targetZoneFilter: ZoneName.Hand
            });
            expect(explicitTarget.isValidTarget(context.deathStarStormtrooper)).toBe(true);
            expect(explicitTarget.isValidTarget(context.wampa)).toBe(false);
        });

        it('should use the latest recalculated keyword value for each target query', function() {
            const { context } = contextRef;
            const target = context.wampa;
            effectFor(context.game, context.battlefieldMarine, EffectName.BlankExceptKeyword, {
                exceptKeyword: KeywordName.Sentinel
            }).addTarget(target);
            const dynamic = OngoingEffectBuilder.card.dynamic(EffectName.GainKeyword,
                (card) => (card.exhausted ? KeywordName.Sentinel : KeywordName.Ambush)
            )(context.game, context.battlefieldMarine, { matchTarget: target });

            target.exhausted = false;
            dynamic.impl.recalculate(target);
            expect(dynamic.isValidTarget(target)).toBe(false);
            target.exhausted = true;
            dynamic.impl.recalculate(target);
            expect(dynamic.isValidTarget(target)).toBe(true);
            target.exhausted = false;
            dynamic.impl.recalculate(target);
            expect(dynamic.isValidTarget(target)).toBe(false);
        });
    });

    undoIntegration(function(contextRef) {
        it('should reevaluate a retained gain effect after blanking is added and rolled back', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['battlefield-marine', 'wampa'] }
            });
            const { context } = contextRef;
            const effect = gainAbilityFrom(context.game, context.battlefieldMarine);
            effect.getObjectId();
            expect(effect.isValidTarget(context.wampa)).toBe(true);
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);

            effectFor(context.game, context.battlefieldMarine, EffectName.Blank).addTarget(context.wampa);
            expect(effect.isValidTarget(context.wampa)).toBe(false);
            expect(contextRef.snapshot.rollbackToSnapshot({
                type: 'manual', playerId: context.player1Object.id, snapshotId
            })).toBe(true);
            expect(context.wampa.isBlank()).toBe(false);
            expect(effect.isValidTarget(context.wampa)).toBe(true);
        });
    });
});
