describe('Evade Arrest', function() {
    integration(function(contextRef) {
        describe('Evade Arrest\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['evade-arrest'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['atst', 'yoda#old-master'],
                        spaceArena: ['tie-fighter']
                    }
                });
            });

            it('should exhaust any number of non-unique units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.evadeArrest);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.battlefieldMarine,
                    context.cartelSpacer,
                    context.atst,
                    context.tieFighter
                ]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.tieFighter);
                context.player1.clickPrompt('Done');

                // non-unique units
                expect(context.atst.exhausted).toBeTrue();
                expect(context.tieFighter.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();

                // not selected units or unique units
                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.yoda.exhausted).toBeFalse();
            });

            it('should be able to exhaust all non-unique units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.evadeArrest);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.tieFighter);
                context.player1.clickPrompt('Done');

                // non-unique units
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.cartelSpacer.exhausted).toBeTrue();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.tieFighter.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();

                // unique unit
                expect(context.yoda.exhausted).toBeFalse();
            });

            it('should be able to exhaust zero units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.evadeArrest);
                context.player1.clickPrompt('Choose nothing');

                expect(context.battlefieldMarine.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expect(context.atst.exhausted).toBeFalse();
                expect(context.tieFighter.exhausted).toBeFalse();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.yoda.exhausted).toBeFalse();
            });
        });

        it('Evade Arrest\'s ability should be able to exhaust a non-unique leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['evade-arrest'],
                },
                player2: {
                    leader: 'major-vonreg#red-baron',
                    spaceArena: ['black-sun-patroller'],
                    hasInitiative: true,
                }
            });
            const { context } = contextRef;
            context.player2.clickCard(context.majorVonreg);
            context.player2.clickPrompt('Deploy Major Vonreg as a Pilot');
            context.player2.clickCard(context.blackSunPatroller);

            context.player1.clickCard(context.evadeArrest);
            expect(context.player1).toBeAbleToSelectExactly([context.blackSunPatroller]);
            expect(context.player1).toHaveChooseNothingButton();

            context.player1.clickCard(context.blackSunPatroller);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();
            expect(context.blackSunPatroller.exhausted).toBeTrue();
        });
    });
});
