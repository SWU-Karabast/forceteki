describe('Sebulba\'s Podracer, Taking the Lead', () => {
    integration(function(contextRef) {
        describe('Triggered ability', function() {
            it('readies Sebulba\'s Podracer when a card is discarded from deck by friendly card effect (Sebulba leader)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sebulba#especially-dangerous-dug',
                        resources: 3,
                        deck: ['confiscate'],
                        groundArena: [{ card: 'sebulbas-podracer#taking-the-lead', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                // Use Sebulba's leader ability
                context.player1.clickCard(context.sebulba);
                expect(context.player1).toHavePrompt('Select a friendly unit to gain Raid 1 for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.sebulbasPodracer]);
                context.player1.clickCard(context.sebulbasPodracer);

                // Ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Ready Sebulba\'s Podracer');
                context.player1.clickPrompt('Trigger');

                // Sebulba's Podracer is readied
                expect(context.sebulbasPodracer.exhausted).toBeFalse();
            });

            it('readies Sebulba\'s Podracer when a card is discarded from deck by enemy card effect (Sabè leader)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['confiscate', 'restock'],
                        groundArena: [{ card: 'sebulbas-podracer#taking-the-lead', exhausted: true }]
                    },
                    player2: {
                        hasInitiative: true,
                        leader: 'sabe#queens-shadow',
                        spaceArena: ['green-squadron-awing']
                    }
                });

                const { context } = contextRef;

                // P2 attacks base with A-Wing to trigger Sabè's ability
                context.player2.clickCard(context.greenSquadronAwing);
                context.player2.clickCard(context.p1Base);

                // Sabè's ability triggers and discards from P1's deck
                expect(context.player2).toHavePassAbilityPrompt('Exhaust this leader. If you do, look at the top 2 cards of the defending player\'s deck. Discard 1 of those cards');
                context.player2.clickPrompt('Trigger');

                expect(context.player2).toHaveExactDisplayPromptCards({
                    selectable: [context.confiscate, context.restock]
                });
                context.player2.clickCardInDisplayCardPrompt(context.confiscate);

                // Sebulba's Podracer ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Ready Sebulba\'s Podracer');
                context.player1.clickPrompt('Trigger');

                // Sebulba's Podracer is readied
                expect(context.sebulbasPodracer.exhausted).toBeFalse();
            });

            it('can only ready once per round by the controller', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        groundArena: [{ card: 'sebulbas-podracer#taking-the-lead', exhausted: true }]
                    },
                    player2: {
                        hasInitiative: true,
                        groundArena: [
                            'satine-kryze#committed-to-peace',
                            'battlefield-marine'
                        ]
                    }
                });

                const { context } = contextRef;

                // P2 uses Satine's action ability to discard from P1's deck
                context.player2.clickCard(context.satineKryze);
                context.player2.clickPrompt('Discard cards from an opponent\'s deck equal to half this unit\'s remaining HP, rounded up');

                // Sebulba's Podracer ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Ready Sebulba\'s Podracer');
                context.player1.clickPrompt('Trigger');

                // Sebulba's Podracer is readied
                expect(context.sebulbasPodracer.exhausted).toBeFalse();

                // P1 attacks with Sebulba's Podracer to exhaust it again
                context.player1.clickCard(context.sebulbasPodracer);
                context.player1.clickPrompt('Attack'); // Select Attack, since this also gains Satine's ability
                context.player1.clickCard(context.p2Base);
                expect(context.sebulbasPodracer.exhausted).toBeTrue();

                // P2 uses Battlefield Marine's gained ability from Satine to discard from P1's deck
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickPrompt('Discard cards from an opponent\'s deck equal to half this unit\'s remaining HP, rounded up');

                // Sebulba's Podracer ability does NOT trigger again
                expect(context.player1).toBeActivePlayer();
                expect(context.sebulbasPodracer.exhausted).toBeTrue();
            });

            it('can be used again by the opponent if they take control of Sebulba\'s Podracer', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sebulba#especially-dangerous-dug',
                        resources: 3,
                        groundArena: [
                            { card: 'sebulbas-podracer#taking-the-lead', exhausted: true },
                            'kanan-jarrus#revealed-jedi'
                        ],
                        deck: ['confiscate']
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        deck: ['restock']
                    }
                });

                const { context } = contextRef;

                // P1 uses Sebulba's leader ability, readying their Podracer
                context.player1.clickCard(context.sebulba);
                context.player1.clickCard(context.sebulbasPodracer);
                expect(context.confiscate).toBeInZone('discard', context.player1);

                // Ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Ready Sebulba\'s Podracer');
                context.player1.clickPrompt('Trigger');
                expect(context.sebulbasPodracer.exhausted).toBeFalse();

                context.player2.passAction();

                // P1 attacks with Sebulba's Podracer to exhaust it again
                context.player1.clickCard(context.sebulbasPodracer);
                context.player1.clickCard(context.p2Base);
                expect(context.sebulbasPodracer.exhausted).toBeTrue();

                // P2 plays Change of Heart to take control of Sebulba's Podracer
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.sebulbasPodracer);
                expect(context.sebulbasPodracer).toBeInZone('groundArena', context.player2);

                // P1 attacks with Kanan to discard from P2's deck
                context.player1.clickCard(context.kananJarrus);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Trigger');
                expect(context.restock).toBeInZone('discard', context.player2);

                // Sebulba's Podracer ability triggers for P2
                expect(context.player2).toHavePassAbilityPrompt('Ready Sebulba\'s Podracer');
                context.player2.clickPrompt('Trigger');

                // Sebulba's Podracer is readied
                expect(context.sebulbasPodracer.exhausted).toBeFalse();
            });

            it('is optional and can be passed the first time, but used the second time', async function() {
                // Use sebulba and Kanan to trigger twice for controller, passing first, using second
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sebulba#especially-dangerous-dug',
                        resources: 3,
                        groundArena: [
                            { card: 'sebulbas-podracer#taking-the-lead', exhausted: true }
                        ],
                        deck: ['confiscate', 'restock']
                    },
                    player2: {
                        groundArena: ['kanan-jarrus#revealed-jedi']
                    }
                });

                const { context } = contextRef;

                // P1 uses Sebulba's leader ability
                context.player1.clickCard(context.sebulba);
                context.player1.clickCard(context.sebulbasPodracer);
                expect(context.confiscate).toBeInZone('discard', context.player1);

                // Ability triggers, P1 passes
                expect(context.player1).toHavePassAbilityPrompt('Ready Sebulba\'s Podracer');
                context.player1.clickPrompt('Pass');
                expect(context.sebulbasPodracer.exhausted).toBeTrue();

                // P2 attacks with Kanan to discard from P1's deck
                context.player2.clickCard(context.kananJarrus);
                context.player2.clickCard(context.p1Base);
                context.player2.clickPrompt('Trigger');
                expect(context.restock).toBeInZone('discard', context.player1);

                // Sebulba's Podracer ability triggers again, P1 uses it this time
                expect(context.player1).toHavePassAbilityPrompt('Ready Sebulba\'s Podracer');
                context.player1.clickPrompt('Trigger');
                expect(context.sebulbasPodracer.exhausted).toBeFalse();
            });

            it('does not trigger for cards discarded from hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack'],
                        groundArena: [{ card: 'sebulbas-podracer#taking-the-lead', exhausted: true }]
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['jam-communications']
                    }
                });

                const { context } = contextRef;

                // P2 plays Jam Communications to discard Sneak Attack from P1's hand
                context.player2.clickCard(context.jamCommunications);
                context.player2.clickCardInDisplayCardPrompt(context.sneakAttack);

                // It is P1's turn. No trigger, Podracer is still exhausted
                expect(context.player1).toBeActivePlayer();
                expect(context.sebulbasPodracer.exhausted).toBeTrue();
            });

            it('does not trigger for cards discarded from the opponent\'s deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'sebulbas-podracer#taking-the-lead', exhausted: true },
                            'kanan-jarrus#revealed-jedi'
                        ]
                    },
                    player2: {
                        deck: ['confiscate', 'restock']
                    }
                });

                const { context } = contextRef;

                // P1 attacks with Kanan to discard from P2's deck
                context.player1.clickCard(context.kananJarrus);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Trigger');
                expect(context.confiscate).toBeInZone('discard', context.player2);

                // It is P2's turn. No trigger, Podracer is still exhausted
                expect(context.sebulbasPodracer.exhausted).toBeTrue();
            });
        });
    });
});