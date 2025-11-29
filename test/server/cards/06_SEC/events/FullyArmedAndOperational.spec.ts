describe('Fully Armed And Operational', function() {
    integration(function (contextRef) {
        describe('Scenarios where the condition is not met', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fully-armed-and-operational', 'swoop-racer'],
                        groundArena: [
                            'resourceful-pursuers'
                        ]
                    },
                    player2: {
                        leader: 'ig88#ruthless-bounty-hunter',
                        base: 'echo-base',
                        hasInitiative: true,
                        resources: 4,
                        hand: ['precision-fire'],
                        groundArena: ['outer-rim-mystic'],
                    }
                });
            });

            const playFullyArmedAndOperationalWithNoEffect = (context: SwuTestContext) => {
                context.player1.clickCard(context.fullyArmedAndOperational);
                expect(context.player1).toHavePrompt('Playing Fully Armed And Operational will have no effect. Are you sure you want to play it?');
                expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);
                context.player1.clickPrompt('Play anyway');
                expect(context.fullyArmedAndOperational).toBeInZone('discard', context.player1);
            };

            // eslint-disable-next-line jasmine/missing-expect
            it('opponent has not yet taken an action this phase', function () {
                const { context } = contextRef;

                // Move to next action phase where P1 has initiative
                context.player2.passAction();
                context.player1.claimInitiative();
                context.player1.clickDone();
                context.player2.clickDone();

                playFullyArmedAndOperationalWithNoEffect(context);
            });

            // eslint-disable-next-line jasmine/missing-expect
            it('opponent passed their last action', function () {
                const { context } = contextRef;

                // P2 passes action
                context.player2.passAction();

                playFullyArmedAndOperationalWithNoEffect(context);
            });

            // eslint-disable-next-line jasmine/missing-expect
            it('opponent claimed initiative with their last action', function () {
                const { context } = contextRef;

                // P2 claims initiative
                context.player2.claimInitiative();

                playFullyArmedAndOperationalWithNoEffect(context);
            });

            // eslint-disable-next-line jasmine/missing-expect
            it('opponent attacked a unit with their last action', function () {
                const { context } = contextRef;

                // P2 attacks with Outer Rim Mystic
                context.player2.clickCard(context.outerRimMystic);
                context.player2.clickCard(context.resourcefulPursuers);

                playFullyArmedAndOperationalWithNoEffect(context);
            });

            // eslint-disable-next-line jasmine/missing-expect
            it('opponent played a card that does not initiate an attack on base with their last action', function () {
                const { context } = contextRef;

                // P2 plays Precision Fire to attack a unit
                context.player2.clickCard(context.precisionFire);
                context.player2.clickCard(context.outerRimMystic);
                context.player2.clickCard(context.resourcefulPursuers);

                playFullyArmedAndOperationalWithNoEffect(context);
            });

            // eslint-disable-next-line jasmine/missing-expect
            it('opponent used an action ability that does not initiate an attack on base with their last action', function () {
                const { context } = contextRef;

                // P2 uses IG-88's action ability to attack a unit
                context.player2.clickCard(context.ig88);
                context.player2.clickCard(context.outerRimMystic);
                context.player2.clickCard(context.resourcefulPursuers);

                playFullyArmedAndOperationalWithNoEffect(context);
            });
        });

        describe('Scenarios where the condition is met', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        hand: ['fully-armed-and-operational', 'swoop-racer'],
                        groundArena: [
                            'resourceful-pursuers'
                        ]
                    },
                    player2: {
                        leader: 'ig88#ruthless-bounty-hunter',
                        base: 'echo-base',
                        hasInitiative: true,
                        resources: 4,
                        hand: ['precision-fire'],
                        groundArena: ['outer-rim-mystic'],
                    }
                });
            });

            const playFullyArmedAndOperational = (context: SwuTestContext) => {
                context.player1.clickCard(context.fullyArmedAndOperational);
                expect(context.player1).toHavePrompt('Play a unit from your hand. Give it ambush for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.swoopRacer]);
                context.player1.clickCard(context.swoopRacer);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.outerRimMystic]);
                context.player1.clickCard(context.outerRimMystic);

                expect(context.swoopRacer).toBeInZone('groundArena', context.player1);
                expect(context.swoopRacer.damage).toBe(2);
                expect(context.outerRimMystic.damage).toBe(4);
            };

            // eslint-disable-next-line jasmine/missing-expect
            it('opponent attacked base with their last action', function () {
                const { context } = contextRef;

                // P2 attacks player's base with Outer Rim Mystic
                context.player2.clickCard(context.outerRimMystic);
                context.player2.clickCard(context.p1Base);

                playFullyArmedAndOperational(context);
            });

            // eslint-disable-next-line jasmine/missing-expect
            it('opponent played a card that initiated an attack on base with their last action', function () {
                const { context } = contextRef;

                // P2 plays Precision Fire to attack player's base
                context.player2.clickCard(context.precisionFire);
                context.player2.clickCard(context.outerRimMystic);
                context.player2.clickCard(context.p1Base);

                playFullyArmedAndOperational(context);
            });

            // eslint-disable-next-line jasmine/missing-expect
            it('opponent used an action ability that initiated an attack on base with their last action', function () {
                const { context } = contextRef;

                // P2 uses IG-88's action ability to attack player's base
                context.player2.clickCard(context.ig88);
                context.player2.clickCard(context.outerRimMystic);
                context.player2.clickCard(context.p1Base);

                playFullyArmedAndOperational(context);
            });

            // eslint-disable-next-line jasmine/missing-expect
            it('player takes an action between opponent attacking base and playing Fully Armed And Operational', function () {
                const { context } = contextRef;

                // P2 attacks player's base with Outer Rim Mystic
                context.player2.clickCard(context.outerRimMystic);
                context.player2.clickCard(context.p1Base);

                // P1 uses Kazuda's ability before playing Fully Armed And Operational
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Remove all abilities from a friendly unit, then take another action');
                context.player1.clickCard(context.resourcefulPursuers);

                playFullyArmedAndOperational(context);
            });
        });

        it('should work if opponent attacked base as part of LOF Kylo Ren deploy chain of actions', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fully-armed-and-operational', 'krayt-dragon'],
                },
                player2: {
                    leader: 'kylo-ren#were-not-done-yet',
                    hasInitiative: true,
                    discard: [
                        'snapshot-reflexes',
                        'infiltrators-skill',
                        'devotion',
                    ]
                }
            });

            const { context } = contextRef;

            // P2 deploys Kylo Ren
            context.player2.clickCard(context.kyloRen);
            context.player2.clickPrompt('Deploy Kylo Ren');

            // Play Snapshot Reflexes on Kylo
            context.player2.clickCard(context.snapshotReflexes);
            context.player2.clickCard(context.kyloRen);
            expect(context.player2).toHavePassAbilityPrompt('Attack with attached unit');
            context.player2.clickPrompt('Trigger');
            context.player2.clickCard(context.p1Base);

            // Keep playing upgrades
            context.player2.clickCard(context.infiltratorsSkill);
            context.player2.clickCard(context.kyloRen);
            context.player2.clickCard(context.devotion);
            context.player2.clickCard(context.kyloRen);

            // Now P1 plays Fully Armed And Operational
            context.player1.clickCard(context.fullyArmedAndOperational);
            expect(context.player1).toHavePrompt('Play a unit from your hand. Give it ambush for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.kraytDragon]);
            context.player1.clickCard(context.kraytDragon);
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            // Attack Kylo Ren with Krayt Dragon
            expect(context.player1).toBeAbleToSelectExactly([context.kyloRen]);
            context.player1.clickCard(context.kyloRen);

            expect(context.kraytDragon).toBeInZone('groundArena', context.player1);
            expect(context.kraytDragon.damage).toBe(8);
        });

        it('can be played via Plot', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'grand-admiral-thrawn#how-unfortunate',
                    base: 'chopper-base',
                    hand: ['swoop-racer'],
                    resources: [
                        'fully-armed-and-operational',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'atst'
                    ]
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['outer-rim-mystic'],
                }
            });

            const { context } = contextRef;

            // P2 attacks P1's base with Outer Rim Mystic
            context.player2.clickCard(context.outerRimMystic);
            context.player2.clickCard(context.p1Base);

            // P1 deploys Thrawn to play Fully Armed And Operational via Plot
            context.player1.clickCard(context.grandAdmiralThrawn);
            context.player1.clickPrompt('Deploy Grand Admiral Thrawn');

            expect(context.player1).toHavePassAbilityPrompt('Play Fully Armed And Operational using Plot');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toHavePrompt('Play a unit from your hand. Give it ambush for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.swoopRacer]);
            context.player1.clickCard(context.swoopRacer);
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.outerRimMystic]);
            context.player1.clickCard(context.outerRimMystic);

            expect(context.swoopRacer).toBeInZone('groundArena', context.player1);
            expect(context.swoopRacer.damage).toBe(2);
            expect(context.outerRimMystic.damage).toBe(4);
        });
    });
});