describe('The Mandalorian, Wherever I Go He Goes', function () {
    integration(function (contextRef) {
        describe('The Mandalorian\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['the-mandalorian#wherever-i-go-he-goes'],
                        groundArena: [
                            { card: 'grogu#irresistible', damage: 3 },
                            'mandalorian-warrior'
                        ]
                    },
                    player2: {
                        groundArena: [{ card: 'scout-bike-pursuer', damage: 3 }]
                    }
                });
            });

            it('should heal all damage and give 2 shield tokens to a friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMandalorian);

                expect(context.player1).toBeAbleToSelectExactly([context.grogu, context.scoutBikePursuer]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.grogu);

                expect(context.grogu.damage).toBe(0);
                expect(context.grogu).toHaveExactUpgradeNames(['shield', 'shield']);
            });

            it('should be passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMandalorian);

                expect(context.player1).toBeAbleToSelectExactly([context.grogu, context.scoutBikePursuer]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass ability');

                expect(context.grogu.damage).toBe(3);
                expect(context.grogu.isUpgraded()).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
