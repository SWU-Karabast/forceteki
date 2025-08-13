describe('Anakin Skywalker, Secret Husband', function() {
    integration(function(contextRef) {
        it('Anakin Skywalker\'s ability should gain Raid 2 while controlling Padmé Amidala as unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['anakin-skywalker#secret-husband', 'padme-amidala#pursuing-peace']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.anakinSkywalker);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
        });

        it('Anakin Skywalker\'s ability should gain Raid 2 while controlling Padmé Amidala as leader', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'padme-amidala#serving-the-republic',
                    groundArena: ['anakin-skywalker#secret-husband']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.anakinSkywalker);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
        });

        it('Anakin Skywalker\'s ability should not have Raid when not controlling Padmé Amidala', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['anakin-skywalker#secret-husband']
                },
                player2: {
                    groundArena: ['padme-amidala#pursuing-peace']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.anakinSkywalker);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
        });
    });
});