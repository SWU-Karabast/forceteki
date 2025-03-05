describe('Paige Tico, Dropping the Hammer', function() {
    integration(function(contextRef) {
        describe('Paige Tico\'s Piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['paige-tico#dropping-the-hammer', 'survivors-gauntlet'],
                        groundArena: ['snowspeeder'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 1 }],
                        hand: ['bamboozle']
                    }
                });
            });

            it('should cause the attached unit to give itself 1 experience and 1 damage on attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.paigeTico);
                context.player1.clickPrompt('Play Paige Tico with Piloting');
                context.player1.clickCard(context.allianceXwing);

                context.player2.passAction();

                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['paige-tico#dropping-the-hammer', 'experience']);
                expect(context.allianceXwing.damage).toBe(1);
            });

            it('should do nothing when played as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.paigeTico);
                context.player1.clickPrompt('Play Paige Tico');

                context.player2.passAction();

                context.paigeTico.exhausted = false;
                context.player1.clickCard(context.paigeTico);
                context.player1.clickCard(context.p2Base);
                expect(context.paigeTico.isUpgraded()).toBeFalse();
                expect(context.paigeTico.damage).toBe(0);
            });

            it('should correctly unregister and re-register triggered abilities when leaving and re-entering the arena', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.paigeTico);
                context.player1.clickPrompt('Play Paige Tico with Piloting');
                context.player1.clickCard(context.allianceXwing);

                context.player2.passAction();

                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['paige-tico#dropping-the-hammer', 'experience']);
                expect(context.allianceXwing.damage).toBe(1);

                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.allianceXwing);
                expect(context.paigeTico).toBeInZone('hand');

                context.player1.clickCard(context.paigeTico);
                context.player1.clickPrompt('Play Paige Tico with Piloting');
                context.player1.clickCard(context.snowspeeder);

                context.player2.passAction();

                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Give an Experience token to this unit, then deal 1 damage to it'); // triggered ability window
                expect(context.snowspeeder).toHaveExactUpgradeNames(['paige-tico#dropping-the-hammer', 'experience']);
                expect(context.snowspeeder.damage).toBe(1);

                context.player2.passAction();

                context.allianceXwing.exhausted = false;
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);
                expect(context.allianceXwing.isUpgraded()).toBeFalse();
                expect(context.allianceXwing.damage).toBe(1);
            });

            it('should work when moved to another vehicle', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.paigeTico);
                context.player1.clickPrompt('Play Paige Tico with Piloting');
                context.player1.clickCard(context.allianceXwing);

                context.player2.passAction();

                context.player1.clickCard(context.survivorsGauntlet);
                expect(context.player1).toBeAbleToSelectExactly([context.paigeTico]);
                context.player1.clickCard(context.paigeTico);
                expect(context.player1).toBeAbleToSelectExactly([context.survivorsGauntlet, context.snowspeeder]);
                context.player1.clickCard(context.survivorsGauntlet);

                context.player2.passAction();

                context.survivorsGauntlet.exhausted = false;
                context.player1.clickCard(context.survivorsGauntlet);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Give an Experience token to this unit, then deal 1 damage to it'); // triggered ability window
                context.player1.clickPrompt('Pass'); // pass SG ability
                expect(context.survivorsGauntlet).toHaveExactUpgradeNames(['paige-tico#dropping-the-hammer', 'experience']);
                expect(context.survivorsGauntlet.damage).toBe(1);
            });
        });
    });
});