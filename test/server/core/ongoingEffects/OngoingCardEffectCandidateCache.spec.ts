import type { IOngoingCardEffectProps } from '../../../../server/game/Interfaces';
import type { Card } from '../../../../server/game/core/card/Card';
import { DeployType, Duration, EffectName, KeywordName, RelativePlayer, TokenCardName, TokenUnitName, WildcardCardType, WildcardRelativePlayer, WildcardZoneName, ZoneName } from '../../../../server/game/core/Constants';
import type { Game } from '../../../../server/game/core/Game';
import { OngoingEffectBuilder } from '../../../../server/game/core/ongoingEffect/OngoingEffectBuilder';

function candidateEffect(game: Game, source: Card, properties: IOngoingCardEffectProps = {}, type = EffectName.CannotAttack, value?: unknown) {
    return OngoingEffectBuilder.card.static(type, value)(game, source, {
        duration: Duration.UntilEndOfPhase,
        targetController: WildcardRelativePlayer.Any,
        targetCardTypeFilter: WildcardCardType.Any,
        targetZoneFilter: WildcardZoneName.AnyAttackable,
        matchTarget: () => true,
        ...properties
    });
}

function expectedCandidates(game: Game) {
    return game.allCards.filter((card) =>
        card.zoneName === ZoneName.Base || card.zoneName === ZoneName.GroundArena || card.zoneName === ZoneName.SpaceArena
    );
}

function countCardEnumerations(game: Game, check: (readCount: () => number) => void) {
    const ownDescriptor = Object.getOwnPropertyDescriptor(game, 'allCards');
    let prototype: object = game;
    let descriptor = ownDescriptor;
    while (!descriptor) {
        prototype = Object.getPrototypeOf(prototype);
        descriptor = Object.getOwnPropertyDescriptor(prototype, 'allCards');
    }
    const originalGet = descriptor.get;
    let count = 0;
    Object.defineProperty(game, 'allCards', {
        configurable: true,
        get() {
            count++;
            return originalGet.call(game);
        }
    });
    try {
        check(() => count);
    } finally {
        // Undo mode repeats each assertion on the same game object.
        if (ownDescriptor) {
            Object.defineProperty(game, 'allCards', ownDescriptor);
        } else {
            Reflect.deleteProperty(game, 'allCards');
        }
    }
}

