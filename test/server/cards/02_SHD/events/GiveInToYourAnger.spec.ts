describe('Give In to Your Anger', function() {
    integration(function(contextRef) {
        describe('Give In to Your Anger\'s ability', function() {
            it('should deal 1 damage to an enemy unit and force the opponent to attack a unit with that unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['give-in-to-your-anger'],
                        groundArena: ['scout-bike-pursuer'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer', 'fetts-firespray#pursuing-the-bounty'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.giveInToYourAnger);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.atst, context.isbAgent, context.fettsFirespray, context.darthVader]);

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.damage).toBe(1);

                expect(context.player2).toBeAbleToSelectExactly([context.fettsFirespray]);
                expect(context.player2).not.toHaveClaimInitiativeAbilityButton();
                expect(context.player2).not.toHavePassAbilityButton();

                context.player2.clickCard(context.fettsFirespray);
                expect(context.player2).toBeAbleToSelectExactly([context.avenger]);

                context.player2.clickCard(context.avenger);
                expect(context.fettsFirespray).toBeInZone('discard');
            });

            it('should deal 1 damage to an enemy unit and force the opponent to attack with that unit even if there are no units in that arena', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['give-in-to-your-anger'],
                        groundArena: ['scout-bike-pursuer'],
                        spaceArena: [],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer', 'fetts-firespray#pursuing-the-bounty'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.giveInToYourAnger);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.atst, context.isbAgent, context.fettsFirespray, context.darthVader]);

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.damage).toBe(1);

                expect(context.player2).toBeAbleToSelectExactly([context.fettsFirespray]);
                expect(context.player2).not.toHaveClaimInitiativeAbilityButton();
                expect(context.player2).not.toHavePassAbilityButton();

                context.player2.clickCard(context.fettsFirespray);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);

                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(5);
            });

            it('should deal 1 damage to an enemy unit and allow the opponent to use any action if the target unit cannot attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['give-in-to-your-anger'],
                        groundArena: ['scout-bike-pursuer'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer', { card: 'fetts-firespray#pursuing-the-bounty', exhausted: true }],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.giveInToYourAnger);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.atst, context.isbAgent, context.fettsFirespray, context.darthVader]);

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray.damage).toBe(1);

                expect(context.player2).toBeAbleToSelectExactly([context.fettsFirespray, context.atst, context.isbAgent, context.cartelSpacer, context.darthVader]);
                expect(context.player2).toHaveClaimInitiativeAbilityButton();
                expect(context.player2).toHavePassAbilityButton();

                context.player2.clickCard(context.fettsFirespray);
                expect(context.player2).toHavePrompt('Exhaust a non-unique unit');

                context.player2.clickCard(context.scoutBikePursuer);
                expect(context.scoutBikePursuer.exhausted).toBeTrue();
            });

            it('should deal 1 damage to an enemy unit and allow the opponent to use any action if the target unit was killed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['give-in-to-your-anger'],
                        groundArena: ['scout-bike-pursuer'],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer', { card: 'fetts-firespray#pursuing-the-bounty', damage: 5 }],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.giveInToYourAnger);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.atst, context.isbAgent, context.fettsFirespray, context.darthVader]);

                context.player1.clickCard(context.fettsFirespray);
                expect(context.fettsFirespray).toBeInZone('discard');

                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.isbAgent, context.cartelSpacer, context.darthVader]);
                expect(context.player2).toHaveClaimInitiativeAbilityButton();
                expect(context.player2).toHavePassAbilityButton();
            });

            it('should deal 1 damage to an enemy unit and force the opponent to attack with that unit even if there are no attackable units in that arena', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['give-in-to-your-anger'],
                        groundArena: ['sabine-wren#explosives-artist'],
                        spaceArena: ['avenger#hunting-star-destroyer', 'cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['fetts-firespray#pursuing-the-bounty'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.giveInToYourAnger);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.isbAgent, context.fettsFirespray, context.darthVader]);

                context.player1.clickCard(context.darthVader);
                expect(context.darthVader.damage).toBe(1);

                expect(context.player2).toBeAbleToSelectExactly([context.darthVader]);
                expect(context.player2).not.toHaveClaimInitiativeAbilityButton();
                expect(context.player2).not.toHavePassAbilityButton();

                context.player2.clickCard(context.darthVader);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);

                context.player2.clickCard(context.p1Base);
                context.player2.clickCard(context.sabineWren);
                expect(context.sabineWren.damage).toBe(2);
                expect(context.p1Base.damage).toBe(5);
            });

            it('should deal 1 damage to an enemy unit and force the opponent to attack with that unit only for the next action', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['give-in-to-your-anger'],
                        groundArena: ['sabine-wren#explosives-artist'],
                        spaceArena: ['avenger#hunting-star-destroyer', 'cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['atst', 'admiral-motti#brazen-and-scornful'],
                        spaceArena: ['fetts-firespray#pursuing-the-bounty'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.giveInToYourAnger);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.admiralMotti, context.fettsFirespray, context.darthVader]);

                context.player1.clickCard(context.darthVader);
                expect(context.darthVader.damage).toBe(1);

                expect(context.player2).toBeAbleToSelectExactly([context.darthVader]);
                expect(context.player2).not.toHaveClaimInitiativeAbilityButton();
                expect(context.player2).not.toHavePassAbilityButton();

                context.player2.clickCard(context.darthVader);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);

                context.player2.clickCard(context.p1Base);
                context.player2.clickCard(context.admiralMotti);
                context.player2.clickCard(context.darthVader);
                expect(context.p1Base.damage).toBe(5);

                context.player1.claimInitiative();

                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.fettsFirespray, context.darthVader]);
                expect(context.player2).toHavePassAbilityButton();
            });
        });
    });
});
