describe('Ability targeting when the target changes zones', function() {
    integration(function (contextRef) {
        describe('Unrefusable Offer + Superlaser Technician:', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: [{ card: 'superlaser-technician', upgrades: ['unrefusable-offer'] }]
                    }
                });
            });

            it('Unrefusable Offer\'s ability should fizzle if Superlaser Technician is moved to resources by its ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.superlaserTechnician);

                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('You');

                expect(context.player1).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
                context.player1.clickPrompt('Trigger');

                // Unrefusable Offer trigger still happens since bounty collection triggers even if the effect will do nothing (like in this case)
                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
                context.player2.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.superlaserTechnician).toBeInZone('resource', context.player1);
            });

            it('Superlaser Technician\'s ability should fizzle if played back out by Unrefusable Offer', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.superlaserTechnician);

                expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
                context.player1.clickPrompt('Opponent');

                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');
                context.player2.clickPrompt('Trigger');

                // SLT trigger fizzles since it's a new copy now after being played back out

                expect(context.player2).toBeActivePlayer();
                expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);

                // end phase to defeat SLT and get the trigger
                context.player2.passAction();
                context.player1.passAction();

                expect(context.player2).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
                context.player2.clickPrompt('Trigger');

                expect(context.superlaserTechnician).toBeInZone('resource', context.player2);
                expect(context.superlaserTechnician.exhausted).toBe(false);
            });
        });
    });
});
