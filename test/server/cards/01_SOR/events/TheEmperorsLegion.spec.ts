describe('The Emprerors Legion', function () {
    integration(function (contextRef) {
        describe('The Emprerors Legion\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['the-emperors-legion'],
                        groundArena: ['pyke-sentinel', 'seasoned-shoretrooper', 'blizzard-assault-atat'],
                        spaceArena: ['cartel-spacer'],
                        discard: ['keep-fighting', 'green-squadron-awing', 'disarm']
                    },
                    player2: {
                        hand: ['superlaser-blast'],
                        discard: ['tactical-advantage', 'guerilla-attack-pod']
                    }
                });
            });

            it('should return card to player hand from a discard pile', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.superlaserBlast);
                expect(context.pykeSentinel.location).toBe('discard');
                // expect(context.seasonedShoretrooper.location).toBe('discard');
                // expect(context.blizzardAssaultAtat.location).toBe('discard');
                // expect(context.cartelSpacer.location).toBe('discard');
                // context.player1.clickCard(context.theEmperorsLegion);
                // expect(context.pykeSentinel.location).toBe('hand');
                // expect(context.seasonedShoretrooper.location).toBe('hand');
                // expect(context.blizzardAssaultAtat.location).toBe('hand');
                // expect(context.cartelSpacer.location).toBe('hand');
                // // Expect earlier defeated units to still be in the discard pile
                // expect(context.player1.discard.length).toBe(4);
                // expect(context.greenSquadronAwing.location).toBe('discard');


                // context.player1.clickCard(context.bountyHunterCrew);
                // context.player1.clickPrompt('Return an event from a discard pile');
                // expect(context.player1).toBeAbleToSelectExactly([context.keepFighting, context.disarm, context.tacticalAdvantage]);
                // expect(context.player1).toHavePassAbilityButton();
                // context.player1.clickCard(context.disarm);
                // expect(context.player1.hand.length).toBe(1);
                // expect(context.disarm.location).toBe('hand');
            });

            // it('should return card to opponent hand from a discard pile', function () {
            //     const { context } = contextRef;
            //
            //     context.player1.clickCard(context.bountyHunterCrew);
            //     context.player1.clickPrompt('Return an event from a discard pile');
            //     expect(context.player1).toBeAbleToSelectExactly([context.keepFighting, context.disarm, context.tacticalAdvantage]);
            //     expect(context.player1).toHavePassAbilityButton();
            //     context.player1.clickCard(context.tacticalAdvantage);
            //     expect(context.player2.hand.length).toBe(1);
            //     expect(context.tacticalAdvantage.location).toBe('hand');
            // });
        });
    });
});
