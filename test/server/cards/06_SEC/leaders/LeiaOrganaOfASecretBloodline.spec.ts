describe('Leia Organa, Of a Secret Bloodline', () => {
    integration(function (contextRef) {
        const disclosePrompt = 'Disclose Vigilance, Command, Aggression, Cunning, or Heroism to give an experience token to a unit that does not share an aspect with the disclosed card';
        const experiencePrompt = 'Give experience to a unit that does not share an aspect with the disclosed card';

        describe('Leia Organa\'s undeployed ability', function () {
            it('Gives an experience token to a unit that does not share an aspect with the disclosed card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#of-a-secret-bloodline',
                        resources: 5,
                        hand: [
                            'secretive-sage',
                            'escort-skiff',
                            'cantina-braggart',
                            'crafty-smuggler',
                            'viper-probe-droid',
                            'fleet-lieutenant',
                            'constructed-lightsaber',
                        ],
                        groundArena: ['battlefield-marine', 'consular-security-force', 'porg'],
                        spaceArena: ['concord-dawn-interceptors', 'green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);

                // Prompt to disclose required aspects
                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.secretiveSage,
                    context.escortSkiff,
                    context.cantinaBraggart,
                    context.craftySmuggler,
                    context.fleetLieutenant
                    // Villainy and Neutral aspect cards are not selectable
                ]);

                // Disclose Secretive Sage (Vigilance)
                context.player1.clickCard(context.secretiveSage);

                // Cards are revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.secretiveSage]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                expect(context.player1).toHavePrompt(experiencePrompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Cards with Vigilance aspect are not selectable
                    context.battlefieldMarine,
                    context.greenSquadronAwing,
                    context.porg,

                    // Enemy units are valid targets
                    context.atst
                ]);

                context.player1.clickCard(context.porg);

                expect(context.leiaOrgana.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.porg).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('When no cards are in hand, the ability has no effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#of-a-secret-bloodline',
                        resources: 5,
                        hand: [],
                        groundArena: ['battlefield-marine', 'consular-security-force', 'porg'],
                        spaceArena: ['concord-dawn-interceptors', 'green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveNoEffectAbilityPrompt(disclosePrompt);
                context.player1.clickPrompt('Use it anyway');

                // Ability resolves with no effect
                expect(context.player2).toBeActivePlayer();
                expect(context.leiaOrgana.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('When cards in hand do not have the required aspects, the ability has no effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#of-a-secret-bloodline',
                        resources: 5,
                        hand: [
                            'constructed-lightsaber',
                            'viper-probe-droid'
                        ],
                        groundArena: ['battlefield-marine', 'consular-security-force', 'porg'],
                        spaceArena: ['concord-dawn-interceptors', 'green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveNoEffectAbilityPrompt(disclosePrompt);
                context.player1.clickPrompt('Use it anyway');

                // Ability resolves with no effect
                expect(context.player2).toBeActivePlayer();
                expect(context.leiaOrgana.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('When no units are on board, the experience part of the ability is automatically skipped', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#of-a-secret-bloodline',
                        resources: 5,
                        hand: [
                            'secretive-sage',
                            'viper-probe-droid'
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);

                // Prompt to disclose required aspects
                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.secretiveSage
                ]);
                context.player1.clickCard(context.secretiveSage);

                // Cards are revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.secretiveSage]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Ability resolves with no effect
                expect(context.player2).toBeActivePlayer();
                expect(context.leiaOrgana.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('Can choose to disclose nothing and have no effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#of-a-secret-bloodline',
                        resources: 5,
                        hand: [
                            'secretive-sage',
                            'viper-probe-droid'
                        ],
                        groundArena: ['battlefield-marine', 'consular-security-force', 'porg']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);

                // Prompt to disclose required aspects
                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.secretiveSage
                ]);
                context.player1.clickPrompt('Choose nothing');

                // Ability resolves with no effect
                expect(context.player2).toBeActivePlayer();
                expect(context.leiaOrgana.exhausted).toBeTrue();
            });
        });

        describe('Leia Organa\'s deployed on-attack ability', function () {
            it('Gives an experience token to a unit that does not share an aspect with the disclosed card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'leia-organa#of-a-secret-bloodline',
                            deployed: true
                        },
                        resources: 5,
                        hand: [
                            'secretive-sage',
                            'escort-skiff',
                            'cantina-braggart',
                            'crafty-smuggler',
                            'viper-probe-droid',
                            'fleet-lieutenant',
                            'constructed-lightsaber',
                        ],
                        groundArena: ['battlefield-marine', 'consular-security-force', 'porg'],
                        spaceArena: ['concord-dawn-interceptors', 'green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Attack with Leia Organa
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.p2Base);

                // Prompt to disclose required aspects
                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.secretiveSage,
                    context.escortSkiff,
                    context.cantinaBraggart,
                    context.craftySmuggler,
                    context.fleetLieutenant
                    // Villainy and Neutral aspect cards are not selectable
                ]);

                // Disclose Escort Skiff (Command)
                context.player1.clickCard(context.escortSkiff);

                // Cards are revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.escortSkiff]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                expect(context.player1).toHavePrompt(experiencePrompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    // Cards with Command aspect are not selectable
                    context.consularSecurityForce,
                    context.greenSquadronAwing,
                    context.concordDawnInterceptors,
                    context.porg,

                    // She can target herself
                    context.leiaOrgana,

                    // Enemy units are valid targets
                    context.atst
                ]);

                context.player1.clickCard(context.leiaOrgana);

                expect(context.leiaOrgana.exhausted).toBeTrue();
                expect(context.leiaOrgana).toHaveExactUpgradeNames(['experience']);
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('When no cards are in hand, the ability is automatically skipped', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'leia-organa#of-a-secret-bloodline',
                            deployed: true
                        },
                        resources: 5,
                        hand: [],
                    }
                });

                const { context } = contextRef;

                // Attack with Leia Organa
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.p2Base);

                // Ability is skipped
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
                expect(context.leiaOrgana.exhausted).toBeTrue();
            });

            it('When cards in hand do not have the required aspects, the ability is automatically skipped', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'leia-organa#of-a-secret-bloodline',
                            deployed: true
                        },
                        resources: 5,
                        hand: [
                            'constructed-lightsaber',
                            'viper-probe-droid'
                        ],
                    }
                });

                const { context } = contextRef;

                // Attack with Leia Organa
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.p2Base);

                // Ability is skipped
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
                expect(context.leiaOrgana.exhausted).toBeTrue();
            });

            it('Can choose to disclose nothing and have no effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: {
                            card: 'leia-organa#of-a-secret-bloodline',
                            deployed: true
                        },
                        resources: 5,
                        hand: [
                            'secretive-sage',
                            'viper-probe-droid'
                        ],
                        groundArena: ['battlefield-marine', 'consular-security-force', 'porg']
                    }
                });

                const { context } = contextRef;

                // Attack with Leia Organa
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.p2Base);

                // Prompt to disclose required aspects
                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.secretiveSage
                ]);
                context.player1.clickPrompt('Choose nothing');

                // Ability resolves with no effect
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
                expect(context.leiaOrgana.exhausted).toBeTrue();
            });
        });
    });
});