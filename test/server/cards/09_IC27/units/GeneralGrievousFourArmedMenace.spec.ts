describe('General Grievous, Four-Armed Menace', function() {
    integration(function(contextRef) {
        const experienceChoice = 'Give an Experience token to General Grievous';
        const healChoice = 'Heal 3 damage from your base';
        const drawChoice = 'Draw a card';

        it('offers each option only if it has not been chosen yet this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['general-grievous#fourarmed-menace'],
                    hand: ['entrenched', 'devotion', 'electrostaff', 'academy-training'],
                    base: { card: 'echo-base', damage: 5 }
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.entrenched);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, drawChoice]);
            context.player1.clickPrompt(experienceChoice);

            expect(context.generalGrievous).toHaveExactUpgradeNames(['entrenched', 'experience']);
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            context.player1.clickCard(context.devotion);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            expect(context.player1).toHaveExactPromptButtons([healChoice, drawChoice]);
            context.player1.clickPrompt(healChoice);

            expect(context.p1Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            context.player1.clickCard(context.electrostaff);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            expect(context.player1).toHaveExactPromptButtons([drawChoice]);
            context.player1.clickPrompt(drawChoice);

            expect(context.player1.handSize).toBe(2);
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            // every option has been chosen this phase, so the ability does nothing
            context.player1.clickCard(context.academyTraining);
            context.player1.clickCard(context.generalGrievous);

            expect(context.generalGrievous).toHaveExactUpgradeNames(['entrenched', 'experience', 'devotion', 'electrostaff', 'academy-training']);
            expect(context.player1.handSize).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('counts an option as chosen even if it had no effect', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['general-grievous#fourarmed-menace'],
                    hand: ['entrenched', 'devotion']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.entrenched);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, drawChoice]);
            context.player1.clickPrompt(healChoice);

            expect(context.p1Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            context.player1.clickCard(context.devotion);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            expect(context.player1).toHaveExactPromptButtons([experienceChoice, drawChoice]);
            context.player1.clickPrompt(drawChoice);

            expect(context.player2).toBeActivePlayer();
        });

        it('offers every option again in the next phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['general-grievous#fourarmed-menace'],
                    hand: ['entrenched', 'devotion'],
                    base: { card: 'echo-base', damage: 5 }
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.entrenched);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            context.player1.clickPrompt(drawChoice);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.devotion);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, drawChoice]);
            context.player1.clickPrompt(drawChoice);

            expect(context.player2).toBeActivePlayer();
        });

        it('offers every option again after he leaves play and is played again', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['general-grievous#fourarmed-menace'],
                    hand: ['entrenched', 'devotion', 'waylay'],
                    base: { card: 'echo-base', damage: 5 }
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.entrenched);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            context.player1.clickPrompt(drawChoice);
            context.player2.passAction();

            context.player1.clickCard(context.waylay);
            context.player1.clickCard(context.generalGrievous);
            expect(context.generalGrievous).toBeInZone('hand');
            context.player2.passAction();

            context.player1.clickCard(context.generalGrievous);
            context.player2.passAction();

            context.player1.clickCard(context.devotion);
            context.player1.clickCard(context.generalGrievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice, drawChoice]);
            context.player1.clickPrompt(drawChoice);

            expect(context.player2).toBeActivePlayer();
        });

        it('tracks the chosen options separately for each copy', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['general-grievous#fourarmed-menace'],
                    hand: ['entrenched', 'devotion'],
                    base: { card: 'echo-base', damage: 5 }
                },
                player2: {
                    groundArena: ['general-grievous#fourarmed-menace'],
                    hand: ['electrostaff']
                }
            });

            const { context } = contextRef;
            const p1Grievous = context.player1.findCardByName('general-grievous#fourarmed-menace');
            const p2Grievous = context.player2.findCardByName('general-grievous#fourarmed-menace');

            context.player1.clickCard(context.entrenched);
            context.player1.clickCard(p1Grievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            context.player1.clickPrompt(drawChoice);

            context.player2.clickCard(context.electrostaff);
            context.player2.clickCard(p2Grievous);

            expect(context.player2).toHavePrompt('Choose an effect for General Grievous');
            expect(context.player2).toHaveExactPromptButtons([experienceChoice, healChoice, drawChoice]);
            context.player2.clickPrompt(drawChoice);

            context.player1.clickCard(context.devotion);
            context.player1.clickCard(p1Grievous);

            expect(context.player1).toHavePrompt('Choose an effect for General Grievous');
            expect(context.player1).toHaveExactPromptButtons([experienceChoice, healChoice]);
            context.player1.clickPrompt(experienceChoice);

            expect(context.player2).toBeActivePlayer();
        });

        it('does not trigger when an upgrade is played on another unit or by the opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['general-grievous#fourarmed-menace', 'wampa'],
                    hand: ['entrenched']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    hand: ['electrostaff']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.entrenched);
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toHaveExactUpgradeNames(['entrenched']);
            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.electrostaff);
            context.player2.clickCard(context.generalGrievous);

            expect(context.generalGrievous).toHaveExactUpgradeNames(['electrostaff']);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
