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

                expect(context.clone.title).toBe('Clone');
                expect(context.clone.subtitle).toBe('');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['command']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['clone']));
                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.enfysNest);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone.title).toBe('Enfys Nest');
                expect(context.clone.subtitle).toBe('Marauder');
                expect(context.clone.printedCost).toBe(6);
                expect(context.clone.aspects).toEqual(['cunning']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['underworld']));
                expect(context.clone.traits).toEqual(new Set(['underworld', 'clone']));
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(4);
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
                        hasForceToken: true,
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.leiaOrgana);
                expect(context.leiaOrgana).toBeInZone('groundArena');

                expect(context.clone.title).toBe('Clone');
                expect(context.clone.subtitle).toBe('');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['command']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['clone']));
                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('spaceArena');
                expect(context.clone.title).toBe('Leia Organa');
                expect(context.clone.subtitle).toBe('Extraordinary');
                expect(context.clone.printedCost).toBe(5);
                expect(context.clone.aspects).toEqual(['command', 'heroism']);
                expect(context.clone.defaultArena).toBe('spaceArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['force', 'resistance', 'official']));
                expect(context.clone.traits).toEqual(new Set(['force', 'resistance', 'official', 'clone']));
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(5);
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

                expect(context.clone.title).toBe('Clone');
                expect(context.clone.subtitle).toBe('');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['command']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['clone']));
                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cloneTrooper, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone.title).toBe('Clone Trooper');
                expect(context.clone.subtitle).toBe('');
                expect(context.clone.printedCost).toBe(0);
                expect(context.clone.aspects).toEqual(['heroism']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('tokenUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['republic', 'clone', 'trooper']));
                expect(context.clone.traits).toEqual(new Set(['republic', 'clone', 'trooper']));
                expect(context.clone.getPrintedPower()).toBe(2);
                expect(context.clone.getPrintedHp()).toBe(2);
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
                expect(context.clone.title).toBe('Enfys Nest');
                expect(context.clone.subtitle).toBe('Champion of Justice');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['cunning', 'heroism']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['underworld']));
                expect(context.clone.traits).toEqual(new Set(['underworld', 'clone']));
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(7);
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
                expect(context.clone.title).toBe('Enfys Nest');
                expect(context.clone.subtitle).toBe('Champion of Justice');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['cunning', 'heroism']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['underworld']));
                expect(context.clone.traits).toEqual(new Set(['underworld', 'clone']));
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(7);
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
                expect(context.clone.title).toBe('Enfys Nest');
                expect(context.clone.subtitle).toBe('Champion of Justice');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['cunning', 'heroism']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['underworld']));
                expect(context.clone.traits).toEqual(new Set(['underworld', 'clone']));
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(7);
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
                expect(context.clone.title).toBe('Enfys Nest');
                expect(context.clone.subtitle).toBe('Champion of Justice');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['cunning', 'heroism']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['underworld']));
                expect(context.clone.traits).toEqual(new Set(['underworld', 'clone']));
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(7);
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

                expect(context.clone.title).toBe('Clone');
                expect(context.clone.subtitle).toBe('');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['command']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['clone']));
                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.enfysNest);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone.title).toBe('Enfys Nest');
                expect(context.clone.subtitle).toBe('Champion of Justice');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['cunning', 'heroism']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['underworld']));
                expect(context.clone.traits).toEqual(new Set(['underworld', 'clone']));
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(7);

                context.player2.clickCard(context.cadBane);
                context.player2.clickCard(context.clone);
                context.player2.clickPrompt('Done');
                expect(context.clone).toBeCapturedBy(context.cadBane);
                expect(context.clone.title).toBe('Clone');
                expect(context.clone.subtitle).toBe('');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['command']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['clone']));
                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);

                context.player1.clickCard(context.unexpectedEscape);
                context.player1.clickCard(context.cadBane);
                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana, context.cadBane]);

                context.player1.clickCard(context.leiaOrgana);
                expect(context.clone).toBeInZone('spaceArena');
                expect(context.clone.title).toBe('Leia Organa');
                expect(context.clone.subtitle).toBe('Extraordinary');
                expect(context.clone.printedCost).toBe(5);
                expect(context.clone.aspects).toEqual(['command', 'heroism']);
                expect(context.clone.defaultArena).toBe('spaceArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['force', 'resistance', 'official']));
                expect(context.clone.traits).toEqual(new Set(['force', 'resistance', 'official', 'clone']));
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(5);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.clone);
                expect(context.clone).toBeInZone('discard');
                expect(context.clone.title).toBe('Clone');
                expect(context.clone.subtitle).toBe('');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['command']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['clone']));
                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);

                context.player1.clickCard(context.palpatinesReturn);
                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana, context.cadBane]);

                context.player1.clickCard(context.cadBane);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone.title).toBe('Cad Bane');
                expect(context.clone.subtitle).toBe('Hostage Taker');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['villainy', 'cunning']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['underworld', 'bounty hunter']));
                expect(context.clone.traits).toEqual(new Set(['underworld', 'bounty hunter', 'clone']));
                expect(context.clone.getPrintedPower()).toBe(7);
                expect(context.clone.getPrintedHp()).toBe(7);

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.clone);
                expect(context.atst.damage).toBe(7);
                expect(context.clone).toBeInZone('discard');
                expect(context.clone.title).toBe('Clone');
                expect(context.clone.subtitle).toBe('');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['command']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['clone']));
                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);
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
                    }
                });

                const { context } = contextRef;

                expect(context.clone.title).toBe('Clone');
                expect(context.clone.subtitle).toBe('');
                expect(context.clone.printedCost).toBe(7);
                expect(context.clone.aspects).toEqual(['command']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['clone']));
                expect(context.clone.getPrintedPower()).toBe(0);
                expect(context.clone.getPrintedHp()).toBe(0);

                context.player1.clickCard(context.clone);
                expect(context.player1).toHavePrompt('This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.enfysNest, context.leiaOrgana]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.clone).toBeInZone('groundArena');
                expect(context.clone.title).toBe('Battlefield Marine');
                expect(context.clone.subtitle).toBe('');
                expect(context.clone.printedCost).toBe(2);
                expect(context.clone.aspects).toEqual(['command', 'heroism']);
                expect(context.clone.defaultArena).toBe('groundArena');
                expect(context.clone.unique).toBeFalse();
                expect(context.clone.printedType).toBe('basicUnit');
                expect(context.clone.getPrintedTraits()).toEqual(new Set(['rebel', 'trooper']));
                expect(context.clone.traits).toEqual(new Set(['rebel', 'trooper', 'clone']));
                expect(context.clone.getPrintedPower()).toBe(5);
                expect(context.clone.getPrintedHp()).toBe(5);
            });
        });
    });
});