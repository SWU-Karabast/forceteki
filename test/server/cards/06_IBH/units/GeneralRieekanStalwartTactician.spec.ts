describe('General Rieekan - Stalwart Tactician', function () {
    integration(function (contextRef) {
        describe('General Rieekan\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-rieekan#stalwart-tactician', 'pheonix-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should allow another Heroism unit to attack with +2/+0', function () {
                const { context } = contextRef;
                
                // Store the initial power of the unit
                const initialPower = context.pheonixSquadronAwing.power;
                
                context.player1.clickCard(context.generalRieekanStalwartTactician);
                expect(context.player1).toHavePrompt('Choose an ability');
                context.player1.clickPrompt('Attack with another Heroism unit. It gets +2/+0 for this attack');
                expect(context.player1).toBeAbleToSelectExactly([context.pheonixSquadronAwing]);
                context.player1.clickCard(context.pheonixSquadronAwing);
                
                // Select attack target
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
                context.player1.clickCard(context.wampa);
                
                // Verify the unit has +2 power for the attack
                expect(context.pheonixSquadronAwing.power).toBe(initialPower + 2);
                
                // Complete the attack
                context.player2.clickPrompt('Done');
                expect(context.wampa.damage).toBe(initialPower + 2);
                expect(context.pheonixSquadronAwing.damage).toBe(context.wampa.power);
                
                // Verify the power boost is no longer applied after the attack
                expect(context.pheonixSquadronAwing.power).toBe(initialPower);
                
                // Verify General Rieekan is exhausted
                expect(context.generalRieekanStalwartTactician.exhausted).toBe(true);
            });
            
            it('should not allow non-Heroism units to attack', function () {
                const { context } = contextRef;
                
                // Setup with a non-Heroism unit
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['general-rieekan#stalwart-tactician', 'wampa'],
                    },
                    player2: {
                        groundArena: ['cloud-city-wing-guard']
                    }
                }).then(() => {
                    context.player1.clickCard(context.generalRieekanStalwartTactician);
                    expect(context.player1).toHavePrompt('Choose an ability');
                    context.player1.clickPrompt('Attack with another Heroism unit. It gets +2/+0 for this attack');
                    
                    // Should not be able to select the non-Heroism unit
                    expect(context.player1).not.toBeAbleToSelect(context.wampa);
                    
                    // Should be able to cancel
                    expect(context.player1).toHavePromptButton('Cancel');
                });
            });
            
            it('should not allow General Rieekan to attack himself', function () {
                const { context } = contextRef;
                
                context.player1.clickCard(context.generalRieekanStalwartTactician);
                expect(context.player1).toHavePrompt('Choose an ability');
                context.player1.clickPrompt('Attack with another Heroism unit. It gets +2/+0 for this attack');
                
                // Should not be able to select General Rieekan himself
                expect(context.player1).not.toBeAbleToSelect(context.generalRieekanStalwartTactician);
            });
        });
    });
});