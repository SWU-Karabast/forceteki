describe('Nute Gunray, Vindictive Viceroy', function () {
    integration(function (contextRef) {
        describe('Nute Gunray\'s leader undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        leader: 'nute-gunray#vindictive-viceroy',
                        resources: 4,
                    },
                    player2: {
                        hand: ['admiral-yularen#advising-caution', 'superlaser-blast'],
                    },
                });
            });

            it('should create a battledroid token if two or more friendly units defeated this phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // Defeat units
                context.player2.clickCard(context.superlaserBlast);

                // create a battledroid token
                context.player1.clickCard(context.nuteGunray);
                const battleDroid = context.player1.findCardsByName('battle-droid');
                expect(battleDroid.length).toBe(1);
                expect(battleDroid[0]).toBeInZone('groundArena');
            });
        });

        describe('Nute Gunray\'s leader undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'nute-gunray#vindictive-viceroy', deployed: true },
                    },
                    player2: {
                        groundArena: ['admiral-yularen#advising-caution'],
                    },
                });
            });

            it('should create a battledroid token on attack', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.nuteGunray);
                context.player1.clickCard(context.admiralYularen);
                const battleDroid = context.player1.findCardsByName('battle-droid');
                expect(battleDroid.length).toBe(1);
                expect(battleDroid[0]).toBeInZone('groundArena');
            });
        });
    });
});
