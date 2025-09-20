describe('Populist Advisor', function () {
    integration(function (contextRef) {
        it('gains Sentinel for this phase after opponent\'s attack deals combat damage to your base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['populist-advisor']
                },
                player2: {
                    groundArena: ['death-star-stormtrooper', 'battlefield-marine'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Let opponent attack our base to trigger Populist Advisor
            context.player2.clickCard(context.deathStarStormtrooper);
            context.player2.clickCard(context.p1Base);

            // Our Populist Advisor should now have Sentinel for the rest of this phase
            // Opponent's next ground attack must target Populist Advisor
            context.player1.passAction();
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.populistAdvisor]);
            context.player2.clickCard(context.populistAdvisor);
            expect(context.populistAdvisor.damage).toBe(3);
        });

        it('gains Sentinel for this phase after Overwhelm damage is dealt to your base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['populist-advisor', 'specforce-soldier']
                },
                player2: {
                    groundArena: ['wampa', 'death-star-stormtrooper'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Opponent attacks our small unit with Wampa (Overwhelm), base should take excess damage
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.specforceSoldier);
            expect(context.p1Base.damage).toBe(2);

            // Now Populist Advisor should have Sentinel this phase
            context.player1.passAction();
            context.player2.clickCard(context.deathStarStormtrooper);
            expect(context.player2).toBeAbleToSelectExactly([context.populistAdvisor]);
            context.player2.clickCard(context.populistAdvisor);
        });

        it('does not trigger when you are the attacker (no Sentinel gained)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['populist-advisor', 'battlefield-marine']
                },
                player2: {
                    groundArena: ['death-star-stormtrooper']
                }
            });

            const { context } = contextRef;

            // We attack their base; our own ability should NOT trigger since the event must be opponent-controlled
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            // Opponent can still attack our base (no Sentinel constraint)
            context.player2.clickCard(context.deathStarStormtrooper);
            // With no Sentinel, they may choose between our unit(s) and our base
            expect(context.player2).toBeAbleToSelectExactly([context.populistAdvisor, context.battlefieldMarine, context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });

        it('Sentinel gained is only for this phase (resets next phase)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['populist-advisor']
                },
                player2: {
                    groundArena: ['death-star-stormtrooper'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // Trigger Sentinel this phase
            context.player2.clickCard(context.deathStarStormtrooper);
            context.player2.clickCard(context.p1Base);

            // Move to next action phase
            context.moveToNextActionPhase();

            // Opponent should NOT be constrained by Sentinel anymore
            context.player2.clickCard(context.deathStarStormtrooper);
            expect(context.player2).toBeAbleToSelectExactly([context.populistAdvisor, context.p1Base]);
            context.player2.clickCard(context.populistAdvisor);
        });
    });
});
