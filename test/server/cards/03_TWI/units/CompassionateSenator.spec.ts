describe('Compassionate Senator', function () {
    integration(function (contextRef) {
        describe('Compassionate Senator\'s ability', function () {
            it('should heal 2 damage from a unit or a base', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'compassionate-senator', damage: 3 }],
                        spaceArena: [{ card: 'green-squadron-awing', damage: 2 }],
                        base: { card: 'echo-base', damage: 3 }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 3 }, 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.compassionateSenator);
                context.player1.clickPrompt('Heal 2 damage from a unit or base');

                // can choose any units or base
                expect(context.player1).toBeAbleToSelectExactly([context.compassionateSenator, context.greenSquadronAwing, context.echoBase, context.wampa, context.atst, context.p1Base, context.p2Base]);

                // heal base
                context.player1.clickCard(context.p1Base);

                expect(context.compassionateSenator.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.p1Base.damage).toBe(1);
            });
        });
    });
});
