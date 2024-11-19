import { ZoneName } from '../../../../../server/game/core/Constants';

describe('Frontier Trader', function() {
    integration(function(contextRef) {
        describe('Frontier Trader\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['frontier-trader'],
                        deck: ['wampa', 'battlefield-marine', 'atst', 'atst'],
                        resources: ['armed-to-the-teeth',
                            'covert-strength',
                            'chewbacca#pykesbane',
                            'battlefield-marine', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst',
                            'collections-starhopper',
                            'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'
                        ],
                        base: 'chopper-base'
                    }
                });
            });

            it('should be able to take resource back to hand and replace it with top card from deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.frontierTrader);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.collectionsStarhopper);
                context.player1.clickPrompt('Put the top card of your deck into play as a resource.');
                expect(context.collectionsStarhopper).toBeInZone(ZoneName.Hand);
                expect(context.wampa).toBeInZone(ZoneName.Resource);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });
        });
    });
});
