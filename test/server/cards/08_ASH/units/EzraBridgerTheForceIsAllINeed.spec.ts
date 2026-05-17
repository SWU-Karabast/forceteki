describe('Ezra Bridger, The Force Is All I Need', function() {
    integration(function(contextRef) {
        describe('Ezra\'s On Attack ability', function() {
            it('should give a unit -3/-0 for the phase when upgraded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            {
                                card: 'ezra-bridger#the-force-is-all-i-need',
                                upgrades: ['experience']
                            },
                            'wampa'
                        ],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                    }
                });

                const { context } = contextRef;

                // Initiate an attack with Ezra
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);

                // Ability triggers - player can select a unit or pass
                expect(context.player1).toHavePrompt('Give a unit -3/-0 for the phase');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    // All units should be valid targets, including friendly and leader units
                    context.ezraBridger,
                    context.greenSquadronAwing,
                    context.wampa,
                    context.battlefieldMarine,
                    context.tielnFighter,
                    context.bobaFett
                ]);

                // Give Battlefield Marine -3/-0
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.getPower()).toBe(0);
                expect(context.battlefieldMarine.getHp()).toBe(3);
                expect(context.player2).toBeActivePlayer();

                // Battlefield Marine attacks base for 0 damage
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(0);

                // Move to next phase and confirm effect has expired
                context.moveToRegroupPhase();
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should not trigger when Ezra is not upgraded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ezra-bridger#the-force-is-all-i-need']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Ezra attacks without upgrades
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);

                // Ability does not trigger - turn passes immediately
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to pass on the ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'ezra-bridger#the-force-is-all-i-need', upgrades: ['experience'] }
                        ]
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Ezra attacks
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);

                // Ability triggers but player passes
                expect(context.player1).toHavePrompt('Give a unit -3/-0 for the phase');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
