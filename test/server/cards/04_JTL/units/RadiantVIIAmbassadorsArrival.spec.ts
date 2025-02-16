describe('Radiant VII, Ambassadors\' Arrival', function () {
    integration(function (contextRef) {
        it('Radiant VII\'s ability should deal 5 indirect damage to a player when played', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['radiant-vii#ambassadors-arrival']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.radiantVii);
            context.player1.clickPrompt('Opponent');
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.p2Base, 5],
            ]));
            expect(context.p2Base.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('Radiant VII\'s ability should give -1/-0 per damage to all enemy non-leader unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    spaceArena: ['radiant-vii#ambassadors-arrival'],
                    groundArena: [{ card: 'crafty-smuggler', damage: 1 }]
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', damage: 2 }],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', damage: 3, deployed: true }
                }
            });

            const { context } = contextRef;

            expect(context.radiantVii.getPower()).toBe(5);
            expect(context.radiantVii.getHp()).toBe(6);

            expect(context.craftySmuggler.getPower()).toBe(2);
            expect(context.craftySmuggler.getHp()).toBe(2);

            expect(context.battlefieldMarine.getPower()).toBe(1);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            expect(context.sabineWren.getPower()).toBe(2);
            expect(context.sabineWren.getHp()).toBe(5);
        });
    });
});
