describe('Leia Organa - Get To Your Transports', function () {
    integration(function (contextRef) {
        describe('Leader side ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#get-to-your-transports',
                        resourceCount: 1,
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['cloud-city-wing-guard']
                    }
                });
            });

            it('should heal 1 damage from a friendly unit', function () {
                const { context } = contextRef;
                
                // Add damage to the unit
                context.wampa.damage = 2;
                
                context.player1.clickCard(context.leiaOrganaGetToYourTransports);
                expect(context.player1).toHavePrompt('Choose an ability');
                context.player1.clickPrompt('Heal 1 damage from a friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(1);
                expect(context.leiaOrganaGetToYourTransports.exhausted).toBe(true);
                expect(context.player1.resourceCount).toBe(0);
            });
        });

        describe('Leader unit side ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#get-to-your-transports',
                        leaderInPlay: true,
                        groundArena: ['wampa', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['cloud-city-wing-guard']
                    }
                });
            });

            it('should heal 1 damage from up to 2 friendly units when attacking', function () {
                const { context } = contextRef;
                
                // Add damage to the units
                context.wampa.damage = 2;
                context.battlefieldMarine.damage = 3;
                
                context.player1.clickCard(context.leiaOrganaGetToYourTransports);
                expect(context.player1).toHavePrompt('Choose an ability');
                context.player1.clickPrompt('Attack');
                expect(context.player1).toBeAbleToSelectExactly([context.cloudCityWingGuard, context.p2Base]);
                context.player1.clickCard(context.cloudCityWingGuard);

                // After attack is declared, the on-attack ability should trigger
                expect(context.player1).toHavePrompt('Choose units to heal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                expect(context.wampa.damage).toBe(1);
                expect(context.battlefieldMarine.damage).toBe(2);
                
                // Complete the attack
                context.player2.clickPrompt('Done');
                expect(context.cloudCityWingGuard.damage).toBe(context.leiaOrganaGetToYourTransports.power);
                expect(context.leiaOrganaGetToYourTransports.damage).toBe(context.cloudCityWingGuard.power);
            });

            it('should heal 1 damage from 1 friendly unit when only 1 is available', function () {
                const { context } = contextRef;
                
                // Setup with only one unit
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'leia-organa#get-to-your-transports',
                        leaderInPlay: true,
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['cloud-city-wing-guard']
                    }
                }).then(() => {
                    // Add damage to the unit
                    context.wampa.damage = 2;
                    
                    context.player1.clickCard(context.leiaOrganaGetToYourTransports);
                    expect(context.player1).toHavePrompt('Choose an ability');
                    context.player1.clickPrompt('Attack');
                    expect(context.player1).toBeAbleToSelectExactly([context.cloudCityWingGuard, context.p2Base]);
                    context.player1.clickCard(context.cloudCityWingGuard);

                    // After attack is declared, the on-attack ability should trigger
                    expect(context.player1).toHavePrompt('Choose units to heal 1 damage to');
                    expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                    context.player1.clickCard(context.wampa);
                    context.player1.clickPrompt('Done');

                    expect(context.wampa.damage).toBe(1);
                    
                    // Complete the attack
                    context.player2.clickPrompt('Done');
                });
            });
        });
    });
});