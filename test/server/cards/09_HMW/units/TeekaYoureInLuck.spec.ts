describe('Teeka, You\'re In Luck', function() {
    integration(function(contextRef) {
        it('should give a unit Sentinel for this phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['teeka#youre-in-luck'],
                    groundArena: ['jedi-consular'],
                    spaceArena: ['frontline-shuttle']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.teeka);

            expect(context.player1).toHaveExactPromptButtons([
                'Give a unit Sentinel for this phase',
                'A unit loses Sentinel for this phase',
            ]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickPrompt('Give a unit Sentinel for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.frontlineShuttle, context.jediConsular, context.teeka, context.battlefieldMarine, context.awing]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.jediConsular);

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.jediConsular]);
            context.player2.clickCard(context.jediConsular);

            context.moveToNextActionPhase();
            context.player1.passAction();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.jediConsular, context.p1Base, context.teeka]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(3);
        });

        it('should make a unit lose Sentinel for this phase', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['teeka#youre-in-luck'],
                    groundArena: ['imperial-armored-commando'],
                    spaceArena: ['frontline-shuttle']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.teeka);

            expect(context.player1).toHaveExactPromptButtons([
                'Give a unit Sentinel for this phase',
                'A unit loses Sentinel for this phase',
            ]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickPrompt('A unit loses Sentinel for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.frontlineShuttle, context.imperialArmoredCommando, context.teeka, context.battlefieldMarine, context.awing]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.imperialArmoredCommando);

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.imperialArmoredCommando, context.teeka, context.p1Base]);
            context.player2.clickCard(context.p1Base);

            context.moveToNextActionPhase();
            context.player1.passAction();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.imperialArmoredCommando]);
            context.player2.clickCard(context.imperialArmoredCommando);
            expect(context.p1Base.damage).toBe(3);
        });
    });
});