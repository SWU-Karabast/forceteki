describe('Take Cover', function () {
    integration(function (contextRef) {
        describe('Take Cover\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['take-cover'],
                        groundArena: [{ card: 'atst', damage: 5 }],
                        base: 'colossus'
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 4 }],
                        spaceArena: ['awing'],
                    }
                });
            });

            it('should heal up to 3 damage to a unit and give it a Shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takeCover);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.awing, context.wampa]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.atst, 3],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(2);
                expect(context.atst).toHaveExactUpgradeNames(['shield']);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should heal up to 3 damage to a unit and give it a Shield (heal 0 but still give Shield)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takeCover);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa, context.awing]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.atst, 0],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(5);
                expect(context.atst).toHaveExactUpgradeNames(['shield']);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });

        it('Take Cover\'s ability should costs 1 resource less by friendly leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-cover'],
                    groundArena: [{ card: 'atst', damage: 5 }],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    base: 'colossus'
                },
                player2: {
                    groundArena: [{ card: 'wampa', damage: 4 }],
                    leader: { card: 'darth-vader#dont-fail-me-again', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeCover);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.chewbacca, context.darthVader, context.wampa]);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.atst, 2],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(3);
            expect(context.atst).toHaveExactUpgradeNames(['shield']);
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('should cost 1 resource less for each of two deployed leaders in Faux Suns', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    hand: ['take-cover'],
                    groundArena: [{ card: 'atst', damage: 5 }],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    secondLeader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                    base: 'colossus'
                },
                player2: {
                    groundArena: [{ card: 'wampa', damage: 4 }],
                    leader: 'luke-skywalker#faithful-friend'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeCover);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.atst, 2],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(3);
            expect(context.atst).toHaveExactUpgradeNames(['shield']);
            // 2 friendly leader units → base cost 3 reduced by 2
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('should count a Darksaber-bearing unit as a friendly leader unit for its cost reduction', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-cover'],
                    groundArena: [
                        { card: 'atst', damage: 5 },
                        { card: 'mace-windu#party-crasher', upgrades: ['the-darksaber#icon-of-leadership'] }
                    ],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    base: 'colossus'
                },
                player2: {
                    groundArena: [{ card: 'wampa', damage: 4 }],
                    leader: 'luke-skywalker#faithful-friend'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeCover);
            context.player1.setDistributeHealingPromptState(new Map([
                [context.atst, 2],
            ]));

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(3);
            expect(context.atst).toHaveExactUpgradeNames(['shield']);
            // chewbacca (leader) + Mace with the Darksaber (a leader unit) = 2 leader units
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
    });
});
