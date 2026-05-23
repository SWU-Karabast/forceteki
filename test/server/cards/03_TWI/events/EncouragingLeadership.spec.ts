describe('Encouraging Leadership', function () {
    integration(function (contextRef) {
        it('should give +1/+1 for this phase to allies when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'encouraging-leadership'],
                    spaceArena: ['green-squadron-awing', 'imperial-interceptor'],
                    groundArena: ['atst']
                },
                player2: {
                    spaceArena: ['star-wing-scout'],
                    groundArena: ['specforce-soldier'],
                    hand: ['waylay']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.encouragingLeadership);

            // Check if effect is applied to allies
            expect(context.atst.getPower()).toEqual(7);
            expect(context.atst.getHp()).toEqual(8);
            expect(context.greenSquadronAwing.getPower()).toEqual(2);
            expect(context.greenSquadronAwing.getHp()).toEqual(4);
            expect(context.imperialInterceptor.getPower()).toEqual(4);
            expect(context.imperialInterceptor.getHp()).toEqual(3);

            // Check if effect is not applied to non-allies
            expect(context.starWingScout.getPower()).toEqual(4);
            expect(context.starWingScout.getHp()).toEqual(1);
            expect(context.specforceSoldier.getPower()).toEqual(2);
            expect(context.specforceSoldier.getHp()).toEqual(2);

            // Check that a unit with the buff can be defeated without causing any errors
            context.player2.passAction();
            context.player1.clickCard(context.imperialInterceptor);
            context.player1.clickCard(context.starWingScout);

            context.player2.passAction();

            // Check if effect is not applied to card played after the Encouraging Leadership
            context.player1.clickCard(context.wampa);
            expect(context.wampa.getPower()).toEqual(4);
            expect(context.wampa.getHp()).toEqual(5);

            // Waylay unit and replay it to confirm that the effect falls off
            context.player2.clickCard(context.waylay);
            context.player2.clickCard(context.greenSquadronAwing);

            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing.getPower()).toEqual(1);
            expect(context.greenSquadronAwing.getHp()).toEqual(3);

            // Pass the phase
            context.moveToRegroupPhase();

            // Check if units power/hp is back to normal
            expect(context.atst.getPower()).toEqual(6);
            expect(context.atst.getHp()).toEqual(7);
        });
    });
});