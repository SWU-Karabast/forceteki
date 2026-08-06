describe('Onyx Cinder Adventure Awaits', function() {
    integration(function(contextRef) {
        it('Onyx Cinder\'s ability should give Hidden to other friendly units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa'],
                    spaceArena: ['onyx-cinder#adventure-awaits'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.wampa);

            context.player2.clickCard(context.battlefieldMarine);

            // wampa not selectable cause of Hidden
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });

        it('Onyx Cinder\'s ability should not give Hidden to enemy units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    spaceArena: ['onyx-cinder#adventure-awaits'],
                },
                player2: {
                    hand: ['battlefield-marine'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.battlefieldMarine);

            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
        });

        it('Onyx Cinder\'s ability should give Hidden to other friendly units while he is in play (can be reactivated with Dooku)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'dooku#it-is-too-late'],
                    spaceArena: ['onyx-cinder#adventure-awaits'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'porg'],
                }
            });

            const { context } = contextRef;

            // play wampa, he gains hidden
            context.player1.clickCard(context.wampa);

            // marine can't attack wampa
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
            context.player2.clickCard(context.p1Base);

            context.moveToNextActionPhase();

            context.player1.passAction();

            // marine can attack wampa (hidden ability is expired)
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.wampa]);
            context.player2.clickCard(context.p1Base);

            context.player1.clickCard(context.dooku);

            // dooku was played, unit with hidden can't be attacked, porg can't attack wampa
            context.player2.clickCard(context.porg);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });
    });
});
