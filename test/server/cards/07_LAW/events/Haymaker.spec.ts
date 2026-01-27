describe('Haymaker', function() {
    integration(function(contextRef) {
        describe('Haymaker\' ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['haymaker'],
                        groundArena: ['battlefield-marine', 'wampa'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', 'atst'],
                        spaceArena: ['bright-hope#the-last-transport']
                    }
                });
            });

            it('should give experience to a friendly ground unit and then deal damage to an enemy unit in the same arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.haymaker);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing, context.wampa]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.atst]);
                expect(context.player1).not.toHavePrompt('Pass');
                expect(context.player1).toHavePrompt('Deal 4 damage to an enemy unit in the same arena');
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give experience to a friendly space unit and then deal damage to an enemy unit in the same arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.haymaker);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing, context.wampa]);
                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing).toHaveExactUpgradeNames(['experience']);

                expect(context.player1).toBeAbleToSelectExactly([context.brightHopeTheLastTransport]);
                context.player1.clickCard(context.brightHopeTheLastTransport);
                expect(context.brightHopeTheLastTransport.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should prompt to play anyway when there are no valid targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['haymaker'],
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.haymaker);

            expect(context.player1).toHavePrompt('Playing Haymaker will have no effect. Are you sure you want to play it?');
            context.player1.clickPrompt('Play anyway');

            // Event should resolve with no effect
            expect(context.haymaker).toBeInZone('discard');
            expect(context.atst.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('should still give experience when there are no damage targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['haymaker'],
                    spaceArena: ['bright-hope#the-last-transport']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.haymaker);

            context.player1.clickCard(context.brightHopeTheLastTransport);
            expect(context.brightHopeTheLastTransport).toHaveExactUpgradeNames(['experience']);

            expect(context.atst.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});