describe('Punishing One, Takes No Prisoners', function() {
    integration(function(contextRef) {
        it('Punishing One\'s when played ability should optionally deal 1 damage to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['punishing-one#takes-no-prisoners'],
                    spaceArena: ['system-patrol-craft']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.punishingOne);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.punishingOne, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();

            // Choose a target to deal 1 damage
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(1);
        });

        it('Punishing One\'s on attack should optionally deal 1 damage to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['system-patrol-craft', 'punishing-one#takes-no-prisoners']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.punishingOne);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.systemPatrolCraft, context.punishingOne, context.wampa, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(1);
        });

        it('Punishing One\'s should gain Raid 1 for each damaged enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'system-patrol-craft', damage: 1 }, { card: 'punishing-one#takes-no-prisoners', damage: 1 }]
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: [{ card: 'green-squadron-awing', damage: 1 }]
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.punishingOne);
            context.player1.clickCard(context.p2Base);

            // 1 damage from on attack ability
            context.player1.clickCard(context.wampa);

            expect(context.p2Base.damage).toBe(5); // 3 + raid 2
        });

        it('Punishing One\'s should gain Raid 1 for each damaged enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'punishing-one#takes-no-prisoners', damage: 1 }]
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: [{ card: 'green-squadron-awing', damage: 1 }]
                }
            });
            const { context } = contextRef;

            // attack with punishing one, 1 enemy unit are damaged, should have raid 1
            context.player1.clickCard(context.punishingOne);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Pass');

            expect(context.p2Base.damage).toBe(4);

            // reset
            context.readyCard(context.punishingOne);
            context.setDamage(context.p2Base, 0);

            // attack with wampa, it will be damaged
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.battlefieldMarine);

            // attack again with punishing one, 2 enemy units are damaged now, should have raid 2
            context.player1.clickCard(context.punishingOne);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Pass');

            expect(context.p2Base.damage).toBe(5);
        });

        it('Punishing One\'s should gain Raid 1 for each damaged enemy unit (with Marchion Ro)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['marchion-ro#eye-of-the-nihil'],
                    spaceArena: ['punishing-one#takes-no-prisoners']
                },
                player2: {
                    groundArena: [{ card: 'wampa', damage: 1 }],
                    spaceArena: [{ card: 'green-squadron-awing', damage: 1 }]
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.punishingOne);
            context.player1.clickCard(context.p2Base);

            // 1 damage from on attack ability
            context.player1.clickCard(context.wampa);

            expect(context.p2Base.damage).toBe(7); // 3 + raid 4
        });
    });
});
