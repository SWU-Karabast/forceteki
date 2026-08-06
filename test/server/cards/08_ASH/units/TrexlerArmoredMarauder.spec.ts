describe('Trexler Armored Marauder', function() {
    integration(function(contextRef) {
        describe('Trexler Armored Marauder\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['trexler-armored-marauder'],
                        groundArena: ['battlefield-marine', 'atst'],
                        spaceArena: ['graceful-purrgil', 'awing'],
                        leader: 'wedge-antilles#leader-of-red-squadron'
                    },
                    player2: {
                        groundArena: ['gungi#finding-himself', 'reinforcement-walker'],
                        spaceArena: ['devastator#hunting-the-rebellion', 'lurking-tie-phantom'],
                        leader: 'asajj-ventress#i-work-alone'
                    },
                });
            });

            it('should give a shield token to a friendly ground unit that costs 3 or less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.trexlerArmoredMarauder);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.awing,
                    context.gungi,
                    context.lurkingTiePhantom
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
                expect(context.trexlerArmoredMarauder).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.gracefulPurrgil).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.gungi).toHaveExactUpgradeNames([]);
                expect(context.reinforcementWalker).toHaveExactUpgradeNames([]);
                expect(context.devastator).toHaveExactUpgradeNames([]);
                expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            });

            it('should give a shield token to a friendly space unit that costs 3 or less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.trexlerArmoredMarauder);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.awing,
                    context.gungi,
                    context.lurkingTiePhantom
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.awing);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.trexlerArmoredMarauder).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.gracefulPurrgil).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames(['shield']);
                expect(context.gungi).toHaveExactUpgradeNames([]);
                expect(context.reinforcementWalker).toHaveExactUpgradeNames([]);
                expect(context.devastator).toHaveExactUpgradeNames([]);
                expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            });

            it('should give a shield token to an enemy ground unit that costs 3 or less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.trexlerArmoredMarauder);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.awing,
                    context.gungi,
                    context.lurkingTiePhantom
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.gungi);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.trexlerArmoredMarauder).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.gracefulPurrgil).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.gungi).toHaveExactUpgradeNames(['shield']);
                expect(context.reinforcementWalker).toHaveExactUpgradeNames([]);
                expect(context.devastator).toHaveExactUpgradeNames([]);
                expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            });

            it('should give a shield token to an enemy space unit that costs 3 or less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.trexlerArmoredMarauder);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.awing,
                    context.gungi,
                    context.lurkingTiePhantom
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.trexlerArmoredMarauder).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.gracefulPurrgil).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.gungi).toHaveExactUpgradeNames([]);
                expect(context.reinforcementWalker).toHaveExactUpgradeNames([]);
                expect(context.devastator).toHaveExactUpgradeNames([]);
                expect(context.lurkingTiePhantom).toHaveExactUpgradeNames(['shield']);
            });

            it('should give a shield token to a friendly leader unit that costs 3 or less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wedgeAntilles);
                context.player1.clickPrompt('Deploy Wedge Antilles as a pilot');
                context.player1.clickCard(context.awing);

                context.player2.passAction();

                context.player1.clickCard(context.trexlerArmoredMarauder);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.awing,
                    context.gungi,
                    context.lurkingTiePhantom
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.awing);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.trexlerArmoredMarauder).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.gracefulPurrgil).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames(['shield', 'wedge-antilles#leader-of-red-squadron']);
                expect(context.gungi).toHaveExactUpgradeNames([]);
                expect(context.reinforcementWalker).toHaveExactUpgradeNames([]);
                expect(context.devastator).toHaveExactUpgradeNames([]);
                expect(context.lurkingTiePhantom).toHaveExactUpgradeNames([]);
            });

            it('should give a shield token to an enemy leader unit that costs 3 or less', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.asajjVentress);
                context.player2.clickPrompt('Deploy Asajj Ventress as a pilot');
                context.player2.clickCard(context.lurkingTiePhantom);

                context.player1.clickCard(context.trexlerArmoredMarauder);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.awing,
                    context.gungi,
                    context.lurkingTiePhantom
                ]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.trexlerArmoredMarauder).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.gracefulPurrgil).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.gungi).toHaveExactUpgradeNames([]);
                expect(context.reinforcementWalker).toHaveExactUpgradeNames([]);
                expect(context.devastator).toHaveExactUpgradeNames([]);
                expect(context.lurkingTiePhantom).toHaveExactUpgradeNames(['shield', 'asajj-ventress#i-work-alone']);
            });
        });
    });
});