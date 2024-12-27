describe('General Rieekan, Defensive Strategist', function () {
    integration(function (contextRef) {
        describe('General Rieekan\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['general-rieekan#defensive-strategist'],
                        groundArena: ['consular-security-force'],
                        spaceArena: ['corellian-freighter'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give Sentinel to a friendly unit or an experience if the choosen unit is already Sentinel', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.generalRieekan);
                expect(context.player1).toBeAbleToSelectExactly([context.generalRieekan, context.consularSecurityForce, context.corellianFreighter]);
                context.player1.clickCard(context.consularSecurityForce);

                context.generalRieekan.exhausted = false;
                context.player2.clickCard(context.wampa);
                // consular security force is automatically choose because of Sentinel
                expect(context.consularSecurityForce.damage).toBe(4);

                context.player1.clickCard(context.generalRieekan);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.generalRieekan, context.consularSecurityForce, context.corellianFreighter]);

                // consular security force is already sentinel, give it an experience token
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
