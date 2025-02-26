describe('San Hill, Chairman of the Banking Clan', function () {
    integration(function (contextRef) {
        describe('San Hill\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'general-grievous#general-of-the-droid-armies',
                        hand: ['syndicate-lackeys'],
                        groundArena: ['san-hill#chairman-of-the-banking-clan', 'oomseries-officer', 'b1-attack-platform'],
                        resources: 10
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'fleet-lieutenant', 'wampa']
                    }
                });
            });

            it('should ready resources for each friendly unit that was defeated this phase', function () {
                const { context } = contextRef;

                // Syndicate Lackeys should be defeated by attacking Wampa
                context.player1.clickCard(context.syndicateLackeys);
                context.player1.clickPrompt('Ambush');
                context.player1.clickCard(context.wampa);

                expect(context.player1.readyResourceCount).toBe(5);
                expect(context.player1.exhaustedResourceCount).toBe(5);

                // B1 Attack Platform should be defeated by Fleet Lieutenant
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.b1AttackPlatform);

                // OOM Series Officer should be defeated by attacking Fleet Lieutenant
                context.player1.clickCard(context.oomseriesOfficer);
                context.player1.clickCard(context.fleetLieutenant);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // San Hill should ready 3 resources
                context.player1.clickCard(context.sanHillChairmanOfTheBankingClan);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.readyResourceCount).toBe(8);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                // San Hill should not ready and resources since no friendly units were defeated this phase
                context.moveToNextActionPhase();

                context.player1.exhaustResources(3);

                expect(context.player1.readyResourceCount).toBe(7);
                expect(context.player1.exhaustedResourceCount).toBe(3);

                context.player1.clickCard(context.sanHillChairmanOfTheBankingClan);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.readyResourceCount).toBe(7);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });
    });
});
