describe('Heroic Purrgil', function() {
    integration(function(contextRef) {
        it('Heroic Purrgil\'s ability should give it +2/+0 while ambushing', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heroic-purrgil'],
                },
                player2: {
                    spaceArena: ['hyperspace-wayfarer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heroicPurrgil);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.hyperspaceWayfarer);

            expect(context.hyperspaceWayfarer.damage).toBe(5);
            expect(context.heroicPurrgil.damage).toBe(4);
            expect(context.heroicPurrgil.getPower()).toBe(3);

            context.player2.passAction();

            context.readyCard(context.heroicPurrgil);
            context.player1.clickCard(context.heroicPurrgil);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('Heroic Purrgil\'s ability should not boost it with a normal attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['heroic-purrgil']
                },
                player2: {
                    spaceArena: ['hyperspace-wayfarer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heroicPurrgil);
            context.player1.clickCard(context.hyperspaceWayfarer);

            expect(context.hyperspaceWayfarer.damage).toBe(3);
            expect(context.heroicPurrgil.damage).toBe(4);
            expect(context.heroicPurrgil.getPower()).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });

        it('Heroic Purrgil\'s ability should not boost other units when they ambush', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['pirate-snub-fighter'],
                    spaceArena: ['heroic-purrgil']
                },
                player2: {
                    spaceArena: ['hyperspace-wayfarer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.pirateSnubFighter);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.hyperspaceWayfarer);

            expect(context.hyperspaceWayfarer.damage).toBe(2);
            expect(context.pirateSnubFighter).toBeInZone('discard', context.player1);

            expect(context.player2).toBeActivePlayer();
        });
    });
});