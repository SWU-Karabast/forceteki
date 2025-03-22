describe('Chewbacca, Faithful First Mate', function() {
    integration(function(contextRef) {
        describe('Chewbacca, Faithful First Mate\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['home-one#alliance-flagship'],
                        groundArena: ['battlefield-marine'],
                        hand: ['chewbacca#faithful-first-mate', 'vanquish'],
                    },
                    player2: {
                        spaceArena: ['avenger#hunting-star-destroyer'],
                        hand: [
                            'waylay',
                            'rivals-fall',
                            'confiscate',
                            'open-fire',
                            'bamboozle',
                            'emperor-palpatine#master-of-the-dark-side',
                            'no-glory-only-results',
                            'change-of-heart'
                        ],
                    }
                });
            });

            // Piloting upgrade testing

            it('should prevent attached unit to be defeated by enemy card abilities', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                context.player1.clickCard(context.homeOne);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.homeOne);
                expect(context.homeOne).toBeInZone('spaceArena', context.player1);

                expect(context.player1).toBeActivePlayer();
            });

            it('should prevent attached unit to be returned to hand by enemy card abilities', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                context.player1.clickCard(context.homeOne);

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.homeOne);
                expect(context.homeOne).toBeInZone('spaceArena', context.player1);

                expect(context.player1).toBeActivePlayer();
            });

            it('should allow attached unit to be damaged by enemy card abilities', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                context.player1.clickCard(context.homeOne);

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.homeOne);
                expect(context.homeOne.damage).toBe(4);

                expect(context.player1).toBeActivePlayer();
            });

            it('should be defeated by enemy card abilities as an upgrade', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                context.player1.clickCard(context.homeOne);

                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.chewbacca);
                expect(context.chewbacca).toBeInZone('discard');

                expect(context.player1).toBeActivePlayer();
            });

            it('should be returned to hand by enemy card abilities as an upgrade', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                context.player1.clickCard(context.homeOne);

                context.player2.clickCard(context.bamboozle);
                context.player2.clickPrompt('Play Bamboozle');
                context.player2.clickCard(context.homeOne);
                expect(context.chewbacca).toBeInZone('hand', context.player1);
                expect(context.homeOne).toBeInZone('spaceArena', context.player1);

                expect(context.player1).toBeActivePlayer();
            });

            it('should allow attached unit to be defeated by friendly card abilities', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                context.player1.clickCard(context.homeOne);

                context.player2.passAction();
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.homeOne);

                expect(context.homeOne).toBeInZone('discard');
                expect(context.chewbacca).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the attached unit to be selectable by enemy card abilities but prevent it from being defeated', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                context.player1.clickCard(context.homeOne);

                context.player2.clickCard(context.avenger);
                context.player2.clickCard(context.p1Base);
                context.player1.clickCard(context.homeOne);

                expect(context.homeOne).toBeInZone('spaceArena', context.player1);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.player1).toBeActivePlayer();
            });

            // TODO: Add test interaction with Force Lightning or Imprisioned

            // Unit tests for unit side of the card

            it('should prevent to be defeated by enemy card abilities as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca');

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.chewbacca);
                expect(context.chewbacca).toBeInZone('groundArena', context.player1);

                expect(context.player1).toBeActivePlayer();
            });

            it('should prevent to be returned to hand by enemy card abilities as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca');

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.chewbacca);
                expect(context.chewbacca).toBeInZone('groundArena', context.player1);

                expect(context.player1).toBeActivePlayer();
            });

            it('should be defeated by friendly card abilities as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca');

                context.player2.passAction();
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.chewbacca);

                expect(context.chewbacca).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow to be selectable by enemy card abilities but prevent it from being defeated as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca');

                context.player2.clickCard(context.avenger);
                context.player2.clickCard(context.p1Base);
                context.player1.clickCard(context.chewbacca);

                expect(context.chewbacca).toBeInZone('groundArena', context.player1);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.player1).toBeActivePlayer();
            });

            it('should be defeated by damage dealt as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca');

                context.player2.clickCard(context.emperorPalpatine);
                context.player2.setDistributeDamagePromptState(new Map([
                    [context.chewbacca, 6]
                ]));

                expect(context.chewbacca).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();
            });

            it('should be defeated by friendly card abilities when stolen as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca');

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.chewbacca);

                expect(context.chewbacca).toBeInZone('discard');
            });

            it('should be returned to owner\'s hand by friendly card abilities when stolen as a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca');

                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.chewbacca);

                context.player1.passAction();

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.chewbacca);

                expect(context.chewbacca).toBeInZone('hand', context.player1);
            });

            // TODO: Add test interaction with Force Lightning or Imprisioned
        });
    });
});
