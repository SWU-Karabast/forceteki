describe('8D8, Daimyo\'s Majordomo', function() {
    integration(function(contextRef) {
        const prompt = 'Deal 1 damage to another friendly unit. If you do, search the top 5 cards of your deck for a unit, reveal it, and draw it.';
        describe('8D8\'s action ability', function() {
            it('should deal 1 damage to another friendly unit and search deck for a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['8d8#daimyos-majordomo', 'wampa'],
                        spaceArena: ['phoenix-squadron-awing'],
                        deck: ['porg', 'battlefield-marine', 'takedown', 'awing', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context._8d8);
                expect(context.player1).toHaveExactPromptButtons([prompt, 'Attack', 'Cancel']);
                context.player1.clickPrompt(prompt);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.phoenixSquadronAwing]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.porg, context.battlefieldMarine, context.awing, context.yoda],
                    invalid: [context.takedown]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.porg);

                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.porg]);
                context.player2.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.porg).toBeInZone('hand', context.player1);
                expect(context.wampa.damage).toBe(1);
                expect(context._8d8.exhausted).toBeTrue();

                expect([context.battlefieldMarine, context.awing, context.yoda, context.takedown]).toAllBeInBottomOfDeck(context.player1, 4);
            });

            it('should deal 1 damage to another friendly unit and search deck for a unit (damage is replaced by shield)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['8d8#daimyos-majordomo', { card: 'wampa', upgrades: ['shield'] }],
                        spaceArena: ['phoenix-squadron-awing'],
                        deck: ['porg', 'battlefield-marine', 'takedown', 'awing', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context._8d8);
                expect(context.player1).toHaveExactPromptButtons([prompt, 'Attack', 'Cancel']);
                context.player1.clickPrompt(prompt);
                context.player1.clickCard(context.wampa);
                context.player1.clickCardInDisplayCardPrompt(context.porg);
                context.player2.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.porg).toBeInZone('hand', context.player1);
                expect(context.wampa.damage).toBe(0);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context._8d8.exhausted).toBeTrue();

                expect([context.battlefieldMarine, context.awing, context.yoda, context.takedown]).toAllBeInBottomOfDeck(context.player1, 4);
            });

            it('should not search deck for a unit if we cannot deal 1 damage to another friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['8d8#daimyos-majordomo'],
                        deck: ['porg', 'battlefield-marine', 'takedown', 'awing', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context._8d8);
                expect(context.player1).toHaveExactPromptButtons([`(No effect) ${prompt}`, 'Attack', 'Cancel']);
                context.player1.clickPrompt(`(No effect) ${prompt}`);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context._8d8.damage).toBe(0);
                expect(context._8d8.exhausted).toBeTrue();
            });
        });
    });
});
