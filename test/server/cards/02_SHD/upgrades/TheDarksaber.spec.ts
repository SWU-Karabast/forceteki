describe('The Darksaber', function() {
    integration(function(contextRef) {
        describe('The Darksaber\'s gained On Attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['the-darksaber'] }, 'supercommando-squad', 'clan-wren-rescuer', 'pyke-sentinel'],
                        spaceArena: ['concord-dawn-interceptors']
                    },
                    player2: {
                        groundArena: ['follower-of-the-way']
                    }
                });
            });

            it('should give Experience to friendly Mandalorian units', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Check that only friendly Mandalorians were buffed
                expect(context.battlefieldMarine.getPower()).toBe(7);
                expect(context.battlefieldMarine.getHp()).toBe(6);

                expect(context.supercommandoSquad.getPower()).toBe(5);
                expect(context.supercommandoSquad.getHp()).toBe(5);

                expect(context.clanWrenRescuer.getPower()).toBe(2);
                expect(context.clanWrenRescuer.getHp()).toBe(3);

                expect(context.concordDawnInterceptors.getPower()).toBe(2);
                expect(context.concordDawnInterceptors.getHp()).toBe(5);

                expect(context.followerOfTheWay.getPower()).toBe(1);
                expect(context.followerOfTheWay.getHp()).toBe(3);
            });
        });

        describe('The Darksaber\'s cost ability', function() {
            describe('with exactly 4 resources', function () {
                it('should ignore Aspect penalties when being attached to a friendly Mandalorian', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'bokatan-kryze#princess-in-exile',
                            base: 'kestro-city',
                            resources: 4,
                            hand: ['the-darksaber'],
                            groundArena: ['clan-wren-rescuer'],
                            spaceArena: ['concord-dawn-interceptors'],
                        }
                    });

                    const { context } = contextRef;

                    expect(context.player1).toBeAbleToSelect(context.theDarksaber);
                    context.player1.clickCard(context.theDarksaber);

                    expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer]);

                    context.player1.clickCard(context.clanWrenRescuer);
                    expect(context.player1.exhaustedResourceCount).toBe(4);
                });

                it('should ignore Aspect penalties when being attached to an enemy Mandalorian', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'bokatan-kryze#princess-in-exile',
                            base: 'kestro-city',
                            resources: 4,
                            hand: ['the-darksaber'],
                            groundArena: ['clan-wren-rescuer']
                        },
                        player2: {
                            groundArena: ['follower-of-the-way']
                        }
                    });

                    const { context } = contextRef;

                    expect(context.player1).toBeAbleToSelect(context.theDarksaber);
                    context.player1.clickCard(context.theDarksaber);

                    expect(context.player1).toBeAbleToSelectExactly([
                        context.clanWrenRescuer,
                        context.followerOfTheWay
                    ]);

                    context.player1.clickCard(context.followerOfTheWay);
                    expect(context.player1.exhaustedResourceCount).toBe(4);
                });

                it('cannot be played on non-Mandalorian units if aspect penalty cannot be paid', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'bokatan-kryze#princess-in-exile',
                            base: 'kestro-city',
                            resources: 4,
                            hand: ['the-darksaber'],
                            groundArena: ['clan-wren-rescuer', 'pyke-sentinel']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.theDarksaber);

                    expect(context.player1).toBeAbleToSelectExactly([
                        context.clanWrenRescuer,
                        // TODO: Non-Mandalorian units should not even be selectable in this scenario
                        // https://github.com/SWU-Karabast/forceteki/issues/1970
                        context.pykeSentinel
                    ]);

                    context.player1.clickCard(context.pykeSentinel);

                    // Action was cancelled
                    expect(context.theDarksaber).toBeInZone('hand', context.player1);
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    expect(context.player1).toBeActivePlayer();
                });

                it('cannot be played with the discount if there are no Mandalorian non-vehicle units in play', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            resources: 4,
                            hand: ['the-darksaber'],
                            groundArena: ['battlefield-marine'],
                            spaceArena: ['disabling-fang-fighter'],
                        },
                    });

                    const { context } = contextRef;

                    expect(context.player1).not.toBeAbleToSelect(context.theDarksaber);
                    context.player1.clickCardNonChecking(context.theDarksaber);
                });
            });

            describe('with more than 4 resources', function () {
                it('can be played on non-Mandalorian units by paying the Aspect penalty', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'bokatan-kryze#princess-in-exile',
                            base: 'kestro-city',
                            resources: 6,
                            hand: ['the-darksaber'],
                            groundArena: ['clan-wren-rescuer', 'pyke-sentinel']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.theDarksaber);

                    expect(context.player1).toBeAbleToSelectExactly([
                        context.clanWrenRescuer,
                        context.pykeSentinel
                    ]);

                    context.player1.clickCard(context.pykeSentinel);
                    expect(context.player1.exhaustedResourceCount).toBe(6);
                });
            });
        });
    });
});
