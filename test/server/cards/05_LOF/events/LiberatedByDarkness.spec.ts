describe('Liberated by Darkness', function() {
    integration(function(contextRef) {
        describe('Liberated by Darkness\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['liberated-by-darkness'],
                        groundArena: [{ card: 'pyke-sentinel', owner: 'player2' }],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: [{ card: 'battlefield-marine', owner: 'player1' }, 'wampa']
                    }
                });
            });

            it('takes control and will return enemy non-leader unit to owner\'s control', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberatedByDarkness);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.wampa, context.pykeSentinel]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player1);

                // Check that Wampa returns to player 2
                context.moveToRegroupPhase();
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('takes control and will return enemy non-leader unit to owner\'s control', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberatedByDarkness);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.wampa, context.pykeSentinel]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('groundArena', context.player1);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);

                // Check that Wampa stays in player 2 discard
                context.moveToRegroupPhase();
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('takes control and will return stolen friendly non-leader unit to owner\'s control', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberatedByDarkness);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.wampa, context.pykeSentinel]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                // Check that Battlefield Marine stays with player1 since p1 is the owner
                context.moveToRegroupPhase();
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('takes control and will not return stolen friendly non-leader unit to owner\'s control if unit is dead', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.liberatedByDarkness);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.wampa, context.pykeSentinel]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

                // Check that Battlefield Marine stays in p1 discard
                context.moveToRegroupPhase();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.player1).toHavePrompt('Select between 0 and 1 cards to resource');
            });

            it('has no effect if the player does not have the force', function () {
                const { context } = contextRef;
                context.player1.setHasTheForce(false);

                context.player1.clickCard(context.liberatedByDarkness);

                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Liberated by Darkness\'s interaction with Pilot leaders', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#victor-squadron-leader',
                        base: 'mos-eisley',
                        hasForceToken: true,
                        hand: ['liberated-by-darkness'],
                    },
                    player2: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        spaceArena: [
                            'millennium-falcon#landos-pride',
                        ]
                    }
                });
            });

            it('cannot take control of a piloted leader unit', function () {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 deploys Kazuda Xiono to pilot the Millennium Falcon
                context.player2.clickCard(context.kazudaXiono);
                context.player2.clickPrompt('Deploy Kazuda Xiono as a Pilot');
                context.player2.clickCard(context.millenniumFalcon);

                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['kazuda-xiono#best-pilot-in-the-galaxy']);
                expect(context.millenniumFalcon.isLeader()).toBeTrue();

                // Player 1 plays Liberated by Darkness, but it fizzles
                context.player1.clickCard(context.liberatedByDarkness);

                expect(context.player2).toBeActivePlayer();
            });

            it('defeats the unit if it becomes a leader unit before the delayed effect resolves', function () {
                const { context } = contextRef;

                // Player 1 plays Liberated by Darkness to take control of the Millennium Falcon
                context.player1.clickCard(context.liberatedByDarkness);
                context.player1.clickCard(context.millenniumFalcon);

                expect(context.millenniumFalcon).toBeInZone('spaceArena', context.player1);
                context.player2.passAction();

                // Player 1 deploys Darth Vader to pilot the Millennium Falcon
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deploy Darth Vader as a Pilot');
                context.player1.clickCard(context.millenniumFalcon);

                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['darth-vader#victor-squadron-leader']);
                expect(context.millenniumFalcon.isLeader()).toBeTrue();

                // Move to regroup phase
                context.moveToRegroupPhase();

                // Millennium Falcon is defeated, Darth Vader is returned to leader position
                expect(context.millenniumFalcon).toBeInZone('discard', context.player2);
                expect(context.darthVader).toBeInZone('base', context.player1);
                expect(context.darthVader.exhausted).toBeTrue();
            });
        });
    });
});
