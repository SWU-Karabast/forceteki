describe('Lando Calrissian With Impeccable Taste', function () {
    integration(function (contextRef) {
        it('Lando Calrissian\'s undeployed ability plays card and defeats resource', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'lando-calrissian#with-impeccable-taste',
                    hand: ['pyke-sentinel', 'wampa'],
                    resources: ['zorii-bliss#valiant-smuggler', 'aggression', 'spark-of-rebellion', 'protector', 'hotshot-dl44-blaster'],
                    deck: ['liberated-slaves'],
                    groundArena: ['boba-fett#disintegrator']
                }
            });

            const { context } = contextRef;

            // Activate Lando ability
            context.player1.clickCard(context.landoCalrissian);
            context.player1.clickPrompt('Play a card using Smuggle. It costs 2 less. Defeat a resource you own and control.');
            expect(context.player1).toBeAbleToSelectExactly([context.zoriiBliss, context.hotshotDl44Blaster]);

            // Play hot shot blaster
            context.player1.clickCard(context.hotshotDl44Blaster);
            context.player1.clickCard(context.bobaFett);

            expect(context.landoCalrissian.exhausted).toBe(true);
            expect(context.liberatedSlaves).toBeInZone('resource');

            // Proceeds to defeat resource
            expect(context.player1).toHavePrompt('Defeat a resource you own and control');
            expect(context.player1).toBeAbleToSelectExactly([context.aggression, context.protector, context.sparkOfRebellion, context.zoriiBliss, context.liberatedSlaves]);

            // Defeat a resource
            context.player1.clickCard(context.aggression);
            expect(context.player1.readyResourceCount).toBe(4);
            expect(context.aggression).toBeInZone('discard');

            // Blaster attack is after resource was defeated
            context.player1.clickCard(context.p2Base);
        });

        it('Lando Calrissian\'s deployed ability plays card and defeats resource', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'lando-calrissian#with-impeccable-taste', deployed: true },
                    hand: ['pyke-sentinel', 'wampa'],
                    resources: ['zorii-bliss#valiant-smuggler', 'aggression', 'spark-of-rebellion', 'protector', 'dj#blatant-thief'],
                    deck: ['liberated-slaves'],
                    groundArena: ['boba-fett#disintegrator'],
                    base: 'administrators-tower'
                },
                player2: {
                    resources: ['resupply'],
                }
            });

            const { context } = contextRef;

            // Activate Lando ability
            context.player1.clickCard(context.landoCalrissian);
            context.player1.clickPrompt('Play a card using Smuggle. It costs 2 less. Defeat a resource you own and control. Use this ability only once each round');
            expect(context.player1).toBeAbleToSelectExactly([context.zoriiBliss, context.dj]);

            // Play DJ
            context.player1.clickCard(context.dj);
            expect(context.liberatedSlaves).toBeInZone('resource');

            // Stolen resource is not available to defeat
            expect(context.player1).toHavePrompt('Defeat a resource you own and control');
            expect(context.player1).toBeAbleToSelectExactly([context.aggression, context.protector, context.sparkOfRebellion, context.zoriiBliss, context.liberatedSlaves]);

            // Defeat card that was resourced after smuggle
            context.player1.clickCard(context.liberatedSlaves);
            expect(context.liberatedSlaves).toBeInZone('discard');
            expect(context.player1.readyResourceCount).toBe(1);
        });

        it('Lando Calrissian\'s deployed ability as a soft pass', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'lando-calrissian#with-impeccable-taste', deployed: true },
                    hand: ['pyke-sentinel', 'wampa'],
                    resources: ['zorii-bliss#valiant-smuggler', 'aggression', 'spark-of-rebellion', 'protector', 'dj#blatant-thief'],
                    deck: ['liberated-slaves'],
                    groundArena: ['boba-fett#disintegrator'],
                    base: 'administrators-tower'
                },
                player2: {
                    resources: ['resupply'],
                }
            });

            const { context } = contextRef;

            // Activate Lando ability
            context.player1.clickCard(context.landoCalrissian);
            context.player1.clickPrompt('Play a card using Smuggle. It costs 2 less. Defeat a resource you own and control. Use this ability only once each round');
            expect(context.player1).toBeAbleToSelectExactly([context.zoriiBliss, context.dj]);

            // Choose to not play a card
            context.player1.clickPrompt('Choose no target');

            // Still requires to defeat a resource
            expect(context.player1).toHavePrompt('Defeat a resource you own and control');
            expect(context.player1).toBeAbleToSelectExactly([context.aggression, context.protector, context.sparkOfRebellion, context.zoriiBliss, context.dj]);
            context.player1.clickCard(context.protector);
            expect(context.protector).toBeInZone('discard');
            expect(context.player1.readyResourceCount).toBe(4);
        });
    });
});