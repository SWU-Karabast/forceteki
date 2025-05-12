describe('General Rieekan, Defensive Strategist', function () {
    integration(function (contextRef) {
        describe('General Rieekan\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['general-rieekan#defensive-strategist'],
                        groundArena: ['consular-security-force'],
                        spaceArena: ['corellian-freighter'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });
            });

            it('should give Sentinel to a friendly unit or an experience if the choosen unit already has Sentinel', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.generalRieekan);
                expect(context.player1).toBeAbleToSelectExactly([context.generalRieekan, context.consularSecurityForce, context.corellianFreighter]);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.getChatLogs(2)).toContain('player1 uses General Rieekan to give Sentinel to Consular Security Force for this phase');

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(4);

                context.readyCard(context.generalRieekan);
                context.player1.clickCard(context.generalRieekan);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.generalRieekan, context.consularSecurityForce, context.corellianFreighter]);

                // consular security force is already sentinel, give it an experience token
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce).toHaveExactUpgradeNames(['experience']);
                expect(context.getChatLogs(2)).toContain('player1 uses General Rieekan to give an Experience token to Consular Security Force');
            });
        });
    });
});
