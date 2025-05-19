describe('Adi Gallia, Stern and Focused', function () {
    integration(function (contextRef) {
        it('Adi Gallia\'s ability should deal 1 damage to the opponent\'s base when they play an event card',
            async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'daring-raid', 'protector'],
                    },
                    player2: {
                        hand: ['moment-of-peace'],
                        groundArena: ['adi-gallia#stern-and-focused'],
                    }
                });

                const { context } = contextRef;

                // opponent play an event, adi gallia should deal 1 to his base
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(1);

                // we play an event, nothing should happen
                context.player2.clickCard(context.momentOfPeace);
                context.player2.clickCard(context.adiGallia);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(1);

                // opponent play a unit, nothing should happen
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(1);

                context.player2.passAction();

                // opponent play an upgrade, nothing should happen
                context.player1.clickCard(context.protector);
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(1);
            });
    });
});