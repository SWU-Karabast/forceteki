describe('Doctor Aphra, Rapacious Archaeologist', function () {
    integration(function (contextRef) {
        describe('Doctor Aphra\'s leader undeployed ability', function () {
            it('should discard a card from the deck at the start of the regroup phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['consular-security-force'],
                        leader: 'doctor-aphra#rapacious-archaeologist',
                    },
                });

                const { context } = contextRef;

                context.moveToRegroupPhase();

                expect(context.consularSecurityForce).toBeInZone('discard', context.player1);
            });
        });

        describe('Doctor Aphra\'s leader deployed ability', function () {
            it('should give it +3/+0 if there are five different cost cards in the discard and return one random card to hand if three different named cards are picked from the discards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        discard: ['millennium-falcon#piece-of-junk', 'millennium-falcon#landos-pride', 'warzone-lieutenant', 'devotion', 'separatist-super-tank'],
                        leader: 'doctor-aphra#rapacious-archaeologist',
                    },
                });

                const { context } = contextRef;
                context.game.setRandomSeed('54321');
                const milleniumFalconPieceOfJunk = context.player1.findCardByName('millennium-falcon#piece-of-junk', 'discard');
                const milleniumFalconLandosPride = context.player1.findCardByName('millennium-falcon#landos-pride', 'discard');

                context.player1.clickCard(context.doctorAphraRapaciousArchaeologist);
                context.player1.clickPrompt('Deploy Doctor Aphra');

                expect(context.doctorAphraRapaciousArchaeologist).toBeInZone('groundArena', context.player1);
                expect(context.doctorAphraRapaciousArchaeologist.getPower()).toBe(5);
                expect(context.doctorAphraRapaciousArchaeologist.getHp()).toBe(5);

                expect(context.player1).toBeAbleToSelectExactly([milleniumFalconPieceOfJunk, milleniumFalconLandosPride, context.warzoneLieutenant, context.devotion, context.separatistSuperTank]);

                // Player 1 selects one of the Millenium Falcon cards and the other becomes unselectable
                context.player1.clickCard(milleniumFalconPieceOfJunk);
                expect(context.player1).toBeAbleToSelectExactly([milleniumFalconPieceOfJunk, context.warzoneLieutenant, context.devotion, context.separatistSuperTank]);

                context.player1.clickCard(context.warzoneLieutenant);
                expect(context.player1).toBeAbleToSelectExactly([milleniumFalconPieceOfJunk, context.warzoneLieutenant, context.devotion, context.separatistSuperTank]);

                context.player1.clickCard(context.devotion);
                expect(context.player1).toBeAbleToSelectExactly([milleniumFalconPieceOfJunk, context.warzoneLieutenant, context.devotion, context.separatistSuperTank]);

                // After the selection, one "random" card is returned to the hand and Doctor Aphra loses the +3/+0 bonus because there are no longer 5 different cost cards in the discard
                context.player1.clickPrompt('Done');

                expect(context.getChatLogs(2)).toContain('player1 uses Doctor Aphra to randomly select 1 of Millennium Falcon, Warzone Lieutenant, and Devotion');
                expect(context.getChatLogs(2)).toContain('player1 uses Doctor Aphra to return Devotion to their hand');
                expect(context.devotion).toBeInZone('hand', context.player1);
                expect(context.warzoneLieutenant).toBeInZone('discard', context.player1);
                expect(milleniumFalconPieceOfJunk).toBeInZone('discard', context.player1);
                expect(context.doctorAphraRapaciousArchaeologist.getPower()).toBe(2);
                expect(context.doctorAphraRapaciousArchaeologist.getHp()).toBe(5);
            });

            it('should do nothing if there are less than 3 cards with unique names in the discards', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        discard: ['millennium-falcon#piece-of-junk', 'millennium-falcon#landos-pride', 'chewbacca#loyal-companion', 'chewbacca#pykesbane'],
                        leader: 'doctor-aphra#rapacious-archaeologist',
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doctorAphraRapaciousArchaeologist);
                context.player1.clickPrompt('Deploy Doctor Aphra');

                expect(context.doctorAphraRapaciousArchaeologist).toBeInZone('groundArena', context.player1);
                expect(context.doctorAphraRapaciousArchaeologist.getPower()).toBe(2);
                expect(context.doctorAphraRapaciousArchaeologist.getHp()).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
