/**
 * Tests for what a card's properties answer, and as of when (D-36 to D-39).
 *
 * A card has two views, and each answers about one moment (D-37). The last-known view holds the card's
 * characteristics as of the moment the reference represents: the instant the card left play, if it
 * left during the current action, and otherwise now. The current view holds the card as it is now,
 * presence included: where it is, whether it is in play, attached, attacking or defending. Presence
 * exists only on the current view. A selector's candidate is read on the current view (D-38).
 *
 * Each test of a recorded last-known view reads inside the action that wrote the record, because the
 * flush at the end of the action clears the record: while a prompt holds the action open, or at the
 * flush itself.
 *
 * The pending specs are open findings (register §B.3): the correct behavior, which the default does
 * not give yet.
 *
 * See long-term-project-docs/lki-redesign-decisions-and-insights.md.
 */

import { Aspect, KeywordName, Trait } from '../../../server/game/core/Constants';
import type { ICardStateGetter } from '../../../server/game/core/lki/CardStateGetter';

interface IFlushRead<T> {
    ran: boolean;
    value: T | null;
    error: unknown;
}

const flushHooks = new WeakMap<object, { read: (() => void) | null }>();

/**
 * Runs `read` at the next flush, which ends the action under test, while that action's records still
 * exist, and returns what it read. For reading a record when no prompt holds the action open.
 *
 * `read` runs inside the engine, so a failure is caught and handed back rather than thrown there.
 * Installed once per registry, because undo mode runs a spec body twice against the same registry.
 */
function readAtNextFlush<T>(registry, read: () => T): IFlushRead<T> {
    if (!flushHooks.has(registry)) {
        const hook = { read: null };
        const realFlush = registry.flushRecords.bind(registry);

        registry.flushRecords = () => {
            const pendingRead = hook.read;
            hook.read = null;
            if (pendingRead) {
                pendingRead();
            }
            realFlush();
        };

        flushHooks.set(registry, hook);
    }

    const result: IFlushRead<T> = { ran: false, value: null, error: null };
    flushHooks.get(registry).read = () => {
        result.ran = true;
        try {
            result.value = read();
        } catch (error) {
            result.error = error;
        }
    };
    return result;
}

