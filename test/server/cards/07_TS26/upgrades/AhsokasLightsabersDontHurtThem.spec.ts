describe('Ahsoka\'s Lightsabers, Don\'t Hurt Them', function() {
    integration(function(contextRef) {
        it('can only attach to non-Vehicle units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ahsokas-lightsabers#dont-hurt-them'],
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['alliance-xwing']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.ahsokasLightsabers);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
            expect(context.player1).not.toBeAbleToSelect([context.atst, context.allianceXwing]);

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['ahsokas-lightsabers#dont-hurt-them']);
        });

        describe('Basic functionality', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['ahsokas-lightsabers#dont-hurt-them'] },
                            'yoda#old-master'
                        ],
                        hand: ['vanquish', 'rivals-fall'],
                        leader: 'chewbacca#walking-carpet'
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                        hand: ['resupply', 'no-glory-only-results', 'lost-and-forgotten'],
                        base: 'echo-base',
                        leader: 'hondo-ohnaka#thats-good-business'
                    }
                });
            });

            it('should work when attached to a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.resupply);

                expect(context.player1).toBeActivePlayer();
                expect(context.player2.exhaustedResourceCount).toBe(4); // 3+ resupply exhausted

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player2.passAction();

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(9);
            });

            it('should work when attached to a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                context.moveToNextActionPhase();

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('should work when attached to a unit', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeAbleToSelectExactly([context.yoda]);
                context.player2.clickCard(context.yoda);

                context.player1.passAction();

                context.player2.clickCard(context.resupply);

                expect(context.player1).toBeActivePlayer();
                expect(context.player2.exhaustedResourceCount).toBe(9); // 5 + 3 + resuply exhausted
            });

            it('should work when attached to a unit', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.lostAndForgotten);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);
                context.player1.clickCard(context.awing);

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should work when attached to a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                context.player1.clickCard(context.wampa);

                context.player2.passAction();

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player2.clickCard(context.lostAndForgotten);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.awing);

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });

            it('should work when attached to a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                context.player1.clickCard(context.awing);

                context.player2.clickCard(context.lostAndForgotten);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.awing);

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });
        });
        it('should work when attached to a unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [
                        { card: 'battlefield-marine', upgrades: ['ahsokas-lightsabers#dont-hurt-them'] },
                        'yoda#old-master'
                    ],
                    hand: ['resupply'],
                    base: 'echo-base',
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            context.player1.clickCard(context.resupply);
            expect(context.player1.exhaustedResourceCount).toBe(4); // 3+ resupply exhausted
        });
    });
});
