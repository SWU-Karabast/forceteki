
describe('Temple of Destruction\'s ability', function() {
    integration(function(contextRef) {
        it('should not give the Force when a friendly unit deals less than 3 combat damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'temple-of-destruction',
                    groundArena: ['guardian-of-the-whills']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);

            context.player1.clickCard(context.guardianOfTheWhills);
            context.player1.clickCard(context.p2Base);

            expect(context.player1.hasTheForce).toBe(false);
        });

        it('should not give the Force when an enemy unit deals 3 or more combat damage to a friendly base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'temple-of-destruction'
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);

            context.player1.passAction();

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.p1Base);

            expect(context.player1.hasTheForce).toBe(false);
            expect(context.player2.hasTheForce).toBe(false);
        });

        it('should not give the Force when dealing damage with an event', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'temple-of-destruction',
                    hand: ['for-a-cause-i-believe-in'],
                    deck: [
                        'battlefield-marine',
                        'echo-base-defender',
                        'specforce-soldier',
                        'regional-sympathizers'
                    ]
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);
            context.player1.clickCard(context.forACauseIBelieveIn);
            context.player1.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'discard');
            context.player1.clickDisplayCardPromptButton(context.specforceSoldier.uuid, 'discard');
            context.player1.clickDisplayCardPromptButton(context.echoBaseDefender.uuid, 'discard');
            context.player1.clickDisplayCardPromptButton(context.regionalSympathizers.uuid, 'discard');
            expect(context.player1.hasTheForce).toBe(false);
        });

        it('should give the Force when a friendly unit deals 3 or more combat damage to an enemy base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'temple-of-destruction',
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);

            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2.hasTheForce).toBe(false);
        });

        it('should give the Force when a friendly unit deals 3 or more Overwhelm damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'temple-of-destruction',
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: [{ card: 'moisture-farmer', damage: 3 }]
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.moistureFarmer);

            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2.hasTheForce).toBe(false);
        });


        it('should not give the Force from a non-combat ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'temple-of-destruction',
                    groundArena: ['k2so#cassians-counterpart']
                },
                player2: {
                    hand: ['takedown']
                }
            });

            const { context } = contextRef;

            expect(context.player1.hasTheForce).toBe(false);

            context.player1.passAction();
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.k2soCassiansCounterpart);
            context.player1.clickPrompt('Deal 3 damage to opponent\'s base');

            expect(context.player1).toBeActivePlayer();
            expect(context.player1.hasTheForce).toBe(false);
        });
    });
});
