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

        describe('Non-overlapping cost adjusters', function () {
            it('should apply The Darksaber\'s aspect ignore and Guardian of the Whills\' discount to different targets without combining (issue #1971)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bokatan-kryze#princess-in-exile',
                        base: 'kestro-city',
                        hand: ['the-darksaber'],
                        groundArena: ['guardian-of-the-whills', 'follower-of-the-way'],
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);

                // The Darksaber costs 4 on the Mandalorian (aspect penalty ignored) and 5 on Guardian of the
                // Whills (4 + 2 aspect penalty - 1 discount). With 4 resources only the Mandalorian is payable,
                // so Guardian is excluded from targeting: if the adjusters wrongly combined the cost would be 3
                expect(context.player1).toBeAbleToSelectExactly([context.followerOfTheWay]);
                expect(context.player1).not.toBeAbleToSelect(context.guardianOfTheWhills);

                context.player1.clickCard(context.followerOfTheWay);
                expect(context.followerOfTheWay).toHaveExactUpgradeNames(['the-darksaber']);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should correctly charge 5 for The Darksaber on Guardian of the Whills when both adjusted costs are payable', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bokatan-kryze#princess-in-exile',
                        base: 'kestro-city',
                        hand: ['the-darksaber'],
                        groundArena: ['guardian-of-the-whills', 'follower-of-the-way'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theDarksaber);

                // 4 on the Mandalorian and 5 on Guardian are both affordable with 5 resources
                expect(context.player1).toBeAbleToSelectExactly([context.followerOfTheWay, context.guardianOfTheWhills]);

                context.player1.clickCard(context.guardianOfTheWhills);
                expect(context.guardianOfTheWhills).toHaveExactUpgradeNames(['the-darksaber']);
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('should not be playable at all when neither adjusted cost is payable', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bokatan-kryze#princess-in-exile',
                        base: 'kestro-city',
                        hand: ['the-darksaber'],
                        groundArena: ['guardian-of-the-whills', 'follower-of-the-way'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                // Costs 4 on the Mandalorian and 5 on Guardian: neither is payable with 3 resources
                expect(context.player1).not.toBeAbleToSelect(context.theDarksaber);
                context.player1.clickCardNonChecking(context.theDarksaber);
                expect(context.theDarksaber).toBeInZone('hand', context.player1);
            });
        });
    });
});
