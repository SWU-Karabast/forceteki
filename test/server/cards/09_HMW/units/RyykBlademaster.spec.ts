describe('Ryyk Bladmaster', function() {
    integration(function(contextRef) {
        it('should not have Ambush and Overwhelm if you have fewer than 6 resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ryyk-blademaster'],
                    base: 'echo-base',
                    leader: 'luke-skywalker#faithful-friend',
                    resources: 5
                },
                player2: {
                    groundArena: ['porg'],
                    resources: 6
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ryykBlademaster);

            expect(context.ryykBlademaster.hasSomeKeyword('ambush')).toBeFalse();
            expect(context.ryykBlademaster.hasSomeKeyword('overwhelm')).toBeFalse();

            expect(context.player2).toBeActivePlayer();
        });

        it('should have Ambush and Overwhelm if you have exactly 6 resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ryyk-blademaster'],
                    base: 'echo-base',
                    resources: 6
                },
                player2: {
                    groundArena: ['porg'],
                    resources: 5
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ryykBlademaster);

            expect(context.ryykBlademaster.hasSomeKeyword('ambush')).toBeTrue();
            expect(context.ryykBlademaster.hasSomeKeyword('overwhelm')).toBeTrue();

            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.porg);

            expect(context.ryykBlademaster.damage).toBe(1);
            expect(context.p2Base.damage).toBe(4);
            expect(context.porg).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });

        it('should have Ambush and Overwhelm if you have more than 6 resources', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ryyk-blademaster'],
                    base: 'echo-base',
                    resources: 7
                },
                player2: {
                    groundArena: ['porg'],
                    resources: 5
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ryykBlademaster);

            expect(context.ryykBlademaster.hasSomeKeyword('ambush')).toBeTrue();
            expect(context.ryykBlademaster.hasSomeKeyword('overwhelm')).toBeTrue();

            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.porg);

            expect(context.ryykBlademaster.damage).toBe(1);
            expect(context.p2Base.damage).toBe(4);
            expect(context.porg).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });
    });
});