describe('Last known information properties', function () {
    integration(function (contextRef) {
        describe('The last-known view', function () {
            it('answers characteristics as the unit left play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'helgait#dooku-was-a-visionary', upgrades: ['academy-training'] }, 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates.forCard(context.helgait);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);

                // Helgait's When Defeated holds the action open, so its record is still there.
                expect(context.player1).toHavePrompt('Distribute 8 Advantage tokens among targets');
                expect(context.helgait).toBeInZone('discard');

                const helgait = cardStates.getLastKnownProperties(context.helgait).asUnit();

                // Characteristics, as it left play: Academy Training's +2/+2 included.
                expect(helgait.title).toBe('Helgait');
                expect(helgait.controller).toBe(context.player1.player);
                expect(helgait.isNonLeaderUnit()).toBeTrue();
                expect(helgait.arena as string).toBe('groundArena');
                expect(helgait.wasInPlay()).toBeTrue();
                const inPlay = helgait.asWasInPlay();
                expect(inPlay.power).toBe(8);
                expect(inPlay.hp).toBe(6);
                expect(inPlay.damage).toBe(0);
                expect(inPlay.isUpgraded()).toBeTrue();
                expect(inPlay.upgrades).toEqual([cardStates.getIdentity(context.academyTraining)]);

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 8]
                ]));
            });

            it('records every characteristic of a unit as it left play, including what other cards gave it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            {
                                card: 'helgait#dooku-was-a-visionary',
                                exhausted: true,
                                damage: 1,
                                upgrades: ['enraged', 'shield', 'experience']
                            },
                            'wampa'
                        ]
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates.forCard(context.helgait);
                const helgaitRef = cardStates.getIdentity(context.helgait);
                const shieldRef = cardStates.getIdentity(context.helgait.upgrades.find((upgrade) => upgrade.isShield()));

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);

                // 6 printed power, +1 from Enraged and +1 from the Experience token.
                expect(context.player1).toHavePrompt('Distribute 8 Advantage tokens among targets');
                expect(context.helgait).toBeInZone('discard');

                const helgait = cardStates.getLastKnownProperties(helgaitRef).asUnit();
                expect(helgait.title).toBe('Helgait');
                expect(helgait.subtitle).toBe('Dooku Was a Visionary');
                expect(helgait.unique).toBeTrue();
                expect(helgait.aspects).toEqual([Aspect.Cunning, Aspect.Villainy]);
                expect(helgait.hasSomeAspect(Aspect.Villainy)).toBeTrue();
                expect(helgait.hasEveryAspect([Aspect.Cunning, Aspect.Villainy])).toBeTrue();
                expect([...helgait.traits]).toEqual([Trait.Separatist]);
                expect(helgait.hasSomeTrait(Trait.Separatist)).toBeTrue();
                expect(helgait.hasEveryTrait([Trait.Separatist, Trait.Imperial])).toBeFalse();
                expect(helgait.cost).toBe(5);
                expect(helgait.printedCost).toBe(5);
                expect(helgait.hasCost()).toBeTrue();
                expect(helgait.printedPower).toBe(6);
                expect(helgait.printedHp).toBe(4);
                expect(helgait.defaultArena as string).toBe('groundArena');

                // Raid 2 came from Enraged, which the card in the discard pile no longer has.
                expect(helgait.keywords).toEqual([{ name: KeywordName.Raid, value: 2 }]);
                expect(helgait.hasSomeKeyword(KeywordName.Raid)).toBeTrue();
                expect(helgait.getNumericKeywordTotal(KeywordName.Raid)).toBe(2);
                expect(context.helgait.hasSomeKeyword(KeywordName.Raid)).toBeFalse();

                expect(helgait.isNonLeaderUnit()).toBeTrue();
                expect(helgait.isLeader()).toBeFalse();
                expect(helgait.isLeaderUnit()).toBeFalse();
                expect(helgait.isToken()).toBeFalse();
                expect(helgait.isUpgrade()).toBeFalse();
                expect(helgait.isBase()).toBeFalse();
                expect(helgait.isEvent()).toBeFalse();
                expect(helgait.canBeInPlay()).toBeTrue();
                expect(helgait.canBeExhausted()).toBeTrue();
                expect(helgait.canBeDamaged()).toBeTrue();

                const inPlay = helgait.asWasInPlay();
                expect(inPlay.power).toBe(8);
                expect(inPlay.hp).toBe(6);
                expect(inPlay.damage).toBe(1);
                expect(inPlay.remainingHp).toBe(5);
                expect(inPlay.exhausted).toBeTrue();
                expect(inPlay.upgrades.length).toBe(3);
                expect(inPlay.isUpgraded()).toBeTrue();
                expect(inPlay.hasShield()).toBeTrue();
                expect(inPlay.hasExperience()).toBeTrue();
                expect(inPlay.hasWeakness()).toBeFalse();

                // The Shield token left play with it, and its record holds what it was attached to.
                const shield = cardStates.getLastKnownProperties(shieldRef).asUpgrade();
                expect(shield.isShield()).toBeTrue();
                expect(shield.isToken()).toBeTrue();
                expect(shield.isTokenUpgrade()).toBeTrue();
                expect(shield.parentCard).toBe(helgaitRef);
                expect(shield.parentCardController).toBe(context.player1.player);

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 8]
                ]));
            });

            it('records who owned a unit and who controlled it, when they differ', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall']
                    },
                    player2: {
                        // Owned by player1, controlled by player2.
                        groundArena: [{ card: 'death-star-stormtrooper', owner: 'player1' }]
                    }
                });

                const { context } = contextRef;
                const registry = context.game.lkiRegistry;
                const asDefeated = registry.getIdentity(context.deathStarStormtrooper);

                const recorded = readAtNextFlush(registry, () => {
                    const stormtrooper = registry.getProperties(asDefeated);
                    return { owner: stormtrooper.owner, controller: stormtrooper.controller };
                });

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);

                // In its owner's discard pile the card is player1's; the record still has player2's control.
                expect(recorded.ran).toBeTrue();
                expect(recorded.error).toBeNull();
                expect(recorded.value.owner).toBe(context.player1.player);
                expect(recorded.value.controller).toBe(context.player2.player);
            });

            it('holds the card an upgrade was attached to, and who controlled it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'helgait#dooku-was-a-visionary', upgrades: ['academy-training'] }, 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates.forCard(context.helgait);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);
                expect(context.player1).toHavePrompt('Distribute 8 Advantage tokens among targets');

                // The upgrade was defeated along with Helgait, in the same window.
                expect(context.academyTraining).toBeInZone('discard');
                const upgrade = cardStates.getLastKnownProperties(context.academyTraining).asUpgrade();

                expect(upgrade.wasInPlay()).toBeTrue();
                expect(upgrade.parentCard).toBe(cardStates.getIdentity(context.helgait));
                expect(upgrade.parentUnit).toBe(cardStates.getIdentity(context.helgait));
                expect(upgrade.parentCardController).toBe(context.player1.player);
                expect(upgrade.printedUpgradePower).toBe(2);
                expect(upgrade.arena as string).toBe('groundArena');

                // Whether it is attached now is asked of the current view.
                expect(cardStates.getCurrentProperties(context.academyTraining).isAttached()).toBeFalse();

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 8]
                ]));
            });

            it('has no presence members, so where a card is now has to be asked of the current view', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'helgait#dooku-was-a-visionary', upgrades: ['academy-training'] }, 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                // Typed explicitly, because the harness hands out the game untyped and the compiler is
                // half of this test.
                const cardStates: ICardStateGetter = context.game.cardStates.forCard(context.helgait);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);
                expect(context.player1).toHavePrompt('Distribute 8 Advantage tokens among targets');

                // Helgait's view is backed by its record, Wampa's by the live card. A presence read on
                // either does not compile (each directive fails the build if its line starts compiling),
                // and fails if it is forced through, rather than answer about the wrong moment.
                const views = [
                    cardStates.getLastKnownProperties(context.helgait).asUnit(),
                    cardStates.getLastKnownProperties(context.wampa).asUnit()
                ];
                for (const view of views) {
                    // @ts-expect-error - presence is only on the current view
                    expect(() => view.isInPlay()).toThrowError(/getCurrentProperties/);
                    // @ts-expect-error - presence is only on the current view
                    expect(() => view.zoneName).toThrowError(/getCurrentProperties/);
                    // @ts-expect-error - presence is only on the current view
                    expect(() => view.zone).toThrowError(/getCurrentProperties/);
                    // @ts-expect-error - presence is only on the current view
                    expect(() => view.isAttached()).toThrowError(/getCurrentProperties/);
                    // @ts-expect-error - presence is only on the current view
                    expect(() => view.isResource()).toThrowError(/getCurrentProperties/);
                    // @ts-expect-error - presence is only on the current view
                    expect(() => view.isAttacking()).toThrowError(/getCurrentProperties/);
                    // @ts-expect-error - presence is only on the current view
                    expect(() => view.isDefending()).toThrowError(/getCurrentProperties/);
                    // @ts-expect-error - presence is only on the current view
                    expect(() => view.activeAttack).toThrowError(/getCurrentProperties/);
                }

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 8]
                ]));
            });
        });

        describe('The current view', function () {
            it('reads a card as it is now even while it has a record, presence included', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'helgait#dooku-was-a-visionary', upgrades: ['academy-training'] }, 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates.forCard(context.helgait);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);
                expect(context.player1).toHavePrompt('Distribute 8 Advantage tokens among targets');

                // Last known information: the unit as it left play.
                expect(cardStates.getLastKnownProperties(context.helgait).asUnit()
                    .wasInPlay()).toBeTrue();

                // The present: the card in the discard pile, out of play and in no arena, as a selector
                // candidate needs it (D-38).
                const now = cardStates.getCurrentProperties(context.helgait).asUnit();
                expect(now.isInPlay()).toBeFalse();
                expect(now.arena).toBeNull();
                expect(now.zoneName as string).toBe('discard');
                expect(now.isAttached()).toBeFalse();
                expect(now.isResource()).toBeFalse();
                expect(now.printedPower).toBe(6);

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 8]
                ]));
            });

            it('answers that the copy a reference names is nowhere, once the card has become a new copy', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'helgait#dooku-was-a-visionary', upgrades: ['academy-training'] }, 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates.forCard(context.helgait);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);
                expect(context.player1).toHavePrompt('Distribute 8 Advantage tokens among targets');

                const asDefeated = cardStates.getIdentity(context.helgait);

                // Put Helgait straight back into play while its record still exists. Entering play
                // makes it a new copy.
                context.player1.moveCard(context.helgait, 'groundArena');
                expect(context.helgait).toBeInZone('groundArena');
                expect(cardStates.getIdentity(context.helgait)).not.toBe(asDefeated);

                // The defeated copy is in play nowhere, whatever the new copy is doing (SWU 8.5.4). Its
                // zone is where the physical card is.
                const defeatedNow = cardStates.getCurrentProperties(asDefeated).asUnit();
                expect(defeatedNow.isInPlay()).toBeFalse();
                expect(defeatedNow.isAttacking()).toBeFalse();
                expect(defeatedNow.activeAttack).toBeNull();
                expect(defeatedNow.arena).toBeNull();
                expect(defeatedNow.zoneName as string).toBe('groundArena');

                // Its last-known view still reads from its record.
                expect(cardStates.getLastKnownProperties(asDefeated).asUnit()
                    .asWasInPlay().power).toBe(8);

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 8]
                ]));
            });

            it('answers that a copy gone into a hidden zone is in no attack, where the card itself would fail', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'helgait#dooku-was-a-visionary', upgrades: ['academy-training'] }, 'wampa']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates.forCard(context.helgait);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.helgait);
                expect(context.player1).toHavePrompt('Distribute 8 Advantage tokens among targets');

                // From the discard pile into a hidden zone, which makes it a new copy.
                const inDiscard = cardStates.getIdentity(context.helgait);
                context.player1.moveCard(context.helgait, 'hand');
                expect(cardStates.getIdentity(context.helgait)).not.toBe(inDiscard);

                // The card in hand cannot be asked about attacks, on the card or on its current view...
                expect(() => cardStates.getCurrentProperties(context.helgait).asUnit()
                    .isAttacking()).toThrowError();

                // ...but the copy that went to the discard pile is in no attack, so it answers.
                const gone = cardStates.getCurrentProperties(inDiscard).asUnit();
                expect(gone.isInPlay()).toBeFalse();
                expect(gone.isAttacking()).toBeFalse();
                expect(gone.isDefending()).toBeFalse();
                expect(gone.activeAttack).toBeNull();
                expect(gone.zoneName as string).toBe('hand');

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 8]
                ]));
            });

            it('narrows to the members each kind of card has', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', damage: 1 }],
                        base: { card: 'echo-base', damage: 5 }
                    }
                });

                const { context } = contextRef;
                const cardStates = context.game.cardStates;

                const wampa = cardStates.getCurrentProperties(context.wampa).asUnit()
                    .asInPlay();
                expect(wampa.power).toBe(4);
                expect(wampa.remainingHp).toBe(4);
                expect(wampa.exhausted).toBeFalse();
                expect(wampa.isAttacking()).toBeFalse();
                expect(wampa.arena as string).toBe('groundArena');

                const base = cardStates.getCurrentProperties(context.p1Base);
                expect(base.isUnit()).toBeFalse();
                expect(base.isBase()).toBeTrue();
                expect(base.canBeDamaged()).toBeTrue();
                expect(base.damage).toBe(5);
                expect(base.remainingHp).toBe(context.p1Base.getHp() - 5);
                expect(base.arena).toBeNull();

                const leader = cardStates.getCurrentProperties(context.p1Leader);
                expect(leader.isLeader()).toBeTrue();
                expect(leader.canBeExhausted()).toBeTrue();
                expect(leader.exhausted).toBeFalse();
                expect(leader.zoneName as string).toBe('base');
            });
        });

        describe('A pilot', function () {
            it('is recorded as the upgrade it was, on the vehicle it flew', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['nien-nunb#loyal-copilot'] }]
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const registry = context.game.lkiRegistry;
                const awingRef = registry.getIdentity(context.greenSquadronAwing);
                const nienRef = registry.getIdentity(context.nienNunb);

                const recorded = readAtNextFlush(registry, () => {
                    const nien = registry.getProperties(nienRef);
                    return {
                        type: nien.type as string,
                        isUnit: nien.isUnit(),
                        parentCard: nien.isUpgrade() ? nien.parentCard : null,
                        arena: nien.arena as string
                    };
                });

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.nienNunb).toBeInZone('discard', context.player1);

                expect(recorded.ran).toBeTrue();
                expect(recorded.error).toBeNull();
                expect(recorded.value.type).toBe('nonLeaderUnitUpgrade');
                expect(recorded.value.isUnit).toBeFalse();
                expect(recorded.value.parentCard).toBe(awingRef);
                expect(recorded.value.arena).toBe('spaceArena');
            });

            // Open finding F2 (register §B.3). Card code that filters a zone itself, outside a selector,
            // reads through the default getter, which answers from the record for the rest of the action
            // the card left play in. The call below may change with the fix (D-38 is open).
            xit('reads a pilot taken from the discard pile, in the action he went there, as the unit he is there', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['nien-nunb#loyal-copilot'] }]
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const registry = context.game.lkiRegistry;

                // What an opted-in card's getter does with a card it took from a zone: resolve the card's
                // identity now, and read it.
                const fromDiscard = readAtNextFlush(registry, () => {
                    const nien = context.player1.player.discardZone.cards.find((card) => card === context.nienNunb);
                    return registry.getProperties(registry.getIdentity(nien)).isUnit();
                });

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.nienNunb).toBeInZone('discard', context.player1);

                expect(fromDiscard.error).toBeNull();
                expect(fromDiscard.value).toBeTrue();
            });
        });

        describe('A leader unit', function () {
            it('is recorded as the unit it was', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const registry = context.game.lkiRegistry;
                const asUnit = registry.getIdentity(context.p1Leader);

                const recorded = readAtNextFlush(registry, () => {
                    const luke = registry.getProperties(asUnit);
                    return {
                        isUnit: luke.isUnit(),
                        isLeaderUnit: luke.isLeaderUnit(),
                        exhausted: luke.canBeExhausted() ? luke.exhausted : null,
                        arena: luke.arena as string
                    };
                });

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.p1Leader);
                expect(context.p1Leader).toBeInZone('base');
                expect(context.p1Leader.exhausted).toBeTrue();

                expect(recorded.error).toBeNull();
                expect(recorded.value).toEqual({ isUnit: true, isLeaderUnit: true, exhausted: false, arena: 'groundArena' });
            });

            // Open finding F1 (register §B.3). When a leader unit is defeated its leader side enters play
            // as a new copy (SWU 3.4.5, 8.7), but the engine keeps the identity, so for the rest of the
            // action a read of the leader is answered from the defeated unit's record.
            xit('reads the leader as the leader it has become, in the action its unit was defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const registry = context.game.lkiRegistry;

                const afterDefeat = readAtNextFlush(registry, () => {
                    const luke = registry.getProperties(registry.getIdentity(context.p1Leader));
                    return { isUnit: luke.isUnit(), exhausted: luke.canBeExhausted() ? luke.exhausted : null };
                });

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.p1Leader);
                expect(context.p1Leader).toBeInZone('base');

                expect(afterDefeat.error).toBeNull();
                expect(afterDefeat.value).toEqual({ isUnit: false, exhausted: true });
            });
        });

        describe('When a unit leaves play and moves into a hidden zone in the same action', function () {
            it('keeps the record of the unit as it left play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bombing-run'],
                        groundArena: ['hk47#exclamation-die-meatbag', { card: 'moff-gideon#remnant-commander', damage: 2 }],
                        resources: 10
                    },
                    player2: {
                        // Owned by player1 but controlled by player2, so it goes to player1's discard pile,
                        // where Moff Gideon can return it, and player1 controls it there.
                        groundArena: [{ card: 'death-star-stormtrooper', owner: 'player1' }]
                    }
                });

                const { context } = contextRef;

                // 3 damage to each ground unit defeats the Stormtrooper and Moff Gideon. HK-47 survives.
                context.player1.clickCard(context.bombingRun);
                context.player1.clickPrompt('Ground');
                expect(context.deathStarStormtrooper).toBeInZone('discard', context.player1);
                expect(context.moffGideon).toBeInZone('discard', context.player1);

                // Both triggers are player1's. Moff Gideon's goes first and returns the Stormtrooper to
                // hand: a move into a hidden zone, which records the Stormtrooper again under the same
                // identity, this time as it sat in the discard pile, controlled by player1.
                context.player1.clickPrompt('Return a non-unique Imperial unit from your discard pile to your hand.');
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toBeInZone('hand', context.player1);

                // HK-47 then deals 1 damage to "its controller's base", read from the record of the
                // defeat it triggered on: player2 controlled the Stormtrooper when it left play. Had the
                // second record replaced the first, the damage would land on player1's base.
                expect(context.player2.base.damage).toBe(1);
                expect(context.player1.base.damage).toBe(0);
            });

            // Open finding F3 (register §B.3). The identity keeps the first record, the defeat's, so a
            // reference bound to the later move reads the defeat's record too. 8.11 makes the move's own
            // last known information the card as it was in the discard pile.
            xit('reads the card as it was in the discard pile through the reference of the move that took it to hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bombing-run'],
                        groundArena: ['hk47#exclamation-die-meatbag', { card: 'moff-gideon#remnant-commander', damage: 2 }],
                        resources: 10
                    },
                    player2: {
                        groundArena: [{ card: 'death-star-stormtrooper', owner: 'player1' }]
                    }
                });

                const { context } = contextRef;
                const registry = context.game.lkiRegistry;

                let fromMove = null;
                context.game.on('onCardMoved:postResolve', (event) => {
                    if (fromMove === null && event.card === context.deathStarStormtrooper && event.cardRef) {
                        const stormtrooper = registry.getProperties(event.cardRef);
                        fromMove = {
                            controller: stormtrooper.controller,
                            arena: stormtrooper.arena,
                            wasInPlay: stormtrooper.wasInPlay()
                        };
                    }
                });

                context.player1.clickCard(context.bombingRun);
                context.player1.clickPrompt('Ground');
                context.player1.clickPrompt('Return a non-unique Imperial unit from your discard pile to your hand.');
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper).toBeInZone('hand', context.player1);

                expect(fromMove).not.toBeNull();
                expect(fromMove.controller).toBe(context.player1.player);
                expect(fromMove.arena).toBeNull();
                expect(fromMove.wasInPlay).toBeFalse();
            });
        });
    });
});