describe('Ongoing card effect candidate cache', function() {
    integration(function(contextRef) {
        beforeEach(async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'wampa'],
                    spaceArena: ['cartel-spacer'],
                    hand: ['atst', 'alliance-shield-generator'],
                    resources: ['pyke-sentinel']
                },
                player2: { groundArena: ['death-star-stormtrooper'] }
            });
        });

        it('should reuse unchanged candidates in registration order while returning isolated arrays', function() {
            const { context } = contextRef;
            const expected = expectedCandidates(context.game);
            const effect = candidateEffect(context.game, context.battlefieldMarine);
            const secondEffect = candidateEffect(context.game, context.wampa);
            countCardEnumerations(context.game, (readCount) => {
                const first = effect.getTargets();
                const readsAfterFirst = readCount();
                const second = secondEffect.getTargets();
                expect(first).toEqual(expected);
                expect(second).toEqual(expected);
                expect(second).not.toBe(first);
                expect(readCount()).toBe(readsAfterFirst);
                expect(first).not.toContain(context.atst);
                expect(first).not.toContain(context.pykeSentinel);

                second.reverse();
                second.pop();
                expect(effect.getTargets()).toEqual(expected);
                expect(readCount()).toBe(readsAfterFirst);
            });
        });

        it('should invalidate on same-count arena swaps and on cards leaving either arena', function() {
            const { context } = contextRef;
            const effect = candidateEffect(context.game, context.battlefieldMarine);
            const original = effect.getTargets();
            const originalCount = context.game.groundArena.cards.length;
            context.wampa.moveTo(ZoneName.Hand);
            context.atst.moveTo(ZoneName.GroundArena);
            expect(context.game.groundArena.cards.length).toBe(originalCount);
            expect(effect.getTargets()).toEqual(expectedCandidates(context.game));
            expect(effect.getTargets()).toContain(context.atst);
            expect(effect.getTargets()).not.toContain(context.wampa);
            expect(original).toContain(context.wampa);

            context.cartelSpacer.moveTo(ZoneName.Hand);
            expect(effect.getTargets()).not.toContain(context.cartelSpacer);
            context.cartelSpacer.moveTo(ZoneName.SpaceArena);
            expect(effect.getTargets()).toEqual(expectedCandidates(context.game));
        });

        it('should invalidate when existing Force and credit tokens enter or leave the base', function() {
            const { context } = contextRef;
            const credit = context.game.generateToken(context.player1Object, TokenCardName.Credit);
            const effect = candidateEffect(context.game, context.battlefieldMarine);
            const allCardCount = context.game.state.allCards.length;
            effect.getTargets();

            context.player1.setHasTheForce(true);
            const force = context.player1Object.baseZone.forceToken;
            expect(effect.getTargets()).toContain(force);
            context.player1.setHasTheForce(false);
            expect(effect.getTargets()).not.toContain(force);
            credit.moveTo(ZoneName.Base);
            expect(effect.getTargets()).toContain(credit);
            credit.moveTo(ZoneName.OutsideTheGame);
            expect(effect.getTargets()).not.toContain(credit);
            expect(context.game.state.allCards.length).toBe(allCardCount);
            expect(effect.getTargets()).toEqual(expectedCandidates(context.game));
        });

        it('should retain leaders through deployment and include attached base upgrades', function() {
            const { context } = contextRef;
            const effect = candidateEffect(context.game, context.battlefieldMarine);
            const leader = context.p1Leader;
            if (!leader.isDeployableLeader()) {
                throw new Error('Test requires a deployable leader');
            }
            expect(effect.getTargets()).toContain(leader);
            leader.deploy({ type: DeployType.LeaderUnit });
            expect(effect.getTargets()).toEqual(expectedCandidates(context.game));
            expect(effect.getTargets()).toContain(context.p1Leader);
            leader.undeploy();
            expect(effect.getTargets()).toContain(context.p1Leader);

            expect(effect.getTargets()).not.toContain(context.allianceShieldGenerator);
            context.allianceShieldGenerator.attachTo(context.p1Base);
            expect(effect.getTargets()).toContain(context.allianceShieldGenerator);
            context.allianceShieldGenerator.unattach();
            context.allianceShieldGenerator.moveTo(ZoneName.Discard);
            expect(effect.getTargets()).not.toContain(context.allianceShieldGenerator);
            expect(effect.getTargets()).toEqual(expectedCandidates(context.game));
        });

        it('should discover newly generated tokens and stop returning them after removal', function() {
            const { context } = contextRef;
            const effect = candidateEffect(context.game, context.battlefieldMarine);
            effect.getTargets();
            const allCardIds = context.game.state.allCards;
            const count = allCardIds.length;
            const token = context.game.generateToken(context.player1Object, TokenUnitName.BattleDroid);
            expect(context.game.state.allCards).toBe(allCardIds);
            expect(allCardIds.length).toBe(count + 1);
            expect(effect.getTargets()).not.toContain(token);
            token.moveTo(ZoneName.GroundArena);
            expect(effect.getTargets()).toContain(token);
            token.moveTo(ZoneName.OutsideTheGame);
            context.game.removeTokenFromPlay(token);
            expect(effect.getTargets()).not.toContain(token);
            expect(effect.getTargets()).toEqual(expectedCandidates(context.game));
        });

        it('should reevaluate controller, condition and exhausted-state predicates without membership changes', function() {
            const { context } = contextRef;
            const source = context.battlefieldMarine;
            const groundCards = context.game.groundArena.cards;
            const effect = candidateEffect(context.game, source, {
                targetController: RelativePlayer.Self,
                targetCardTypeFilter: WildcardCardType.Unit,
                condition: () => !source.exhausted,
                matchTarget: (card) => card !== source && card.isUnit() && !card.exhausted
            });
            context.wampa.exhausted = false;
            context.cartelSpacer.exhausted = false;
            context.deathStarStormtrooper.exhausted = false;
            source.exhausted = false;
            effect.resolveEffectTargets();
            expect(effect.targets).toContain(context.wampa);
            context.wampa.exhausted = true;
            effect.resolveEffectTargets();
            expect(effect.targets).not.toContain(context.wampa);
            source.exhausted = true;
            effect.resolveEffectTargets();
            expect(effect.targets).toEqual([]);
            source.exhausted = false;
            source.takeControl(context.player2Object);
            effect.resolveEffectTargets();
            expect(effect.targets).toEqual([context.deathStarStormtrooper]);
            expect(context.game.groundArena.cards).toBe(groundCards);
        });

        it('should recalculate dynamic values after hand and exhausted-state changes', function() {
            const { context } = contextRef;
            const target = context.wampa;
            const effect = OngoingEffectBuilder.card.dynamic(EffectName.ModifyStats,
                (card, abilityContext) => ({ power: abilityContext.player.hand.length + (card.exhausted ? 1 : 0), hp: 0 })
            )(context.game, context.battlefieldMarine, {
                targetZoneFilter: WildcardZoneName.AnyAttackable,
                matchTarget: (card) => card === target
            });
            const groundCards = context.game.groundArena.cards;
            target.exhausted = false;
            effect.resolveEffectTargets();
            expect(effect.getValue(target)).toEqual({ power: 2, hp: 0 });
            target.exhausted = true;
            effect.resolveEffectTargets();
            expect(effect.getValue(target)).toEqual({ power: 3, hp: 0 });
            context.atst.moveTo(ZoneName.Discard);
            effect.resolveEffectTargets();
            expect(effect.getValue(target)).toEqual({ power: 2, hp: 0 });
            expect(context.game.groundArena.cards).toBe(groundCards);
        });

        it('should reevaluate blanking on cached arena targets and preserve hidden-zone keyword exceptions', function() {
            const { context } = contextRef;
            const effect = candidateEffect(context.game, context.battlefieldMarine, {
                matchTarget: (card) => card === context.wampa
            }, EffectName.GainKeyword, KeywordName.Sentinel);
            effect.resolveEffectTargets();
            expect(effect.targets).toEqual([context.wampa]);
            const blank = candidateEffect(context.game, context.battlefieldMarine, {}, EffectName.Blank);
            blank.addTarget(context.wampa);
            effect.resolveEffectTargets();
            expect(effect.targets).toEqual([]);
            blank.removeTarget(context.wampa);
            effect.resolveEffectTargets();
            expect(effect.targets).toEqual([context.wampa]);

            blank.addTarget(context.atst);
            const hidden = candidateEffect(context.game, context.battlefieldMarine, {
                targetZoneFilter: WildcardZoneName.Any,
                matchTarget: (card) => card === context.atst
            }, EffectName.GainKeyword, { keyword: KeywordName.Smuggle, cost: 3, aspects: [] });
            hidden.resolveEffectTargets();
            expect(hidden.targets).toEqual([context.atst]);
        });

        it('should preserve explicit-card targeting outside the declared zone filter', function() {
            const { context } = contextRef;
            const effect = candidateEffect(context.game, context.battlefieldMarine, { matchTarget: context.atst });
            expect(effect.getTargets()).toContain(context.atst);
            effect.resolveEffectTargets();
            expect(effect.targets).toEqual([context.atst]);
        });
    });

    undoIntegration(function(contextRef) {
        it('should rebuild a warmed candidate cache after rollback restores earlier membership', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['battlefield-marine', 'wampa'], hand: ['atst'] }
            });
            const { context } = contextRef;
            const effect = candidateEffect(context.game, context.battlefieldMarine);
            effect.getObjectId();
            const original = effect.getTargets();
            const snapshotId = contextRef.snapshot.takeManualSnapshot(context.player1Object);
            context.wampa.moveTo(ZoneName.Hand);
            context.atst.moveTo(ZoneName.GroundArena);
            expect(effect.getTargets()).toContain(context.atst);
            expect(effect.getTargets()).not.toContain(context.wampa);
            expect(contextRef.snapshot.rollbackToSnapshot({
                type: 'manual', playerId: context.player1Object.id, snapshotId
            })).toBe(true);
            expect(effect.getTargets()).toEqual(original);
            expect(effect.getTargets()).toEqual(expectedCandidates(context.game));
            expect(effect.getTargets()).not.toContain(context.atst);
        });
    });
});
