describe('Xanadu Blood, Cad Bane\'s Reward', function () {
    integration(function (contextRef) {
        describe('Xanadu Blood\'s ability', function () {
            it('should return a friendly Underworld unit to hand and exhaust an enemy unit or resource', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['xanadu-blood#cad-banes-reward'],
                        groundArena: ['battlefield-marine', 'greedo#slow-on-the-draw', 'syndicate-lackeys'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['cantina-braggart'],
                        spaceArena: ['green-squadron-awing'],
                        resources: ['atst', 'escort-skiff', 'crafty-smuggler']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.xanaduBlood);

                // return a friendly Underworld unit
                expect(context.player1).toBeAbleToSelectExactly([context.greedo, context.cartelSpacer, context.syndicateLackeys]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.cartelSpacer);

                // exhaust an enemy unit or resource
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.cantinaBraggart, context.atst, context.escortSkiff, context.craftySmuggler]);
                context.player1.clickCard(context.cantinaBraggart);

                expect(context.player2).toBeActivePlayer();
                expect(context.cantinaBraggart.exhausted).toBeTrue();
                expect(context.cartelSpacer.location).toBe('hand');

                context.xanaduBlood.exhausted = false;
                context.player2.passAction();

                // attack with xanadu blood
                context.player1.clickCard(context.xanaduBlood);
                context.player1.clickCard(context.p2Base);

                // return a friendly Underworld unit
                expect(context.player1).toBeAbleToSelectExactly([context.greedo, context.syndicateLackeys]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.syndicateLackeys);

                // exhaust an enemy unit or resource
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.cantinaBraggart, context.atst, context.escortSkiff, context.craftySmuggler]);
                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.syndicateLackeys.location).toBe('hand');

                context.xanaduBlood.exhausted = false;
                context.player2.passAction();

                // attack with xanadu blood
                context.player1.clickCard(context.xanaduBlood);
                context.player1.clickCard(context.p2Base);

                // only 1 underworld unit, prompt is a bit different
                expect(context.player1).toHavePassAbilityPrompt('Return another friendly non-leader Underworld unit to its owner’s hand');

                // pass, nothing happen
                context.player1.passAction();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
