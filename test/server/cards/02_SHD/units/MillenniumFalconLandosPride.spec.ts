describe('Millennium Falcon, Landos Pride', function() {
    integration(function(contextRef) {
        it('Millennium Falcon\'s constant ability should give it Ambush if it is played from hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['millennium-falcon#landos-pride', 'palpatines-return'],
                    resources: 30
                },
                player2: {
                    spaceArena: ['survivors-gauntlet', 'ruthless-raider']
                }
            });

            const { context } = contextRef;

            // CASE 1: Falcon gets Ambush when played from hand
            context.player1.clickCard(context.millenniumFalcon);
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Ambush');

            context.player1.clickCard(context.survivorsGauntlet);
            expect(context.survivorsGauntlet.damage).toBe(5);
            expect(context.millenniumFalcon.damage).toBe(4);

            // CASE 2: same copy of Falcon has lost its Ambush if played from discard
            context.player2.clickCard(context.survivorsGauntlet);
            context.player2.clickCard(context.millenniumFalcon);

            context.player1.clickCard(context.palpatinesReturn);
            context.player1.clickCard(context.millenniumFalcon);
            expect(context.millenniumFalcon).toBeInZone('spaceArena');
            expect(context.player2).toBeActivePlayer();
        });

        it('Millennium Falcon\'s constant ability should not give it Ambush if it is Smuggled', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    leader: 'jyn-erso#resisting-oppression',
                    resources: ['millennium-falcon#landos-pride', 'atst', 'atst', 'atst', 'atst', 'atst']
                },
                player2: {
                    spaceArena: ['survivors-gauntlet', 'ruthless-raider']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.millenniumFalcon);
            expect(context.millenniumFalcon).toBeInZone('spaceArena');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
