describe('Do or Do Not', function() {
    integration(function(contextRef) {
        describe('Do or Do Not\'s ability', function() {
            it('should draw 2 cards if the Force is used', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['do-or-do-not'],
                        deck: ['wampa', 'battlefield-marine', 'restored-arc170'],
                        hasForceToken: true
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doOrDoNot);
                expect(context.player1).toHavePassAbilityPrompt('Use the Force. If you do, draw 2 cards. If you do not, draw 1 card');

                context.player1.clickPrompt('Trigger');
                expect(context.player1.handSize).toBe(2);
                expect(context.wampa).toBeInZone('hand');
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.restoredArc170).toBeInZone('deck');
            });

            it('should draw 1 card if the Force is not used', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['do-or-do-not'],
                        deck: ['wampa', 'battlefield-marine', 'restored-arc170'],
                        hasForceToken: true
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doOrDoNot);
                expect(context.player1).toHavePassAbilityPrompt('Use the Force. If you do, draw 2 cards. If you do not, draw 1 card');

                context.player1.clickPrompt('Pass');
                expect(context.player1.handSize).toBe(1);
                expect(context.wampa).toBeInZone('hand');
                expect(context.battlefieldMarine).toBeInZone('deck');
                expect(context.restoredArc170).toBeInZone('deck');
            });

            it('should draw 1 card if the Force is not with you', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['do-or-do-not'],
                        deck: ['wampa', 'battlefield-marine', 'restored-arc170'],
                        hasForceToken: false
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doOrDoNot);

                expect(context.player1.handSize).toBe(1);
                expect(context.wampa).toBeInZone('hand');
                expect(context.battlefieldMarine).toBeInZone('deck');
                expect(context.restoredArc170).toBeInZone('deck');
            });

            it('should damage the base if used with an empty deck without the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['do-or-do-not'],
                        deck: [],
                        hasForceToken: false
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doOrDoNot);

                expect(context.player1.handSize).toBe(0);
                expect(context.p1Base.damage).toBe(3);
            });

            it('should damage the base if used with an empty deck with the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['do-or-do-not'],
                        deck: [],
                        hasForceToken: true
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.doOrDoNot);
                expect(context.player1).toHavePassAbilityPrompt('Use the Force. If you do, draw 2 cards. If you do not, draw 1 card');

                context.player1.clickPrompt('Trigger');
                expect(context.player1.handSize).toBe(0);
                expect(context.p1Base.damage).toBe(6);
            });
        });
    });
});
