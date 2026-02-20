describe('Profiteering Hunter', function() {
    integration(function(contextRef) {
        describe('Profiteering Hunter\'s ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['profiteering-hunter'],
                        leader: { card: 'emperor-palpatine#galactic-ruler', deployed: true },
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['millennium-falcon#dodging-patrols', 'cartel-spacer'],
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
            });

            it('should give friendly space unit +1/+1 for this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.profiteeringHunter);

                expect(context.player1).toHavePrompt('Another friendly unit gets +1/+1 for this phase');
                expect(context.player1).not.toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconDodgingPatrols,
                    context.cartelSpacer,
                    context.battlefieldMarine,
                    context.emperorPalpatine
                ]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer.getPower()).toBe(3);
                expect(context.cartelSpacer.getHp()).toBe(4);

                context.player2.passAction();

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                context.player2.clickPrompt('Claim Initiative');
                context.player1.clickPrompt('Pass');

                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.cartelSpacer.getHp()).toBe(3);
            });

            it('should give friendly ground unit +1/+1 for this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.profiteeringHunter);

                expect(context.player1).toHavePrompt('Another friendly unit gets +1/+1 for this phase');
                expect(context.player1).not.toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconDodgingPatrols,
                    context.cartelSpacer,
                    context.battlefieldMarine,
                    context.emperorPalpatine
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(4);

                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                context.player2.clickPrompt('Claim Initiative');
                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should give friendly leader unit +1/+1 for this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.profiteeringHunter);

                expect(context.player1).toHavePrompt('Another friendly unit gets +1/+1 for this phase');
                expect(context.player1).not.toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconDodgingPatrols,
                    context.cartelSpacer,
                    context.battlefieldMarine,
                    context.emperorPalpatine
                ]);
                context.player1.clickCard(context.emperorPalpatine);

                expect(context.emperorPalpatine.getPower()).toBe(5);
                expect(context.emperorPalpatine.getHp()).toBe(11);

                context.player2.passAction();

                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Pass');
                expect(context.p2Base.damage).toBe(5);

                context.player2.clickPrompt('Claim Initiative');
                context.player1.clickPrompt('Pass');

                expect(context.emperorPalpatine.getPower()).toBe(4);
                expect(context.emperorPalpatine.getHp()).toBe(10);
            });
        });
    });
});