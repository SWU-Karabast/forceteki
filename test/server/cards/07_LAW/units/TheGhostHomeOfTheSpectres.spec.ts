describe('The Ghost, Home of the Spectres', function () {
    integration(function (contextRef) {
        describe('The Ghost\'s When Played Ability', function () {
            it('should give an Experience token and a Shield to a friendly unit When Played without Vigilance or Aggression units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-ghost#home-of-the-spectres'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['disabling-fang-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theGhost);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Give an Experience token and a Shield token to a unit');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.disablingFangFighter,
                    context.battlefieldMarine,
                    context.cartelSpacer,
                    context.theGhost
                ]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an Experience token and a Shield to itself When Played without Vigilance or Aggression units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-ghost#home-of-the-spectres'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['disabling-fang-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theGhost);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Give an Experience token and a Shield token to a unit');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.disablingFangFighter,
                    context.battlefieldMarine,
                    context.cartelSpacer,
                    context.theGhost
                ]);
                context.player1.clickCard(context.theGhost);

                expect(context.theGhost).toHaveExactUpgradeNames(['experience', 'shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an Experience token and a Shield to an enemy unit When Played without Vigilance or Aggression units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-ghost#home-of-the-spectres'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['disabling-fang-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theGhost);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Give an Experience token and a Shield token to a unit');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.disablingFangFighter,
                    context.battlefieldMarine,
                    context.cartelSpacer,
                    context.theGhost
                ]);
                context.player1.clickCard(context.pykeSentinel);

                expect(context.pykeSentinel).toHaveExactUpgradeNames(['experience', 'shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed without the conditions met', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-ghost#home-of-the-spectres'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['disabling-fang-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theGhost);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });

            it('should give an Experience token and a Shield to 2 friendly units When Played with Vigilance units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-ghost#home-of-the-spectres'],
                        groundArena: ['nightsister-warrior'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['disabling-fang-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theGhost);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Give an Experience token and a Shield token to up to 2 units');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.disablingFangFighter,
                    context.nightsisterWarrior,
                    context.cartelSpacer,
                    context.theGhost
                ]);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickCard(context.nightsisterWarrior);

                expect(context.player1).toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.disablingFangFighter,
                    context.nightsisterWarrior,
                    context.cartelSpacer,
                    context.theGhost
                ]);
                context.player1.clickCard(context.theGhost);
                context.player1.clickPrompt('Done');

                expect(context.nightsisterWarrior).toHaveExactUpgradeNames(['experience', 'shield']);
                expect(context.theGhost).toHaveExactUpgradeNames(['experience', 'shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an Experience token and a Shield When Played with Vigilance units choosing one', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-ghost#home-of-the-spectres'],
                        groundArena: ['nightsister-warrior'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['disabling-fang-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theGhost);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Give an Experience token and a Shield token to up to 2 units');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.disablingFangFighter,
                    context.nightsisterWarrior,
                    context.cartelSpacer,
                    context.theGhost
                ]);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickCard(context.nightsisterWarrior);

                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickDone();

                expect(context.nightsisterWarrior).toHaveExactUpgradeNames(['experience', 'shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an Experience token and a Shield When Played with Aggression units choosing one', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-ghost#home-of-the-spectres'],
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['disabling-fang-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theGhost);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Give an Experience token and a Shield token to up to 2 units');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.pykeSentinel,
                    context.disablingFangFighter,
                    context.wampa,
                    context.cartelSpacer,
                    context.theGhost
                ]);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickDone();

                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed with the condition met', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-ghost#home-of-the-spectres'],
                        groundArena: ['nightsister-warrior'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['disabling-fang-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theGhost);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});