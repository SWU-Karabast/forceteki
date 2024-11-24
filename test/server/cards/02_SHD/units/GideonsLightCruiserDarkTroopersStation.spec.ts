describe('Gideon\'s Light Cruiser, Dark Troopers\' Station', function () {
    integration(function (contextRef) {
        describe('Gideon\'s Light Cruiser\'s ability', function () {
            it('should not play a villainy unit from hand or discard as we do not control moff gideon', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['gideons-light-cruiser#dark-troopers-station', 'scout-bike-pursuer'],
                        discard: ['hylobon-enforcer', 'atst'],
                        leader: 'iden-versio#inferno-squad-commander'
                    },
                    player2: {
                        discard: ['black-sun-starfighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.gideonsLightCruiser);

                // nothing happen as we do not control moff gideon
                expect(context.player2).toBeActivePlayer();
            });

            it('should play a villainy unit from hand or discard as we control moff gideon (as leader)', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['gideons-light-cruiser#dark-troopers-station', 'scout-bike-pursuer'],
                        discard: ['phaseiii-dark-trooper', 'atst', 'battlefield-marine'],
                        leader: 'moff-gideon#formidable-commander'
                    },
                    player2: {
                        discard: ['black-sun-starfighter']
                    }
                });

                const { context } = contextRef;

                // play gideon's light cruiser
                context.player1.clickCard(context.gideonsLightCruiser);

                // can select a villainy unit that cost 3 or less
                expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer, context.phaseiiiDarkTrooper]);
                expect(context.player1).not.toHavePassAbilityButton();

                // play scout bike pursuer
                context.player1.clickCard(context.scoutBikePursuer);

                // unit should be played as free
                expect(context.player2).toBeActivePlayer();
                expect(context.scoutBikePursuer).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(8);

                // reset
                context.player1.moveCard(context.gideonsLightCruiser, 'hand');
                context.player2.passAction();

                // play gideon's light cruiser again, phase 3 trooper should be played automatically
                context.player1.clickCard(context.gideonsLightCruiser);

                expect(context.player2).toBeActivePlayer();
                expect(context.phaseiiiDarkTrooper).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(16);
            });

            it('should play a villainy unit from hand or discard as we control moff gideon (as unit)', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['gideons-light-cruiser#dark-troopers-station', 'scout-bike-pursuer'],
                        discard: ['phaseiii-dark-trooper', 'atst', 'battlefield-marine'],
                        leader: { card: 'moff-gideon#formidable-commander', deployed: true }
                    },
                    player2: {
                        discard: ['black-sun-starfighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.gideonsLightCruiser);

                // can select a villainy unit that cost 3 or less
                expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer, context.phaseiiiDarkTrooper]);
                expect(context.player1).not.toHavePassAbilityButton();

                // play scout bike pursuer
                context.player1.clickCard(context.scoutBikePursuer);

                // unit should be played as free
                expect(context.player2).toBeActivePlayer();
                expect(context.scoutBikePursuer).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(8);

                // reset
                context.player1.moveCard(context.gideonsLightCruiser, 'hand');
                context.player2.passAction();

                // play gideon's light cruiser again, phase 3 trooper should be played automatically
                context.player1.clickCard(context.gideonsLightCruiser);

                expect(context.player2).toBeActivePlayer();
                expect(context.phaseiiiDarkTrooper).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(16);
            });
        });
    });
});
