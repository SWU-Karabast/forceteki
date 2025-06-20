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

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);
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
                        spaceArena: ['graceful-purrgil'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.gracefulPurrgil]);

                context.player1.clickCard(context.gracefulPurrgil);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('spaceArena');
                expect(context.clone).toBeCloneOf(context.gracefulPurrgil);
            });

            it('should pay aspect penalties for Clone\'s aspects instead of the copied unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'fortress-vader',
                        hand: ['clone'],
                        groundArena: ['wampa', { card: 'enfys-nest#marauder', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['graceful-purrgil'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(9); // 7 + 2 from aspect penalty
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);
            });

            it('should use Clone cost when calculating cost discounts', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['graceful-purrgil'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.gracefulPurrgil);
                expect(context.player1.exhaustedResourceCount).toBe(4); // 7 / 2 because of The Starhawk
                expect(context.clone).toBeInZone('spaceArena');
                expect(context.clone).toBeCloneOf(context.gracefulPurrgil);
            });

            it('should use Clone cost when calculating cost increases', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['graceful-purrgil'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                        hand: ['qira#playing-her-part'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player2.clickCard(context.qira);
                context.player2.clickPrompt('Done');
                context.player2.chooseListOption('Clone');

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(10); // 7 + 3 from Qi'ra
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.battlefieldMarine);
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

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.battlefieldMarine);
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

                context.player1.clickCard(context.wampa);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);
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

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(9);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.battlefieldMarine);
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

                context.player1.clickCard(context.wampa);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);
            });
        });

        describe('when it enters play multiple times', function() {
            it('can enter play each time as a different non-unique copy of another unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone', 'unexpected-escape', 'palpatines-return'],
                        groundArena: ['wampa', 'grand-inquisitor#youre-right-to-be-afraid'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', { card: 'atst', upgrades: ['experience'] }],
                        spaceArena: ['leia-organa#extraordinary'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                        hand: ['cad-bane#hostage-taker', 'vanquish', 'waylay'],
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.grandInquisitor, context.leiaOrgana]);

                context.player1.clickCard(context.wampa);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);

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
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.grandInquisitor, context.leiaOrgana, context.cadBane]);

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
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.grandInquisitor, context.leiaOrgana, context.cadBane]);

                context.player1.clickCard(context.grandInquisitor);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.grandInquisitor);

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.clone);
                expect(context.clone).toBeInZone('hand');
                expect(context.clone).toBeVanillaClone();

                context.player1.readyResources(7);
                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.grandInquisitor, context.leiaOrgana, context.cadBane]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.battlefieldMarine);

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.clone);
                expect(context.atst.damage).toBe(3);
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

                context.player2.clickCard(context.cloneTrooper);
                context.player2.clickCard(context.clone);
                expect(context.clone).toBeInZone('discard');
                expect(context.clone).toBeVanillaClone();
                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
            });

            it('remains in play as a copy of that unit if the unit is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);
            });

            it('can copy another cloned unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone', 'clone'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                const clone1 = context.player1.findCardsByName('clone')[0];
                const clone2 = context.player1.findCardsByName('clone')[1];

                expect(clone1).toBeVanillaClone();
                expect(clone2).toBeVanillaClone();

                context.player1.clickCard(clone1);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(clone1).toBeInZone('groundArena');
                expect(clone1).toBeCloneOf(context.wampa);
                expect(clone2).toBeInZone('hand');
                expect(clone2).toBeVanillaClone();

                context.player2.passAction();

                context.player1.clickCard(clone2);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, clone1]);

                context.player1.clickCard(clone1);
                expect(context.player1.exhaustedResourceCount).toBe(14);
                expect(clone1).toBeInZone('groundArena');
                expect(clone1).toBeCloneOf(context.wampa);
                expect(clone2).toBeInZone('groundArena');
                expect(clone2).toBeCloneOf(context.wampa);
                expect(clone2).toBeCloneOf(clone1);
            });

            it('can copy another vanilla clone', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', 'clone', 'clone-commander-cody#commanding-the-212th'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                const handClone = context.player1.findCardByName('clone', 'hand');
                const groundClone = context.player1.findCardByName('clone', 'groundArena');

                expect(handClone).toBeVanillaClone();
                expect(groundClone).toBeVanillaClone();

                context.player1.clickCard(handClone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cloneCommanderCody, groundClone]);

                context.player1.clickCard(groundClone);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(handClone).toBeInZone('groundArena');
                expect(handClone).toBeCloneOf(groundClone);
                expect(handClone).toBeVanillaClone();
            });
        });

        describe('when it enters play as itself', function() {
            it('should be defeated immediately', async function () {
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

            it('should survives if an effect increases its hp', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', 'enfys-nest#marauder', 'clone-commander-cody#commanding-the-212th'],
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
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone.getHp()).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('when it copies a unit with modified printed attributes', function() {
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

        describe('when it copies a unit with modified non-printed attributes', function() {
            it('copies printed traits even if the unit lost a trait', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', 'nameless-terror'],
                    },
                    player2: {
                        groundArena: ['shaak-ti#unity-wins-wars', 'atst'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.namelessTerror);
                context.player1.clickCard(context.p2Base);
                expect(context.shaakTi.getPrintedTraits()).toContain('force');
                expect(context.shaakTi.getTraits()).not.toContain('force');

                context.player2.passAction();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.shaakTi);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.shaakTi);
                expect(context.clone.getPrintedTraits()).toContain('force');
            });

            it('copies printed traits even if the unit gained a trait', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', 'nameless-terror'],
                    },
                    player2: {
                        groundArena: [{ card: 'shaak-ti#unity-wins-wars', upgrades: ['foundling'] }, 'atst'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.shaakTi);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.shaakTi);
                expect(context.shaakTi.getTraits()).toContain('mandalorian');
                expect(context.clone.getPrintedTraits()).not.toContain('mandalorian');
            });
        });
    });
});