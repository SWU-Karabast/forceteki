describe('Consolidation of power', function () {
    integration(function (contextRef) {
        it('Consolidation of power\'s ability should defeat units to play 1 of the same cost or less for free', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: [
                        'consolidation-of-power',
                        'academy-defense-walker',
                        'spark-of-rebellion',
                        'finalizer#might-of-the-first-order',
                        'home-one#alliance-flagship',
                        'savage-opress#monster',
                        'bounty-hunter-crew',
                    ],
                    groundArena: ['reinforcement-walker', { card: 'battlefield-marine', upgrades: ['the-darksaber'] }],
                    spaceArena: [{ card: 'alliance-xwing', exhausted: true }],
                    base: 'chopper-base',
                    leader: 'emperor-palpatine#galactic-ruler',
                    resources: 20
                },
                player2: {
                    groundArena: ['specforce-soldier'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            // We can select nothing
            context.player1.clickCard(context.consolidationOfPower);
            expect(context.player1).toBeAbleToSelectExactly([
                context.reinforcementWalker,
                context.battlefieldMarine,
                context.allianceXwing,
            ]);
            expect(context.player1).toHaveChooseNoTargetButton();
            context.player1.clickPrompt('Done');
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            // We take Consolidation of power back in hand with the Bounty Hunder Crew
            context.player1.clickCard(context.bountyHunterCrew);
            context.player1.clickPrompt('Return an event from a discard pile');
            context.player1.clickCard(context.consolidationOfPower);
            context.player1.clickPrompt('Pass');
            expect(context.consolidationOfPower).toBeInZone('hand');
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            // This time we select units and the test the following
            //  - We can't select opponent's units
            //  - We can select ground and space units
            //  - Upgrades are included in the power calculation
            //  - Units can be ready or exhausted
            //  - Card with a cost above the power of the selected units can't be played
            //  - Only the printed cost matters and it's free to play
            context.player1.clickCard(context.consolidationOfPower);
            expect(context.player1).toBeAbleToSelectExactly([
                context.reinforcementWalker,
                context.battlefieldMarine,
                context.allianceXwing,
                context.bountyHunterCrew,
            ]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.allianceXwing);
            context.player1.clickPrompt('Done');
            expect(context.player1).toBeAbleToSelectExactly([
                context.academyDefenseWalker,
                context.homeOneAllianceFlagship,
                context.savageOpressMonster,
            ]);
            expect(context.player1).toHaveChooseNoTargetButton();
            context.player1.clickCard(context.homeOneAllianceFlagship);
            expect(context.homeOneAllianceFlagship).toBeInZone('spaceArena');
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.theDarksaber).toBeInZone('discard');
            expect(context.allianceXwing).toBeInZone('discard');
            expect(context.reinforcementWalker).toBeInZone('groundArena');
            expect(context.bountyHunterCrew).toBeInZone('groundArena');
            expect(context.finalizerMightOfTheFirstOrder).toBeInZone('hand');
            expect(context.academyDefenseWalker).toBeInZone('hand');
            expect(context.savageOpressMonster).toBeInZone('hand');
            // With Home One we can play a unit for that we discarded with Consolidation of power
            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.allianceXwing,
            ]);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.readyResourceCount).toBe(1);
        });
    });
});
