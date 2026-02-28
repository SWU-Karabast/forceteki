describe('Nothing Left To Fear', function() {
    integration(function(contextRef) {
        describe('Nothing Left To Fear\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-tree-remembers', 'rivals-fall'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['chewbacca#faithful-first-mate', 'atst'],
                        spaceArena: ['lurking-tie-phantom', 'avenger#hunting-star-destroyer'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
            });

            it('should wipe abilities from an enemy unit and defeat it since it costs 3 or less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theTreeRemembers);

                // Should only be able to select enemy units
                expect(context.player1).toBeAbleToSelectExactly([context.chewbaccaFaithfulFirstMate, context.atst, context.lurkingTiePhantom, context.avengerHuntingStarDestroyer, context.darthVaderDarkLordOfTheSith]);

                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.lurkingTiePhantom).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should wipe abilities from an enemy unit but not defeat it since it costs more than 3', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theTreeRemembers);

                // Should only be able to select enemy units
                expect(context.player1).toBeAbleToSelectExactly([context.chewbaccaFaithfulFirstMate, context.atst, context.lurkingTiePhantom, context.avengerHuntingStarDestroyer, context.darthVaderDarkLordOfTheSith]);

                context.player1.clickCard(context.chewbaccaFaithfulFirstMate);

                expect(context.chewbaccaFaithfulFirstMate).toBeInZone('groundArena');

                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.chewbaccaFaithfulFirstMate);

                expect(context.chewbaccaFaithfulFirstMate).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });

            it('should wipe abilities from leaders', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theTreeRemembers);

                // Should only be able to select enemy units
                expect(context.player1).toBeAbleToSelectExactly([context.chewbaccaFaithfulFirstMate, context.atst, context.lurkingTiePhantom, context.avengerHuntingStarDestroyer, context.darthVaderDarkLordOfTheSith]);

                context.player1.clickCard(context.darthVaderDarkLordOfTheSith);

                expect(context.darthVaderDarkLordOfTheSith).toBeInZone('groundArena');

                context.player2.clickCard(context.darthVaderDarkLordOfTheSith);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();

                expect(context.darthVaderDarkLordOfTheSith.damage).toBe(0);
                expect(context.chewbaccaFaithfulFirstMate.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.lurkingTiePhantom.damage).toBe(0);
                expect(context.avengerHuntingStarDestroyer.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.allianceXwing.damage).toBe(0);
            });
        });
    });
});