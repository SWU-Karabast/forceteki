describe('Force Speed', function() {
    integration(function(contextRef) {
        const prompt = 'Return any number of non-unique upgrades attached to the defender to their owners\' hands.';

        describe('Force Speed\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['force-speed'],
                        groundArena: [
                            {
                                card: 'darth-maul#revenge-at-last',
                                upgrades: ['constructed-lightsaber']
                            }
                        ],
                        spaceArena: [
                            'seventh-fleet-defender',
                        ]
                    },
                    player2: {
                        hand: ['independent-smuggler'],
                        groundArena: [
                            {
                                card: 'consular-security-force',
                                upgrades: ['shield', 'experience']
                            },
                            {
                                card: 'sundari-peacekeeper',
                                upgrades: [
                                    'the-darksaber',
                                    {
                                        card: 'perilous-position',
                                        ownerAndController: 'player1'
                                    }
                                ]
                            }
                        ],
                        spaceArena: [
                            {
                                card: 'millennium-falcon#get-out-and-push',
                                upgrades: [
                                    'snapshot-reflexes',
                                    'the-mandalorian#weathered-pilot'
                                ]
                            },
                        ]
                    }
                });
            });

            it('attacks with a unit, and allows the attacker to return any number of non-unique upgrades attached to the defender to their owners\' hands."', function () {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 plays Independent Smuggler on Millennium Falcon
                context.player2.clickCard(context.independentSmuggler);
                context.player2.clickPrompt('Play Independent Smuggler with Piloting');
                context.player2.clickCard(context.millenniumFalcon);

                // Player 1 plays Force Speed
                context.player1.clickCard(context.forceSpeed);

                // Player 1 initiates an attack with Seventh Fleet Defender
                context.player1.clickCard(context.seventhFleetDefender);
                context.player1.clickCard(context.millenniumFalcon);

                // Ability is triggered
                expect(context.player1).toHavePrompt(prompt);

                // Only non-unique upgrades attached to Millennium Falcon should be selectable
                expect(context.player1).toBeAbleToSelectExactly([
                    context.snapshotReflexes,       // Non-unique upgrade
                    context.independentSmuggler,    // Non-unique pilot upgrade
                ]);

                context.player1.clickCard(context.snapshotReflexes);
                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickDone();

                // Both upgrades should be returned to their owners' hands
                expect(context.snapshotReflexes).toBeInZone('hand', context.player2);
                expect(context.independentSmuggler).toBeInZone('hand', context.player2);
            });

            it('works correctly if the attack has multiple defenders', function () {
                const { context } = contextRef;

                // Player 1 plays Force Speed
                context.player1.clickCard(context.forceSpeed);

                // Player 1 initiates an attack with Darth Maul
                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.sundariPeacekeeper);
                context.player1.clickDone();

                // Ability is triggered
                expect(context.player1).toHavePrompt(prompt);

                // Only non-unique upgrades attached to defenders should be selectable
                expect(context.player1).toBeAbleToSelectExactly([
                    context.shield,             // Defender 1
                    context.experience,         // Defender 1
                    context.perilousPosition    // Defender 2
                ]);

                context.player1.clickCard(context.shield);
                context.player1.clickCard(context.experience);
                context.player1.clickCard(context.perilousPosition);
                context.player1.clickDone();

                // Token upagrades are removed from the game instead of being returned to hand
                expect(context.shield).toBeInZone('outsideTheGame');
                expect(context.experience).toBeInZone('outsideTheGame');

                // Perilous Position should be returned to Player 1's hand
                expect(context.perilousPosition).toBeInZone('hand', context.player1);
            });
        });

        it('has no effect if the player does not have ready units to attack with', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['force-speed'],
                    spaceArena: [
                        { card: 'seventh-fleet-defender', exhausted: true },
                    ]

                },
                player2: {
                    spaceArena: [
                        {
                            card: 'millennium-falcon#get-out-and-push',
                            upgrades: [
                                'snapshot-reflexes',
                                'the-mandalorian#weathered-pilot'
                            ]
                        },
                    ]
                }
            });

            const { context } = contextRef;

            // Player 1 plays Force Speed
            context.player1.clickCard(context.forceSpeed);

            // Player 1 is warned that the card will have no effect
            expect(context.player1).toHavePrompt('Playing Force Speed will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            // Nothing happens, it is Player 2's turn
            expect(context.player2).toBeActivePlayer();
        });
    });
});