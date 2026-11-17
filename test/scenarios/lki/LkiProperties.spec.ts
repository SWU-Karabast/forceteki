/**
 * Tests for what a card's properties answer, and as of when (D-36 to D-39).
 *
 * A characteristic answers about the moment the properties object represents: now for a live view,
 * the instant the card left play for a recorded one. Presence — where the card is, whether it is in
 * play, attached, attacking or defending — always answers about now (D-37). A selector's candidate is
 * read as it is now (D-38).
 *
 * Each recorded-view test reads inside the action that wrote the record, while a prompt holds it
 * open, because the flush at the end of the action clears the record.
 *
 * See long-term-project-docs/lki-redesign-decisions-and-insights.md.
 */

describe('Last known information properties', function () {
    integration(function (contextRef) {
        describe('A recorded view', function () {
            it('answers characteristics as the unit left play, and presence as it is now', async function () {
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
                expect(helgait.hasInPlayStats()).toBeTrue();
                const inPlay = helgait.asInPlayStats();
                expect(inPlay.power).toBe(8);
                expect(inPlay.hp).toBe(6);
                expect(inPlay.damage).toBe(0);
                expect(inPlay.isUpgraded()).toBeTrue();
                expect(inPlay.upgrades).toEqual([cardStates.getIdentity(context.academyTraining)]);

                // Presence, as it is now.
                expect(helgait.zoneName as string).toBe('discard');
                expect(helgait.isInPlay()).toBeFalse();

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 8]
                ]));
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

                expect(upgrade.parentCard).toBe(cardStates.getIdentity(context.helgait));
                expect(upgrade.parentUnit).toBe(cardStates.getIdentity(context.helgait));
                expect(upgrade.parentCardController).toBe(context.player1.player);
                expect(upgrade.printedUpgradePower).toBe(2);
                expect(upgrade.arena as string).toBe('groundArena');

                // Whether it is attached is presence, so it answers about now.
                expect(upgrade.isAttached()).toBeFalse();

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 8]
                ]));
            });
        });

        describe('The present-state read', function () {
            it('reads a card as it is now even while it has a record, as a selector candidate needs', async function () {
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
                    .hasInPlayStats()).toBeTrue();

                // The present: the card in the discard pile, which has no in-play stats or arena (D-38).
                const now = cardStates.getCurrentProperties(context.helgait).asUnit();
                expect(now.hasInPlayStats()).toBeFalse();
                expect(now.arena).toBeNull();
                expect(now.zoneName as string).toBe('discard');
                expect(now.printedPower).toBe(6);

                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 8]
                ]));
            });
        });

        describe('A live view', function () {
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
                    .asInPlayStats();
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
                expect(leader.isInPlay()).toBeFalse();
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
        });
    });
});
