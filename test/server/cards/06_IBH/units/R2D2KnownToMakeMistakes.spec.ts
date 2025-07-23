describe('R2-D2 - Known To Make Mistakes', function () {
    integration(function (contextRef) {
        describe('R2-D2\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#known-to-make-mistakes'],
                        groundArena: ['pheonix-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa', 'cloud-city-wing-guard']
                    }
                });
            });

            it('should exhaust an enemy ground unit that costs 4 or less when played if you control a Command unit', function () {
                const { context } = contextRef;
                
                context.player1.clickCard(context.r2d2KnownToMakeMistakes);
                context.player1.clickPrompt('Play this card');
                
                // The ability should trigger since pheonix-squadron-awing is a Command unit
                expect(context.player1).toHavePrompt('Choose a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cloudCityWingGuard]);
                context.player1.clickCard(context.wampa);
                
                // Verify the enemy unit is exhausted
                expect(context.wampa.exhausted).toBe(true);
            });
            
            it('should not trigger the ability if you do not control a Command unit', function () {
                const { context } = contextRef;
                
                // Setup without a Command unit
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#known-to-make-mistakes'],
                        groundArena: ['wampa'] // Not a Command unit
                    },
                    player2: {
                        groundArena: ['cloud-city-wing-guard']
                    }
                }).then(() => {
                    context.player1.clickCard(context.r2d2KnownToMakeMistakes);
                    context.player1.clickPrompt('Play this card');
                    
                    // The ability should not trigger
                    expect(context.player1).not.toHavePrompt('Choose a unit');
                    expect(context.cloudCityWingGuard.exhausted).toBe(false);
                });
            });
            
            it('should not allow targeting enemy ground units that cost more than 4', function () {
                const { context } = contextRef;
                
                // Setup with an expensive enemy unit
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#known-to-make-mistakes'],
                        groundArena: ['pheonix-squadron-awing']
                    },
                    player2: {
                        groundArena: ['darth-vader#dark-lord-of-the-sith'] // Expensive unit
                    }
                }).then(() => {
                    context.player1.clickCard(context.r2d2KnownToMakeMistakes);
                    context.player1.clickPrompt('Play this card');
                    
                    // The ability should trigger but not allow targeting the expensive unit
                    expect(context.player1).toHavePrompt('Choose a unit');
                    expect(context.player1).not.toBeAbleToSelect(context.darthVaderDarkLordOfTheSith);
                });
            });
        });
    });
});