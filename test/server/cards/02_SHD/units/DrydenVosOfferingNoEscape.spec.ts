describe('Dryden Voss, Offering No Escape', function() {
    integration(function(contextRef) {
        describe('Dryden Voss\'s when played ability', function() {
            it('should choose a captured card guarded by a unit you control. You may play it for free under your control', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['dryden-vos#offering-no-escape', 'discerning-veteran', 'take-captive'],
                        groundArena: ['atst'],
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                        base: 'jabbas-palace'
                    },
                    player2: {
                        groundArena: ['wampa', 'reckless-gunslinger'],
                        spaceArena: ['cartel-turncoat']
                    }
                });

                const { context } = contextRef;

                // Set up a captured card
                context.player1.clickCard(context.takeCaptive);
                context.player1.clickCard(context.atst);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.recklessGunslinger]);
                context.player1.clickCard(context.recklessGunslinger);

                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player2.passAction();

                context.player1.clickCard(context.drydenVosOfferingNoEscape);
                context.player1.clickPrompt('Shielded');
                expect(context.player1).toBeAbleToSelectExactly([context.recklessGunslinger]);
                context.player1.clickCard(context.recklessGunslinger);

                expect(context.player1.exhaustedResourceCount).toBe(10); // the captured card should play for free

                // Confirm that reckless-gunslinger triggered its when played ability
                expect(context.p1Base.damage).toBe(1);
                expect(context.p2Base.damage).toBe(1);

                // Verify the reckless gunslinger is now under player 1's control
                expect(context.recklessGunslinger.controller).toEqual(context.player1.player);
            });
        });
    });
});
