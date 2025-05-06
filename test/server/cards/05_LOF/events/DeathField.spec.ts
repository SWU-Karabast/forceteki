describe('Death Field', function() {
    integration(function(contextRef) {
        describe('Death Field\'s ability', function() {
            it('deals 2 damage to each enemy non-Vehicle units and draw a card if you control a force unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-field'],
                        groundArena: ['knight-of-the-republic'],
                        deck: ['porg'],
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine', 'atst'],
                        spaceArena: ['cartel-spacer'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.deathField);

                expect(context.wampa.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.knightOfTheRepublic.damage).toBe(0);
                expect(context.porg).toBeInZone('hand', context.player1);
                expect(context.player1.handSize).toBe(1);
            });

            it('deals 2 damage to each enemy non-Vehicle units and not draw a card if you do not control a force unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-field'],
                        groundArena: ['porg'],
                        deck: ['knight-of-the-republic'],
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine', 'atst'],
                        spaceArena: ['cartel-spacer'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.deathField);

                expect(context.wampa.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.porg.damage).toBe(0);
                expect(context.knightOfTheRepublic).toBeInZone('deck', context.player1);
                expect(context.player1.handSize).toBe(0);
            });

            it('can be used to draw a card if the opponent has no non-Vehicle units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-field'],
                        groundArena: ['knight-of-the-republic'],
                        deck: ['porg'],
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['cartel-spacer'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.deathField);

                expect(context.atst.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.knightOfTheRepublic.damage).toBe(0);
                expect(context.porg).toBeInZone('hand', context.player1);
                expect(context.player1.handSize).toBe(1);
            });
        });
    });
});
