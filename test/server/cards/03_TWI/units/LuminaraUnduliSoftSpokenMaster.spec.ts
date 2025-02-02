describe('Luminara Unduli, Soft Spoken Master', function() {
    integration(function(contextRef) {
        it('Luminara Unduli\'s ability should heal a base equal to the number of units you control and coordinate ability should give grit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['luminara-unduli#softspoken-master'],
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing'],
                    base: { card: 'echo-base', damage: 5 }
                },
                player2: {
                    hand: ['rivals-fall'],
                    base: { card: 'jabbas-palace', damage: 10 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.luminaraUnduli);
            // should choose between both base
            expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
            context.player1.clickCard(context.p1Base);
            // should heal 3
            expect(context.p1Base.damage).toBe(2);

            context.setDamage(context.p1Base, 0);
            context.setDamage(context.p2Base, 0);
            context.setDamage(context.luminaraUnduli, 4);

            context.luminaraUnduli.exhausted = false;
            context.player2.passAction();

            context.player1.clickCard(context.luminaraUnduli);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();
            // should have grit
            expect(context.p2Base.damage).toBe(8);

            context.setDamage(context.p2Base, 0);
            context.luminaraUnduli.exhausted = false;
            // kill a unit, coordinate off
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.wampa);

            context.player1.clickCard(context.luminaraUnduli);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);
        });
    });
});
