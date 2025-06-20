describe('Clone', function() {
    integration(function(contextRef) {
        describe('when played from hand', function() {
            it('should enter play as non-unique copy of another friendly unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', { card: 'enfys-nest#marauder', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['leia-organa#extraordinary'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.enfysNest);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.enfysNest);
            });

            it('should enter play as non-unique copy of another enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', { card: 'enfys-nest#marauder', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: [{ card: 'leia-organa#extraordinary', exhausted: true }],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('spaceArena');
                expect(context.clone).toBeCloneOf(context.leiaOrgana);
            });

            it('should be defeated immediately if enters play as itself', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', { card: 'enfys-nest#marauder', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: [{ card: 'leia-organa#extraordinary', exhausted: true }],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('can copy token units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', { card: 'enfys-nest#marauder', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: ['clone-trooper', 'atst'],
                        spaceArena: ['leia-organa#extraordinary'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cloneTrooper, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.cloneTrooper);
            });
        });

        describe('when played from discard', function() {
            it('should enter play as non-unique copy of another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        discard: ['clone'],
                        hand: ['palpatines-return'],
                        groundArena: ['wampa', 'enfys-nest#champion-of-justice'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['leia-organa#extraordinary'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.palpatinesReturn);
                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.enfysNest);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.enfysNest);
            });
        });

        describe('when rescued from capture', function() {
            it('should enter play as non-unique copy of another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['unexpected-escape'],
                        groundArena: ['wampa', 'enfys-nest#champion-of-justice'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', { card: 'atst', capturedUnits: ['clone'] }],
                        spaceArena: ['leia-organa#extraordinary'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.unexpectedEscape);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.enfysNest);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.enfysNest);
            });
        });

        describe('when smuggled from resources', function() {
            it('should enter play as non-unique copy of another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        groundArena: ['wampa', 'enfys-nest#champion-of-justice', 'tech#source-of-insight'],
                        resources: ['clone', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug', 'underworld-thug'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['leia-organa#extraordinary'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana, context.tech]);

                context.player1.clickCard(context.enfysNest);
                expect(context.player1.exhaustedResourceCount).toBe(9);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.enfysNest);
            });
        });

        describe('when played from deck', function() {
            it('should enter play as non-unique copy of another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['uwing-reinforcement'],
                        groundArena: ['wampa', 'enfys-nest#champion-of-justice'],
                        deck: ['clone'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['leia-organa#extraordinary'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.uwingReinforcement);
                context.player1.clickCardInDisplayCardPrompt(context.clone);
                context.player1.clickPrompt('Play cards in selection order');
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.enfysNest);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.enfysNest);
            });
        });

        describe('when it enters play multiple times', function() {
            it('can enter play each time as a different non-unique copy of another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone', 'unexpected-escape', 'palpatines-return'],
                        groundArena: ['wampa', 'enfys-nest#champion-of-justice'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', { card: 'atst', upgrades: ['experience'] }],
                        spaceArena: ['leia-organa#extraordinary'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                        hand: ['cad-bane#hostage-taker', 'vanquish'],
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.enfysNest);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.enfysNest);

                context.player2.clickCard(context.cadBane);
                context.player2.clickCard(context.clone);
                context.player2.clickPrompt('Done');
                expect(context.clone).toBeCapturedBy(context.cadBane);
                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.unexpectedEscape);
                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana, context.cadBane]);

                context.player1.clickCard(context.leiaOrgana);
                expect(context.clone).toBeInZone('spaceArena');
                expect(context.clone).toBeCloneOf(context.leiaOrgana);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.clone);
                expect(context.clone).toBeInZone('discard');
                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.palpatinesReturn);
                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana, context.cadBane]);

                context.player1.clickCard(context.cadBane);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.cadBane);

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.clone);
                expect(context.atst.damage).toBe(7);
                expect(context.clone).toBeInZone('discard');
                expect(context.clone).toBeVanillaClone();
            });
        });

        describe('when it enters play as a copy of another unit', function() {
            it('should be in the default arena of the copied card even if the copied card is in a different arena', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', { card: 'enfys-nest#marauder', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: [{ card: 'leia-organa#extraordinary', exhausted: true }],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                        hasForceToken: true,
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.leiaOrgana);
                expect(context.leiaOrgana).toBeInZone('groundArena');

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('spaceArena');
                expect(context.clone).toBeCloneOf(context.leiaOrgana);
            });
        });

        describe('when it copies a unit with modified printed traits', function() {
            it('copies the new printed power and hp', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', { card: 'enfys-nest#marauder', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['size-matters-not'] }, 'atst'],
                        spaceArena: ['leia-organa#extraordinary'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                        hand: ['disabling-fang-fighter'],
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.battlefieldMarine);

                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.sizeMattersNot);
                expect(context.battlefieldMarine.getPrintedPower()).toBe(3);
                expect(context.battlefieldMarine.getPrintedHp()).toBe(3);
                expect(context.clone).not.toBeCloneOf(context.battlefieldMarine);
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(5);
            });
        });
    });
});