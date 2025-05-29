describe('Traitorous', function() {
    integration(function(contextRef) {
        describe('Traitorous\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        hand: ['traitorous', 'change-of-heart'],
                    },
                    player2: {
                        groundArena: ['superlaser-technician', 'wampa'],
                        spaceArena: ['cartel-spacer', 'survivors-gauntlet'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                        hand: ['disabling-fang-fighter'],
                    }
                });
            });

            it('allows to take control of a non-leader unit that costs 3 or less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.traitorous);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.superlaserTechnician, context.cartelSpacer, context.wampa, context.lukeSkywalker, context.survivorsGauntlet]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toBeInZone('spaceArena', context.player1);

                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.traitorous);

                expect(context.cartelSpacer).toBeInZone('spaceArena', context.player2);
            });

            it('does not allow to take control of a leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.traitorous);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.superlaserTechnician, context.cartelSpacer, context.wampa, context.lukeSkywalker, context.survivorsGauntlet]);
                context.player1.clickCard(context.lukeSkywalker);

                expect(context.lukeSkywalker).toBeInZone('groundArena', context.player2);
            });

            it('does not allow to take control of a non-leader unit that costs more than 3', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.traitorous);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.superlaserTechnician, context.cartelSpacer, context.wampa, context.lukeSkywalker, context.survivorsGauntlet]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('groundArena', context.player2);
            });

            it('gives back control of a unit when unattached', function () {
                const { context } = contextRef;

                // Player 1 plays Traitorous to take control of the Superlaser Technician
                context.player1.clickCard(context.traitorous);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.superlaserTechnician, context.cartelSpacer, context.wampa, context.lukeSkywalker, context.survivorsGauntlet]);
                context.player1.clickCard(context.superlaserTechnician);

                expect(context.superlaserTechnician).toBeInZone('groundArena', context.player1);

                // Player 2 passes
                context.player2.passAction();

                // Player 1 plays Change of Heart to take control of the Wampa
                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('groundArena', context.player1);

                // Player 2 attacks with Survivors Gauntlet and move Traitorous to the Wampa,
                // this causes the Superlaser Technician to go back under control of Player 2
                context.player2.clickCard(context.survivorsGauntlet);
                context.player2.clickCard(context.p1Base);
                context.player2.clickCard(context.traitorous);
                context.player2.clickCard(context.wampa);

                expect(context.superlaserTechnician).toBeInZone('groundArena', context.player2);
                expect(context.wampa).toBeInZone('groundArena', context.player1);

                // Player 1 passes
                context.player1.passAction();

                // Player 2 plays Disabling Fang Fighter to defeat Traitorous,
                // this causes the Wampa to go back under control of Player 2
                // even if the Wampa costs more than 3
                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.traitorous);

                expect(context.wampa).toBeInZone('groundArena', context.player2);
            });
        });

        describe('Traitorous\'s interaction with Pilot leaders', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#victor-squadron-leader',
                        base: 'mos-eisley',
                        hand: ['traitorous'],
                    },
                    player2: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        hand: ['confiscate'],
                        spaceArena: [
                            'millennium-falcon#piece-of-junk',
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

                // Player 1 attaches Traitorous to the Millennium Falcon, but it does not take control of it
                context.player1.clickCard(context.traitorous);
                expect(context.player1).toBeAbleToSelectExactly([context.millenniumFalcon]);
                context.player1.clickCard(context.millenniumFalcon);

                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['kazuda-xiono#best-pilot-in-the-galaxy', 'traitorous']);
                expect(context.millenniumFalcon).toBeInZone('spaceArena', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('defeats the unit if it becomes a leader unit before the unattach trigger', function () {
                const { context } = contextRef;

                // Player 1 plays Change of Heart to take control of the Millennium Falcon
                context.player1.clickCard(context.traitorous);
                expect(context.player1).toBeAbleToSelectExactly([context.millenniumFalcon]);
                context.player1.clickCard(context.millenniumFalcon);

                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['traitorous']);
                expect(context.millenniumFalcon).toBeInZone('spaceArena', context.player1);
                context.player2.passAction();

                // Player 1 deploys Darth Vader to pilot the Millennium Falcon
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deploy Darth Vader as a Pilot');
                context.player1.clickCard(context.millenniumFalcon);

                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['darth-vader#victor-squadron-leader', 'traitorous']);
                expect(context.millenniumFalcon.isLeader()).toBeTrue();

                // Player 2 defeats Traitorous using Confiscate
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.traitorous);

                // Millennium Falcon is defeated, Darth Vader is returned to leader position
                expect(context.millenniumFalcon).toBeInZone('discard', context.player2);
                expect(context.darthVader).toBeInZone('base', context.player1);
                expect(context.darthVader.exhausted).toBeTrue();
            });
        });
    });
});
