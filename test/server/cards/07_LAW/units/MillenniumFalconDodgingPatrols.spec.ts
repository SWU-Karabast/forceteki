describe('Patient Hunter', function() {
    integration(function(contextRef) {
        describe('Patient Hunter\'s ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'emperor-palpatine#galactic-ruler', deployed: true },
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['millennium-falcon#dodging-patrols', 'cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['lurking-tie-phantom'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
            });

            it('should give enemy space unit -2/-0 and friendly ground unit +2/+0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.millenniumFalconDodgingPatrols);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give a space unit -2/-0 for this phase');
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconDodgingPatrols,
                    context.cartelSpacer,
                    context.lurkingTiePhantom
                ]);
                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.player1).toHavePrompt('Give a ground unit +2/+0 for this phase');
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.emperorPalpatineGalacticRuler,
                    context.battlefieldMarine,
                    context.pykeSentinel,
                    context.darthVaderDarkLordOfTheSith
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.lurkingTiePhantom.getPower()).toBe(0);
                expect(context.battlefieldMarine.getPower()).toBe(5);
            });

            it('should give itself -2/-0 and an enemy ground leader unit +2/+0', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.millenniumFalconDodgingPatrols);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give a space unit -2/-0 for this phase');
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconDodgingPatrols,
                    context.cartelSpacer,
                    context.lurkingTiePhantom
                ]);
                context.player1.clickCard(context.millenniumFalconDodgingPatrols);

                expect(context.player1).toHavePrompt('Give a ground unit +2/+0 for this phase');
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.emperorPalpatineGalacticRuler,
                    context.battlefieldMarine,
                    context.pykeSentinel,
                    context.darthVaderDarkLordOfTheSith
                ]);
                context.player1.clickCard(context.darthVaderDarkLordOfTheSith);

                expect(context.millenniumFalconDodgingPatrols.getPower()).toBe(0);
                expect(context.darthVaderDarkLordOfTheSith.getPower()).toBe(7);
                expect(context.p2Base.damage).toBe(0);
            });

            it('should be able to be passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.millenniumFalconDodgingPatrols);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give a space unit -2/-0 for this phase');
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.millenniumFalconDodgingPatrols,
                    context.cartelSpacer,
                    context.lurkingTiePhantom
                ]);
                context.player1.clickPrompt('Choose nothing');

                expect(context.player1).toHavePrompt('Give a ground unit +2/+0 for this phase');
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.emperorPalpatineGalacticRuler,
                    context.battlefieldMarine,
                    context.pykeSentinel,
                    context.darthVaderDarkLordOfTheSith
                ]);
                context.player1.clickPrompt('Choose nothing');

                expect(context.lurkingTiePhantom.getPower()).toBe(2);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.millenniumFalconDodgingPatrols.getPower()).toBe(2);
                expect(context.emperorPalpatineGalacticRuler.getPower()).toBe(4);
                expect(context.pykeSentinel.getPower()).toBe(2);
                expect(context.darthVaderDarkLordOfTheSith.getPower()).toBe(5);
            });
        });
    });
});
