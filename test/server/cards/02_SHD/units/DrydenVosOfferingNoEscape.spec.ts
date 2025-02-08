describe('Dryden Voss, Offering No Escape', function() {
    integration(function(contextRef) {
        describe('Dryden Voss\'s when played ability', function() {
            it('should choose a captured card guarded by a unit you control. You may play it for free under your control', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['dryden-vos#offering-no-escape', 'discerning-veteran', 'take-captive'],
                        groundArena: ['atst', 'swoop-racer'],
                        spaceArena: ['green-squadron-awing'],
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                        base: 'jabbas-palace'
                    },
                    player2: {
                        hand: ['take-captive', 'waylay'],
                        groundArena: ['wampa', 'reckless-gunslinger'],
                        spaceArena: ['tieln-fighter', 'hwk290-freighter']
                    }
                });

                const { context } = contextRef;

                const takeCaptive1 = context.player1.hand[2];
                const takeCaptive2 = context.player2.hand[0];

                // Use take-captive to set up a captured card for player 1
                context.player1.clickCard(takeCaptive1);
                context.player1.clickCard(context.atst);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.recklessGunslinger]);
                context.player1.clickCard(context.recklessGunslinger);

                expect(context.player1.exhaustedResourceCount).toBe(3);

                // Use take-captive to set up a captured card for player 2
                context.player2.clickCard(takeCaptive2);
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.swoopRacer]);
                context.player2.clickCard(context.swoopRacer);

                context.player1.clickCard(context.drydenVosOfferingNoEscape);
                context.player1.clickPrompt('Shielded');
                expect(context.drydenVosOfferingNoEscape).toHaveExactUpgradeNames(['shield']);

                // Now selecting the captured card -- ensure it doesn't see an opponent's captured card
                expect(context.player1).toBeAbleToSelectExactly([context.recklessGunslinger]);
                context.player1.clickCard(context.recklessGunslinger);

                expect(context.player1.exhaustedResourceCount).toBe(10); // the captured card should play for free (only +7 for dryden)

                // Confirm that reckless-gunslinger triggered its when played ability
                expect(context.p1Base.damage).toBe(1);
                expect(context.p2Base.damage).toBe(1);

                // Verify the reckless gunslinger is now under player 1's control
                expect(context.recklessGunslinger.controller).toEqual(context.player1.player);

                context.player2.passAction();

                context.player1.moveCard(takeCaptive1, 'hand');

                // Use take-captive to set up a captured card for player 1
                context.player1.clickCard(takeCaptive1);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.hwk290Freighter]);
                context.player1.clickCard(context.tielnFighter);

                context.player2.passAction();

                context.player1.moveCard(takeCaptive1, 'hand');

                // Use take-captive to set up a captured card for player 1
                context.player1.clickCard(takeCaptive1);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player1).toBeAbleToSelectExactly([context.hwk290Freighter]);
                context.player1.clickCard(context.hwk290Freighter);

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.drydenVosOfferingNoEscape);

                // Now test space arena, and multiple captured cards under one guard
                context.player1.readyResources(20);

                context.player1.clickCard(context.drydenVosOfferingNoEscape);
                context.player1.clickPrompt('Shielded');
                expect(context.drydenVosOfferingNoEscape).toHaveExactUpgradeNames(['shield']);

                // Now selecting the captured card -- ensure it doesn't see an opponent's captured card
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.hwk290Freighter]);
                context.player1.clickCard(context.hwk290Freighter);

                expect(context.player1.exhaustedResourceCount).toBe(7); // the captured card should play for free (only +7 for dryden)

                // Verify the reckless gunslinger is now under player 1's control
                expect(context.hwk290Freighter.controller).toEqual(context.player1.player);
            });
        });
    });
});
