describe('Patient Hunter', function() {
    integration(function(contextRef) {
        describe('Patient Hunter\'s ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'emperor-palpatine#galactic-ruler', deployed: true },
                        groundArena: [{ card: 'patient-hunter', exhausted: true }],
                        spaceArena: [{ card: 'green-squadron-awing', exhausted: true }],
                    },
                    player2: {
                        groundArena: [
                            { card: 'frontier-atrt', damage: 1, exhausted: true },
                            { card: 'consular-security-force', exhausted: true }
                        ],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
            });

            it('should prompt controller of Patient Hunter on regroup to give experience, then keep that unit exhausted, choosing itself', function () {
                const { context } = contextRef;

                context.player1.claimInitiative();
                context.player2.passAction();

                expect(context.player1).toHavePrompt('Give an Experience token to a unit. If you do, that unit can\'t ready during this regroup phase');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.patientHunter,
                    context.greenSquadronAwing,
                    context.frontierAtrt,
                    context.consularSecurityForce,
                ]);
                context.player1.clickCard(context.patientHunter);

                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.patientHunter).toHaveExactUpgradeNames(['experience']);
                expect(context.patientHunter.exhausted).toBeTrue();
            });

            it('should prompt controller of Patient Hunter on regroup to give experience, then keep that unit exhausted, choosing enemy unit', function () {
                const { context } = contextRef;

                context.player1.claimInitiative();
                context.player2.passAction();

                expect(context.player1).toHavePrompt('Give an Experience token to a unit. If you do, that unit can\'t ready during this regroup phase');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.patientHunter,
                    context.greenSquadronAwing,
                    context.frontierAtrt,
                    context.consularSecurityForce,
                ]);
                context.player1.clickCard(context.frontierAtrt);

                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.frontierAtrt).toHaveExactUpgradeNames(['experience']);
                expect(context.frontierAtrt.exhausted).toBeTrue();
            });

            it('should be able to be passed', function () {
                const { context } = contextRef;

                context.player1.claimInitiative();
                context.player2.passAction();

                expect(context.player1).toHavePrompt('Give an Experience token to a unit. If you do, that unit can\'t ready during this regroup phase');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.patientHunter,
                    context.greenSquadronAwing,
                    context.frontierAtrt,
                    context.consularSecurityForce,
                ]);
                context.player1.clickPrompt('Pass');

                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.patientHunter.exhausted).toBeFalse();
                expect(context.emperorPalpatineGalacticRuler.exhausted).toBeFalse();
                expect(context.frontierAtrt.exhausted).toBeFalse();
                expect(context.consularSecurityForce.exhausted).toBeFalse();
                expect(context.darthVaderDarkLordOfTheSith.exhausted).toBeFalse();
            });
        });

        it('Patient Hunter\'s extra test ability', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['patient-hunter'],
                    deck: ['cloudrider'],
                },
                player2: {
                    groundArena: [{ card: 'chewbacca#loyal-companion', exhausted: true }],
                    spaceArena: [{ card: 'fireball#an-explosion-with-wings', damage: 2, upgrades: ['bounty-hunters-quarry'] }]
                },
            });
            const { context } = contextRef;

            context.player1.clickPrompt('Claim Initiative');
            context.player2.clickPrompt('Pass');

            context.player1.clickPrompt('You');
            context.player1.clickCard(context.chewbaccaLoyalCompanion);
            expect(context.chewbaccaLoyalCompanion).toHaveExactUpgradeNames(['experience']);

            context.player1.clickPrompt('Trigger');
            context.player1.clickCardInDisplayCardPrompt(context.cloudrider);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.chewbaccaLoyalCompanion);
            expect(context.chewbaccaLoyalCompanion.damage).toBe(3);
            expect(context.chewbaccaLoyalCompanion.exhausted).toBe(true);
        });
    });
});