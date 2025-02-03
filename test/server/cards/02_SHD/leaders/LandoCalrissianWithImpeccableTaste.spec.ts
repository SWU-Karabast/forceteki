describe('Lando Calrissian With Impeccable Taste', function () {
    integration(function (contextRef) {
        it('Lando Calrissian\'s undeployed ability', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    leader: { card: 'lando-calrissian#with-impeccable-taste' },
                    hand: ['pyke-sentinel', 'wampa'],
                    resources: ['zorii-bliss#valiant-smuggler', 'aggression', 'spark-of-rebellion', 'protector', 'hotshot-dl44-blaster'],
                    deck: ['liberated-slaves'],
                    groundArena: ['boba-fett#disintegrator']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.landoCalrissian);
            context.player1.clickPrompt('Play a card using Smuggle. It costs 2 less. Defeat a resource you own and control.');
            expect(context.player1).toBeAbleToSelectExactly([context.zoriiBliss, context.hotshotDl44Blaster]);
            context.player1.clickCard(context.hotshotDl44Blaster);
            context.player1.clickCard(context.bobaFett);
            expect(context.liberatedSlaves).toBeInZone('resource');
            expect(context.player1).toHavePrompt('Defeat a resource you own and control');
            expect(context.player1).toBeAbleToSelectExactly([context.aggression, context.protector, context.sparkOfRebellion, context.zoriiBliss, context.liberatedSlaves]);
            context.player1.clickCard(context.liberatedSlaves);
            expect(context.player1.readyResourceCount).toBe(4);
            context.player1.clickCard(context.p2Base);
        });

        it('Lando Calrissian\'s undeployed ability', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    leader: { card: 'lando-calrissian#with-impeccable-taste', deployed: true },
                    hand: ['pyke-sentinel', 'wampa'],
                    resources: ['zorii-bliss#valiant-smuggler', 'aggression', 'spark-of-rebellion', 'protector', 'hotshot-dl44-blaster'],
                    deck: ['liberated-slaves'],
                    groundArena: ['boba-fett#disintegrator']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.landoCalrissian);
            context.player1.clickPrompt('Play a card using Smuggle. It costs 2 less. Defeat a resource you own and control. Use this ability only once each round');
            expect(context.player1).toBeAbleToSelectExactly([context.zoriiBliss, context.hotshotDl44Blaster]);
            context.player1.clickCard(context.zoriiBliss);
            expect(context.liberatedSlaves).toBeInZone('resource');
            expect(context.player1).toHavePrompt('Defeat a resource you own and control');
            expect(context.player1).toBeAbleToSelectExactly([context.aggression, context.protector, context.sparkOfRebellion, context.hotshotDl44Blaster, context.liberatedSlaves]);
            context.player1.clickCard(context.liberatedSlaves);
            expect(context.player1.readyResourceCount).toBe(1);
        });
    });
});