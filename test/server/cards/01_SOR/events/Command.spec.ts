describe('Command', function() {
    integration(function(contextRef) {
        describe('Command\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['command'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['restored-arc170']

                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                    }
                });
            });

            it('Command can deal damage to a non-unique unit equal to a friendly unit\'s power and return a unit to hand from discard', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.command);

                // Give 2 Experience tokens to a unit
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Give 2 Experience tokens to a unit.',
                    'A friendly unit deals damage equal to its power to a non-unique enemy unit.',
                    'Put this event into play as a resource.',
                    'Return a unit from your discard pile to your hand.'
                ]);
                context.player1.clickPrompt('A friendly unit deals damage equal to its power to a non-unique enemy unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.restoredArc170]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid]);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid]);
                context.player1.clickCard(context.viperProbeDroid);

                // check board state
                expect(context.viperProbeDroid).toBeInZone('discard', context.player2);
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Give 2 Experience tokens to a unit.',
                    'Put this event into play as a resource.',
                    'Return a unit from your discard pile to your hand.'
                ]);

                const exhaustedResources = context.player1.exhaustedResourceCount;

                // Resource Command
                context.player1.clickPrompt('Return a unit from your discard pile to your hand.');
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResources + 1);
            });

            // it('Command can give Experience and be put into play as a resource', function () {
            //     const { context } = contextRef;
            //     context.player1.clickCard(context.command);

            //     // Give 2 Experience tokens to a unit
            //     expect(context.player1).toHaveEnabledPromptButtons([
            //         'Give 2 Experience tokens to a unit.',
            //         'A friendly unit deals damage equal to its power to a non-unique enemy unit.',
            //         'Put this event into play as a resource.',
            //         'Return a unit from your discard pile to your hand.'
            //     ]);
            //     context.player1.clickPrompt('Give 2 Experience tokens to a unit.');
            //     expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.restoredArc170, context.viperProbeDroid, context.darthVader]);
            //     context.player1.clickCard(context.battlefieldMarine);

            //     // check board state
            //     expect(context.battlefieldMarine.getPower()).toBe(5);
            //     expect(context.battlefieldMarine.getHp()).toBe(5);
            //     expect(context.player1).toHaveEnabledPromptButtons([
            //         'A friendly unit deals damage equal to its power to a non-unique enemy unit.',
            //         'Put this event into play as a resource.',
            //         'Return a unit from your discard pile to your hand.'
            //     ]);

            //     const exhaustedResources = context.player1.exhaustedResourceCount;

            //     // Resource Command
            //     context.player1.clickPrompt('Put this event into play as a resource.');
            //     expect(context.player1.exhaustedResourceCount).toBe(exhaustedResources + 1);
            // });
        });
    });
});