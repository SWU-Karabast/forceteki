describe('T6 Shuttle 1974 Stay Close', function () {
    integration(function (contextRef) {
        it('T6 Shuttle 1974\'s ability should give an experience token to itself when T6 Shuttle 1974 is attacked', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['t6-shuttle-1974#stay-close'],
                    groundArena: ['swoop-racer']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['republic-ywing', 'hwk290-freighter']
                },
            });
            const { context } = contextRef;

            // attack something else, nothing happen
            context.player1.clickCard(context.swoopRacer);
            context.player1.clickCard(context.p2Base);

            // enemy attack something else, nothing happen
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.p1Base);
            context.player1.passAction();

            // unit attacks T6 Shuttle 1974, should trigger ability
            context.player2.clickCard(context.hwk290Freighter);
            context.player2.clickCard(context.t6Shuttle1974StayClose);
            expect(context.player1).toHavePassAbilityPrompt('Give an experience token to this unit');

            // use the ability to give experience to itself
            context.player1.clickPrompt('Trigger');
            expect(context.t6Shuttle1974StayClose.damage).toBe(2);
            expect(context.t6Shuttle1974StayClose).toHaveExactUpgradeNames(['experience']);
            expect(context.hwk290Freighter.damage).toBe(4);
            context.player1.passAction();

            // unit attacks T6 Shuttle 1974 again, should trigger ability again
            context.player2.clickCard(context.republicYwing);
            context.player2.clickCard(context.t6Shuttle1974StayClose);
            expect(context.player1).toHavePassAbilityPrompt('Give an experience token to this unit');

            // pass on using the ability this time
            context.player1.clickPrompt('Pass');
            expect(context.t6Shuttle1974StayClose.damage).toBe(3);
            expect(context.t6Shuttle1974StayClose).toHaveExactUpgradeNames(['experience']);
            expect(context.republicYwing.zoneName).toBe('discard');

            // attack with t6 shuttle 1974, nothing should happen
            context.player1.clickCard(context.t6Shuttle1974StayClose);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });
    });
});