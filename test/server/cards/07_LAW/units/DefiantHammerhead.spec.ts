describe('Defiant Hammerhead', function () {
    integration(function (contextRef) {
        describe('Defiant Hammerhead\'s ability', function () {
            it('should give it +4/+0 and then defeat it after it completes the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bt1#blastomech', 'battlefield-marine'],
                        spaceArena: ['defiant-hammerhead'],
                        deck: ['daring-raid']
                    },
                    player2: {
                        spaceArena: [{ card: 'graceful-purrgil', upgrades: ['armor-of-fortune', 'legal-authority'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.defiantHammerhead);
                context.player1.clickCard(context.gracefulPurrgil);
                context.player1.clickPrompt('Trigger');

                expect(context.gracefulPurrgil.damage).toBe(10);
                expect(context.defiantHammerhead).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bt1#blastomech', 'battlefield-marine'],
                        spaceArena: ['defiant-hammerhead'],
                        deck: ['daring-raid']
                    },
                    player2: {
                        spaceArena: [{ card: 'graceful-purrgil', upgrades: ['armor-of-fortune', 'legal-authority'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.defiantHammerhead);
                context.player1.clickCard(context.gracefulPurrgil);
                context.player1.clickPrompt('Pass');

                expect(context.gracefulPurrgil.damage).toBe(6);
                expect(context.defiantHammerhead).toBeInZone('spaceArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if not attacking a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bt1#blastomech', 'battlefield-marine'],
                        spaceArena: ['defiant-hammerhead'],
                        deck: ['daring-raid']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.defiantHammerhead);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6);
                expect(context.defiantHammerhead).toBeInZone('spaceArena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});