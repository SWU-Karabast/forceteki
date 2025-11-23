describe('Cost adjustment', function() {
    integration(function (contextRef) {
        describe('Penalty cost adjusters', function () {
            it('should not double-count for two stacked adjusters that ignore all aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'nala-se#clone-engineer',
                        base: 'energy-conversion-lab',
                        hand: ['echo#valiant-arc-trooper'],
                        groundArena: ['omega#part-of-the-squad'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.echo);
                expect(context.echo).toBeInZone('groundArena');
                expect(context.player1.readyResourceCount).toBe(0);
            });

            it('should correctly compute pay cost for two stacked adjusters that ignore all aspect penalties (unit cannot be played)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'nala-se#clone-engineer',
                        base: 'energy-conversion-lab',
                        hand: ['echo#valiant-arc-trooper'],
                        groundArena: ['omega#part-of-the-squad'],
                        resources: 1
                    }
                });

                const { context } = contextRef;

                expect(context.player1).not.toBeAbleToSelect(context.echo);
            });

            it('should correctly compute the cost when an aspect adjuster is combined with other adjusters', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'nala-se#clone-engineer',
                        base: 'administrators-tower',
                        hand: ['clone-commander-cody#commanding-the-212th'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['gnk-power-droid'],
                        resources: 2
                    }
                });

                const { context } = contextRef;

                // attack with GNK to trigger adjustment
                context.player1.clickCard(context.gnkPowerDroid);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.cloneCommanderCody);
                expect(context.cloneCommanderCody).toBeInZone('groundArena');
                expect(context.player1.readyResourceCount).toBe(0);
            });

            it('should correctly compute the cost when an aspect adjuster is combined with other adjusters (unit cannot be played)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'nala-se#clone-engineer',
                        base: 'administrators-tower',
                        hand: ['clone-commander-cody#commanding-the-212th'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['gnk-power-droid'],
                        resources: 1
                    }
                });

                const { context } = contextRef;

                // attack with GNK to trigger adjustment
                context.player1.clickCard(context.gnkPowerDroid);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                expect(context.player1).not.toBeAbleToSelect(context.cloneCommanderCody);
            });
        });
    });
});
