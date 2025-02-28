describe('Restock', function () {
    integration(function (contextRef) {
        describe('Restock\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['restock'],
                        discard: ['pyke-sentinel', 'atst', 'battlefield-marine', 'resupply'],
                    },
                    player2: {
                        discard: ['consular-security-force', 'specforce-soldier', 'echo-base-defender']
                    }
                });
            });

            it('should return up to 4 card from our discard to bottom of deck', function () {
                const { context } = contextRef;

                // play restock
                context.player1.clickCard(context.restock);

                // can select both discards
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.battlefieldMarine, context.resupply, context.restock, context.consularSecurityForce, context.specforceSoldier, context.echoBaseDefender]);

                // select cards
                context.player1.clickCard(context.resupply);

                // once we choose, only one discard available
                expect(context.player1).toBeAbleToSelectExactly([context.restock, context.pykeSentinel, context.atst, context.battlefieldMarine, context.resupply]);

                context.player1.clickCard(context.restock);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);
                context.player1.clickCardNonChecking(context.pykeSentinel);
                context.player1.clickPrompt('Done');

                // selected cards should be in bottom on deck
                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 4);
                expect(context.resupply).toBeInBottomOfDeck(context.player1, 4);
                expect(context.restock).toBeInBottomOfDeck(context.player1, 4);
                expect(context.atst).toBeInBottomOfDeck(context.player1, 4);
                expect(context.pykeSentinel).toBeInZone('discard');
            });

            it('should return up to 4 card from opponent discard to bottom of deck', function () {
                const { context } = contextRef;

                // play restock
                context.player1.clickCard(context.restock);

                // can select both discards
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.battlefieldMarine, context.resupply, context.restock, context.consularSecurityForce, context.specforceSoldier, context.echoBaseDefender]);

                // select cards
                context.player1.clickCard(context.consularSecurityForce);

                // once we choose, only one discard available
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.specforceSoldier, context.echoBaseDefender]);

                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickCard(context.echoBaseDefender);
                context.player1.clickPrompt('Done');

                // selected cards should be in bottom on deck
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player2, 3);
                expect(context.specforceSoldier).toBeInBottomOfDeck(context.player2, 3);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player2, 3);
            });

            it('can return no card', function () {
                const { context } = contextRef;

                // play restock
                context.player1.clickCard(context.restock);

                // can select both discards
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst, context.battlefieldMarine, context.resupply, context.restock, context.consularSecurityForce, context.specforceSoldier, context.echoBaseDefender]);

                context.player1.clickPrompt('Done');

                // no cards selected, all cards should be in discard
                expect(context.pykeSentinel).toBeInZone('discard');
                expect(context.atst).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.resupply).toBeInZone('discard');
                expect(context.restock).toBeInZone('discard');
                expect(context.consularSecurityForce).toBeInZone('discard');
                expect(context.specforceSoldier).toBeInZone('discard');
                expect(context.echoBaseDefender).toBeInZone('discard');
            });
        });
    });
});
