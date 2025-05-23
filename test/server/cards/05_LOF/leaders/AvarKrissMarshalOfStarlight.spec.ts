
describe('Avar Kriss, Marshal of Starlight', function() {
    integration(function (contextRef) {
        describe('Avar Kriss\'s Leader side ability', function () {
            it('should give the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'avar-kriss#marshal-of-starlight',
                        resources: 5
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.avarKriss);
                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player2.hasTheForce).toBe(false);
                expect(context.avarKriss.exhausted).toBe(true);
            });

            it('should be triggerable even if the player already has the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'avar-kriss#marshal-of-starlight',
                        resources: 5,
                        hasForceToken: true
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.avarKriss);
                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player2.hasTheForce).toBe(false);
                expect(context.avarKriss.exhausted).toBe(true);

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Avar Kriss\'s deploy epic action should work when the player controls 9 resources', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'avar-kriss#marshal-of-starlight',
                    resources: 9
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.avarKriss);

            expect(context.player1).toHaveExactPromptButtons([
                'The Force is with you',
                'Deploy Avar Kriss',
                'Cancel'
            ]);

            context.player1.clickPrompt('Deploy Avar Kriss');

            expect(context.avarKriss.deployed).toBe(true);
            expect(context.avarKriss).toBeInZone('groundArena');
        });

        describe('Avar Kriss\'s deploy epic action', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'avar-kriss#marshal-of-starlight',
                        hand: ['cure-wounds', 'infused-brawler'],
                        groundArena: ['eeth-koth#spiritual-warrior'],
                        base: 'mystic-monastery',
                        hasForceToken: true,
                        resources: 7
                    },
                    player2: {
                        hasForceToken: true,
                        hand: ['vernestra-rwoh#precocious-knight', 'vanquish']
                    }
                });
            });

            it('should work when the player controls less than 9 resources but has used the Force enough times to reach a sum of 9', function () {
                const { context } = contextRef;

                // use the Force - sum is 8
                context.player1.clickCard(context.cureWounds);
                context.player2.passAction();

                // gain the Force
                context.player1.clickCard(context.avarKriss);
                expect(context.player1.hasTheForce).toBe(true);
                context.player2.passAction();

                // use the Force again - sum is 9
                context.player1.clickCard(context.infusedBrawler);
                context.player1.clickPrompt('Trigger');
                context.player2.passAction();

                // Avar can deploy
                context.player1.clickCard(context.avarKriss);
                context.player1.clickPrompt('Deploy Avar Kriss');

                expect(context.avarKriss.deployed).toBe(true);
                expect(context.avarKriss).toBeInZone('groundArena');
            });

            it('should not count an opponent\'s uses of the Force', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.cureWounds);
                context.player2.passAction();

                // use Avar's ability so she has no action available later
                context.player1.clickCard(context.avarKriss);
                expect(context.player1.hasTheForce).toBe(true);

                context.player2.clickCard(context.vernestraRwoh);
                context.player2.clickPrompt('Trigger');

                expect(context.player1).not.toBeAbleToSelect(context.avarKriss);
                expect(context.avarKriss).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should work when the sum is greater than 9', function () {
                const { context } = contextRef;

                // use the Force - sum is 8
                context.player1.clickCard(context.cureWounds);
                context.player2.passAction();

                // gain the Force
                context.player1.clickCard(context.avarKriss);
                expect(context.player1.hasTheForce).toBe(true);
                context.player2.passAction();

                // use the Force again - sum is 9
                context.player1.clickCard(context.infusedBrawler);
                context.player1.clickPrompt('Trigger');
                context.player2.passAction();

                // gain the Force
                context.player1.clickCard(context.mysticMonastery);

                // use the Force again - sum is 10
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.eethKoth);
                context.player1.clickPrompt('Trigger');

                // Avar can deploy
                context.player1.clickCard(context.avarKriss);
                context.player1.clickPrompt('Deploy Avar Kriss');

                expect(context.avarKriss.deployed).toBe(true);
                expect(context.avarKriss).toBeInZone('groundArena');
            });
        });

        describe('Avar Kriss\'s deployed constant ability', function () {
            it('should give her +0/+4 and Overwhelm when the player has the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'avar-kriss#marshal-of-starlight', deployed: true },
                        hasForceToken: true
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                expect(context.avarKriss.getPower()).toBe(8);

                context.player1.clickCard(context.avarKriss);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.p2Base.damage).toBe(5);
            });

            it('should do nothing when the player does not have the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'avar-kriss#marshal-of-starlight', deployed: true }
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                expect(context.avarKriss.getPower()).toBe(4);

                context.player1.clickCard(context.avarKriss);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.p2Base.damage).toBe(0);
            });

            it('should work when the Force is gained and lost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'avar-kriss#marshal-of-starlight', deployed: true },
                        base: 'mystic-monastery',
                        hand: ['cure-wounds']
                    }
                });

                const { context } = contextRef;

                expect(context.avarKriss.getPower()).toBe(4);

                context.player1.clickCard(context.mysticMonastery);
                expect(context.avarKriss.getPower()).toBe(8);

                context.player2.passAction();
                context.player1.clickCard(context.cureWounds);

                expect(context.avarKriss.getPower()).toBe(4);
            });
        });
    });
});
