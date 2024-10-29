describe('Krayt Dragon', function () {
    integration(function (contextRef) {
        describe('Krayt Dragon\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['krayt-dragon'],
                    },
                    player2: {
                        hand: ['superlaser-blast', 'privateer-crew', 'green-squadron-awing'],
                        groundArena: ['wampa'],
                        resources: ['vigilant-pursuit-craft', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    }
                });
            });

            it('should deal damage to ground unit or base when enemy play a card', function () {
                const { context } = contextRef;

                // play a card, nothing happen
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();

                // enemy play a space unit, should deal damage to ground unit or base
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(2);

                // enemy play a ground unit, should deal damage to ground unit or base
                context.player1.passAction();
                context.player2.clickCard(context.privateerCrew);

                // should choose which player resolve their triggers first
                context.player2.clickPrompt('You');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa, context.privateerCrew]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                // for smuggle, should take the printed cost
                context.setDamage(context.p2Base, 0);
                context.player1.passAction();
                context.player2.clickCard(context.vigilantPursuitCraft);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa, context.privateerCrew]);
                // 5 damage on base (7 paid from smuggle but 5 for printed cost)
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);

                context.setDamage(context.p2Base, 0);
                // enemy kill everyone, krayt ability still activates
                context.player1.passAction();
                context.player2.clickCard(context.superlaserBlast);
                expect(context.p2Base.damage).toBe(8);
            });
            // TODO test u-wing, vader or endless legion when implemented
        });
    });
});
