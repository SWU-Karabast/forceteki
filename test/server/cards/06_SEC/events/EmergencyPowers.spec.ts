describe('Emergency Powers', function() {
    integration(function(contextRef) {
        describe('Emergency Powers\' ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        hand: ['emergency-powers'],
                        groundArena: ['darth-maul#revenge-at-last'],
                        spaceArena: ['fireball#an-explosion-with-wings'],
                        resources: 10,
                        base: 'dagobah-swamp'
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['victor-leader#leading-from-the-front', 'tie-bomber'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    }
                });
            });

            it('should give Experience to a friendly non-leader unit for the amount of resources paid', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emergencyPowers);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaul,
                    context.fireball,
                    context.atst,
                    context.victorLeader,
                    context.tieBomber
                ]);

                context.player1.clickCard(context.darthMaul);

                // can choose from 0 - 9 resources since 1 was paid for Emergency Powers already
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 10 }, (_x, i) => `${i}`));
                context.player1.chooseListOption('1');

                expect(context.darthMaul).toHaveExactUpgradeNames(['experience']);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should give Experience to an enemy non-leader unit for the resources paid', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emergencyPowers);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaul,
                    context.fireball,
                    context.atst,
                    context.victorLeader,
                    context.tieBomber
                ]);

                context.player1.clickCard(context.atst);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 10 }, (_x, i) => `${i}`));
                context.player1.chooseListOption('3');
                expect(context.atst).toHaveExactUpgradeNames(['experience', 'experience', 'experience']);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should allow choosing 0 resources', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emergencyPowers);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaul,
                    context.fireball,
                    context.atst,
                    context.victorLeader,
                    context.tieBomber
                ]);

                context.player1.clickCard(context.victorLeader);

                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 10 }, (_x, i) => `${i}`));
                context.player1.chooseListOption('0');

                expect(context.victorLeader).toHaveExactUpgradeNames([]);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should allow exhausting all available resources', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emergencyPowers);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaul,
                    context.fireball,
                    context.atst,
                    context.victorLeader,
                    context.tieBomber
                ]);

                context.player1.clickCard(context.atst);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 10 }, (_x, i) => `${i}`));
                context.player1.chooseListOption('9');
                expect(context.atst).toHaveExactUpgradeNames([
                    'experience',
                    'experience',
                    'experience',
                    'experience',
                    'experience',
                    'experience',
                    'experience',
                    'experience',
                    'experience']);
                expect(context.player1.exhaustedResourceCount).toBe(10);
            });
        });

        it('Emergency Power\' ability should do nothing if there are no units on the field', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['emergency-powers'],
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'dagobah-swamp',
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emergencyPowers);
            context.player1.clickPrompt('Play anyway');

            expect(context.emergencyPowers).toBeInZone('discard', context.player1);
            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
    });
});