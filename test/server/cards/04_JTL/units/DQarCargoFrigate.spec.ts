describe('D\'Qar Cargo Frigate', function () {
    integration(function (contextRef) {
        it('D\'Qar Cargo Frigate\'s ability should give this unit gets -1/-0 for each damage on it', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    spaceArena: ['dqar-cargo-frigate']
                },
                player2: {
                    spaceArena: ['fetts-firespray#pursuing-the-bounty']
                }
            });

            const { context } = contextRef;

            expect(context.dqarCargoFrigate.damage).toBe(0);
            expect(context.dqarCargoFrigate.getPower()).toBe(6);

            context.player1.clickCard(context.dqarCargoFrigate);
            context.player1.clickCard(context.fettsFirespray);

            expect(context.player2).toBeActivePlayer();
            expect(context.fettsFirespray).toBeInZone('discard');
            expect(context.dqarCargoFrigate.damage).toBe(5);
            expect(context.dqarCargoFrigate.getPower()).toBe(1);
        });
    });
});
