
describe('Clone', function() {
    integration(function(contextRef) {
        const clonePrompt = 'This unit enters play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique';

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
                expect(context.player1).toHavePrompt(clonePrompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.wampa);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone.exhausted).toBeTrue();
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, clone1]);

                context.player1.clickCard(clone1);
                expect(context.player1.exhaustedResourceCount).toBe(14);
                expect(clone1).toBeInZone('groundArena');
                expect(clone1).toBeCloneOf(context.wampa);
                expect(clone1.isClone).toBeTrue();
                expect(clone2).toBeInZone('groundArena');
                expect(clone2).toBeCloneOf(context.wampa);
                expect(clone2).toBeCloneOf(clone1);
                expect(clone2.isClone).toBeTrue();
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
                expect(context.player1).toHavePrompt(clonePrompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cloneCommanderCody, groundClone]);

                context.player1.clickCard(groundClone);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(handClone).toBeInZone('groundArena');
                expect(handClone).toBeCloneOf(groundClone);
                expect(handClone).toBeVanillaClone();
                expect(groundClone.isClone).toBeFalse();
                expect(handClone.isClone).toBeTrue();
            });

            it('is not defeated if blanked', async function () {
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
                        hand: ['force-lightning'],
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt(clonePrompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('spaceArena');
                expect(context.clone).toBeCloneOf(context.leiaOrgana);

                context.player2.clickCard(context.forceLightning);
                context.player2.clickCard(context.clone);
                context.player2.chooseListOption('0');

                expect(context.clone).toBeInZone('spaceArena');
            });

            it('should allow to be affected by effects that change printed attributes', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa', 'plo-koon#i-dont-believe-in-chance'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                        hand: ['size-matters-not'],
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt(clonePrompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.ploKoon]);

                context.player1.clickCard(context.ploKoon);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.ploKoon);
                expect(context.clone.getPrintedPower()).toBe(6);
                expect(context.clone.getPrintedHp()).toBe(8);

                context.player2.clickCard(context.sizeMattersNot);
                context.player2.clickCard(context.clone);
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(5);
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
                expect(context.player1).toHavePrompt(clonePrompt);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('discard');
                expect(context.clone.isClone).toBeFalse();
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
                expect(context.player1).toHavePrompt(clonePrompt);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone.getHp()).toBe(1);
                expect(context.clone.isClone).toBeFalse();
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
                expect(context.player1).toHavePrompt(clonePrompt);
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
                expect(context.player1).toHavePrompt(clonePrompt);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.shaakTi);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.shaakTi);
                expect(context.clone.getPrintedTraits()).toContain('force');
                expect(context.clone.getTraits()).toContain('force');
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
                expect(context.player1).toHavePrompt(clonePrompt);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.shaakTi);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.shaakTi);
                expect(context.shaakTi.getTraits()).toContain('mandalorian');
                expect(context.clone.getPrintedTraits()).not.toContain('mandalorian');
                expect(context.clone.getTraits()).not.toContain('mandalorian');
            });

            it('copies printed power and hp even if the unit has a buff', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        hand: ['clone'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst'],
                        leader: { card: 'kanan-jarrus#help-us-survive', deployed: true },
                        hand: ['huyang#enduring-instructor', 'clan-wren-rescuer'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player2.clickCard(context.huyang);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt(clonePrompt);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.battlefieldMarine);
                expect(context.clone.getPower()).toBe(3);
                expect(context.clone.getHp()).toBe(3);
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);

                context.player2.clickCard(context.clanWrenRescuer);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.clone.getPower()).toBe(3);
                expect(context.clone.getHp()).toBe(3);
                expect(context.battlefieldMarine.getPower()).toBe(6);
                expect(context.battlefieldMarine.getHp()).toBe(6);
            });
        });

        describe('when effects interact with its copied attributes', function() {
            it('has the Clone title when checking play restrictions', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone', 'waylay'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: ['regional-governor'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.regionalGovernor);
                context.player2.chooseListOption('Clone');
                expect(context.player1).toBeAbleToSelectNoneOf([context.clone]);
                expect(context.clone).not.toHaveAvailableActionWhenClickedBy(context.player1);

                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.regionalGovernor);

                context.player2.clickCard(context.regionalGovernor);
                context.player2.chooseListOption('Wampa');

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.wampa);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);
            });

            it('has copied title while in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone', 'wampa'],
                        groundArena: ['wampa'],
                        deck: ['wampa'],
                    },
                    player2: {
                        hand: ['annihilator#tagges-flagship'],
                    }
                });

                const { context } = contextRef;

                const inPlayWampa = context.player1.findCardByName('wampa', 'groundArena');
                const inHandWampa = context.player1.findCardByName('wampa', 'hand');
                const inDeckWampa = context.player1.findCardByName('wampa', 'deck');

                context.player1.clickCard(context.clone);
                context.player1.clickCard(inPlayWampa);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(inPlayWampa);

                context.player2.clickCard(context.annihilator);
                context.player2.clickCard(context.clone);
                context.player2.clickPrompt('Done');
                expect(context.clone).toBeInZone('discard');
                expect(context.clone).toBeVanillaClone();
                expect(inHandWampa).toBeInZone('discard');
                expect(inDeckWampa).toBeInZone('discard');
                expect(inPlayWampa).toBeInZone('groundArena');
            });

            it('is not unique even if copying a unique unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['luke-skywalker#a-heros-beginning'],
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['plo-koon#i-dont-believe-in-chance'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.ploKoon);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.ploKoon);
                expect(context.player2).toBeActivePlayer(); // Luke Skylwaker doesn't trigger
            });

            it('has the aspects of the copied card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['sabine-wren#explosives-artist', 'outer-rim-mystic'],
                    },
                    player2: {
                        groundArena: ['cassian-andor#threading-the-eye', 'battlefield-marine'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.sabineWren, context.outerRimMystic, context.p1Base]);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.cassianAndor);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.cassianAndor);

                context.player2.clickCard(context.cassianAndor);
                expect(context.player2).toBeAbleToSelectExactly([context.clone, context.outerRimMystic, context.p1Base]); // Sabine is not selectable anymore
                context.player2.clickCard(context.p1Base);
            });

            it('has the aspects of the copied card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['chancellor-palpatine#wartime-chancellor', 'battle-droid'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.battleDroid);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.battleDroid);
                expect(context.clone.exhausted).toBeFalse(); // Readied by Palpatine's ability because Clone is a token unit
            });

            it('has the cost of the copied card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        deck: ['luke-skywalker#jedi-knight'],
                        hand: ['clone'],
                        groundArena: ['echo-base-defender'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.echoBaseDefender);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.echoBaseDefender);

                context.player2.passAction();

                context.readyCard(context.clone);
                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Reveal the top card of your deck');
                context.player1.clickPrompt('Done');
                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5); // 4 printed power + 1 from Han Solo's ability
            });

            it('has the power of the copied card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.wampa);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);

                context.player2.passAction();

                context.readyCard(context.clone);
                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });

            it('has the hp of the copied card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.wampa);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.clone);
                expect(context.clone.damage).toBe(3);
                expect(context.clone.remainingHp).toBe(2);
            });

            it('has the traits of the copied card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: [{ card: 'sabine-wren#explosives-artist', upgrades: ['the-darksaber'] }],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.sabineWren);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.sabineWren);
                expect(context.clone).toHaveExactUpgradeNames([]);

                context.player2.passAction();

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Deal 1 damage to the defender or a base');
                context.player1.clickCard(context.p2Base);
                expect(context.clone).toHaveExactUpgradeNames(['experience']);
            });
        });

        describe('Keywords', function() {
            it('copies Ambush and can attack when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['syndicate-lackeys'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.syndicateLackeys);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.syndicateLackeys);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.clone.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            });

            it('copies Grit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['scout-bike-pursuer'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.scoutBikePursuer);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.scoutBikePursuer);
                expect(context.clone.getPower()).toBe(1);

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.clone);

                expect(context.clone.damage).toBe(3);
                expect(context.clone.getPower()).toBe(4);
            });

            it('copies Overwhelm', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.wampa);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.wampa);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(1);
            });

            it('copies Raid and the raid value', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['nihil-marauder'],
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.nihilMarauder);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.nihilMarauder);
                expect(context.clone.getPower()).toBe(1); // Power is 1

                context.moveToNextActionPhase();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(4); // Raid value is 3
            });

            it('copies Restore and the restore value', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'echo-base', damage: 2 },
                        hand: ['clone'],
                        groundArena: ['regional-sympathizers'],
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.regionalSympathizers);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.regionalSympathizers);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3); // Attacks for 3
                expect(context.p1Base.damage).toBe(0); // Restore value is 2
            });

            it('copies Saboteur', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone']
                    },
                    player2: {
                        groundArena: [
                            'depa-billaba#a-higher-purpose',
                            'echo-base-defender',
                            { card: 'battlefield-marine', upgrades: ['shield', 'shield'] },
                        ]
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.depaBillaba);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.depaBillaba);

                // Ambushes with Saboteur, ignoring the Sentinel, and defeating the Battlefield Marine's shields
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                // Can target any enemy ground unit
                expect(context.player1).toBeAbleToSelectExactly([
                    context.depaBillaba,
                    context.echoBaseDefender,
                    context.battlefieldMarine
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePrompt('Saboteur: defeat all shields');
                context.player1.clickCard(context.battlefieldMarine);

                // Shields are defeated, and the Battlefield Marine is defeated
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.clone.damage).toBe(3);
            });

            it('copies Sentinel', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['syndicate-lackeys']
                    },
                    player2: {
                        groundArena: [
                            'niima-outpost-constables'
                        ]
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.niimaOutpostConstables);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.niimaOutpostConstables);

                // Player 2's ground unit can only attack clone because it is Sentinel
                context.player2.clickCard(context.niimaOutpostConstables);
                expect(context.player2).toBeAbleToSelectExactly([context.clone]);
                context.player2.clickCard(context.clone);

                expect(context.clone.damage).toBe(2);
                expect(context.niimaOutpostConstables.damage).toBe(2);
            });

            it('copies Shielded and enters play with a shield', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['outer-rim-outlaws']
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.outerRimOutlaws);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.outerRimOutlaws);
                expect(context.clone).toHaveExactUpgradeNames(['shield']);
            });

            it('copies Smuggle and its cost value (but does not affect how the card is played)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['tobias-beckett#i-trust-no-one']
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.tobiasBeckett);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.tobiasBeckett);

                const keywordsWithCostValues = context.clone.getKeywordsWithCostValues('smuggle');

                expect(keywordsWithCostValues.length).toBe(1);
                expect(keywordsWithCostValues[0].name).toBe('smuggle');
                expect(keywordsWithCostValues[0].cost).toBe(5);
                expect(keywordsWithCostValues[0].aspects).toEqual(['vigilance']);
            });

            // TODO: Add test for Bounty when card ability setup is implemented
            // TODO: Add test for Coordinate when card ability setup is implemented

            it('copies Exploit and its numeric value (but does not affect how the card is played)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['droideka-security']
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.droidekaSecurity);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.droidekaSecurity);

                const keywordsWithNumericValues = context.clone.getKeywordsWithNumericValues('exploit');

                expect(keywordsWithNumericValues.length).toBe(1);
                expect(keywordsWithNumericValues[0].name).toBe('exploit');
                expect(keywordsWithNumericValues[0].value).toBe(2);
            });

            it('copies Piloting and its cost value (but does not affect how the card is played)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: [
                            { card: 'the-mandalorian#weathered-pilot', exhausted: true },
                        ],
                        spaceArena: ['razor-crest#ride-for-hire'],
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.theMandalorian);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.theMandalorian);

                const keywordsWithCostValues = context.clone.getKeywordsWithCostValues('piloting');

                expect(keywordsWithCostValues.length).toBe(1);
                expect(keywordsWithCostValues[0].name).toBe('piloting');
                expect(keywordsWithCostValues[0].cost).toBe(2);
                expect(keywordsWithCostValues[0].aspects).toEqual(['cunning']);
            });

            it('copies Hidden', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'vulptex']
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.vulptex);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.vulptex);
                expect(context.clone.hasSomeKeyword('hidden')).toBeTrue();

                // Vulptex has Hidden, so Clone cannot be targeted by the Battlefield Marine
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                context.player2.clickCard(context.p1Base);

                context.moveToNextActionPhase();
                context.player1.passAction();

                // Clone can now be targeted for attack since Hidden's effect has expired
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.clone, context.p1Base]);
                context.player2.clickCard(context.clone);

                expect(context.clone).toBeInZone('discard', context.player1);
            });

            it('copies multiple printed Keywords', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone'],
                        groundArena: ['gor#grievouss-pet']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'consular-security-force']
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.gorGrievoussPet);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.gorGrievoussPet);

                // It gains Ambush
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                // It gains Overwhelm
                expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
                expect(context.p2Base.damage).toBe(4);

                // It gains Sentinel (opponent can only attack the Sentinel units)
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeAbleToSelectExactly([context.clone, context.gor]);
                context.player2.clickCard(context.clone);
            });

            it('does not copy Keywords that are gained by other effects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['clone']
                    },
                    player2: {
                        groundArena: [
                            {
                                card: 'battlefield-marine',
                                upgrades: [
                                    'devotion', // Attached unit gains Restore 2
                                    'protector' // Attached unit gains Sentinel
                                ]
                            }
                        ]
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.battlefieldMarine);
                expect(context.clone.hasSomeKeyword('restore')).toBeFalse();
                expect(context.clone.hasSomeKeyword('sentinel')).toBeFalse();

                // Battlefield Marine can attack base because Clone does not have Sentinel
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.clone, context.p1Base]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(5);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.battlefieldMarine);

                // Player 1's base was not restored because Clone does not have Restore
                expect(context.p1Base.damage).toBe(5);
            });

            it('combines gained Keywords with printed Keywords correctly', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'echo-base', damage: 3 },
                        hand: ['clone'],
                        spaceArena: [
                            'home-one#alliance-flagship',   // Friendly units gain Restore 1
                            'red-three#unstoppable'         // Friendly Heroism units gain Raid 1
                        ]
                    },
                    player2: {
                        groundArena: [
                            'sundari-peacekeeper' // Raid 2, Restore 2
                        ]
                    }
                });

                const { context } = contextRef;

                expect(context.clone).toBeVanillaClone();

                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone).toBeCloneOf(context.sundariPeacekeeper);

                context.moveToNextActionPhase();

                // Clone attacks, with Restore 3 and Raid 3
                context.player1.clickCard(context.clone);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(4);
                expect(context.p1Base.damage).toBe(0);
            });
        });
    });
});