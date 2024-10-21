describe('Count Dooku, Darth Tyranus', function () {
    integration(function (contextRef) {
        describe('Count Dooku\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['count-dooku#darth-tyranus'],
                        groundArena: ['21b-surgical-droid']
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine', { card: 'atst', damage: 5 }, { card: 'echo-base-defender', upgrades: ['entrenched'] }],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should defeat a unit with 4 or less remaining HP', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.countDooku);

                // also shield
                context.player1.clickPrompt('Defeat a unit with 4 or less remaining HP');
                expect(context.player1).toBeAbleToSelectExactly([context._21bSurgicalDroid, context.greenSquadronAwing, context.battlefieldMarine, context.countDooku, context.atst]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.battlefieldMarine);

                // only battlefield marine defeated
                expect(context.battlefieldMarine).toBeInLocation('discard');
                expect(context._21bSurgicalDroid).toBeInLocation('ground arena');
                expect(context.greenSquadronAwing).toBeInLocation('space arena');
                expect(context.atst).toBeInLocation('ground arena');
                expect(context.echoBaseDefender).toBeInLocation('ground arena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
