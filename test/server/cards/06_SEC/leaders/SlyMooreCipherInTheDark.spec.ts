describe('Sly Moore, Cipher in the Dark', function() {
    integration(function(contextRef) {
        describe('Sly Moore\'s undeployed ability', function() {
            it('if there are 4 or more exhausted units in play, exhausts self, pays 1, and creates a Spy token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sly-moore#cipher-in-the-dark',
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }, { card: 'pyke-sentinel', exhausted: true }],
                        resources: 3
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }, { card: 'consular-security-force', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.slyMoore);

                // Verify a Spy token was created, leader exhausted, and 1 resource paid
                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(1);
                expect(spies).toAllBeInZone('groundArena');
                expect(spies[0].exhausted).toBeTrue();
                expect(context.slyMoore.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('if there are not 4 or more exhausted units in play, exhausts self, pays 1, and does not create tokens', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sly-moore#cipher-in-the-dark',
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }, { card: 'pyke-sentinel', exhausted: true }],
                        resources: 3
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', exhausted: true }, 'consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.slyMoore);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                // Verify a Spy token was created, leader exhausted, and 1 resource paid
                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(0);
                expect(context.slyMoore.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Sly Moore\'s deployed ability', function() {
            it('optionally deals 2 damage to an exhausted unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'sly-moore#cipher-in-the-dark', deployed: true },
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }, 'wampa']
                    }
                });

                const { context } = contextRef;

                // Attack with Sly Moore and trigger the optional ability to deal 2 damage to an exhausted unit
                context.player1.clickCard(context.slyMoore);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.slyMoore, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
