describe('Jabba The Hutt, Eminence Of Tatooine', function() {
    integration(function(contextRef) {
        describe('Jabba The Hutt, Eminence Of Tatooine\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jabba-the-hutt#eminence-of-tatooine', 'chewbacca#faithful-first-mate', 'condemn'],
                        groundArena: [{ card: 'wampa', upgrades: ['fulcrum', 'shield'] }],
                        spaceArena: ['awing', 'green-squadron-awing']
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: ['mastery'] }],
                        spaceArena: ['phoenix-squadron-awing']
                    }
                });
            });

            it('should return an upgrade to its owner\'s hand and play it for free if upgrade return to AP\'s hand (friendly token upgrade)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toBeAbleToSelectExactly([context.fulcrum, context.shield, context.mastery]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.shield);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['fulcrum']);
            });

            it('is optional', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toBeAbleToSelectExactly([context.fulcrum, context.shield, context.mastery]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toHaveExactUpgradeNames(['fulcrum', 'shield']);
                expect(context.atst).toHaveExactUpgradeNames(['mastery']);
            });

            it('should return an upgrade to its owner\'s hand and play it for free if upgrade return to AP\'s hand (enemy upgrade)', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickCard(context.mastery);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.mastery).toBeInZone('hand', context.player2);
            });

            it('should return an upgrade to its owner\'s hand and play it for free if upgrade return to AP\'s hand (friendly upgrade)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickCard(context.fulcrum);

                expect(context.player1).toHavePassAbilityPrompt('Play Fulcrum for free');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.jabbaTheHutt]);
                context.player1.clickCard(context.jabbaTheHutt);

                expect(context.player2).toBeActivePlayer();
                expect(context.jabbaTheHutt).toHaveExactUpgradeNames(['fulcrum']);
            });

            it('should return an upgrade to its owner\'s hand and play it for free if upgrade return to AP\'s hand (the second part is optional too)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickCard(context.fulcrum);

                expect(context.player1).toHavePassAbilityPrompt('Play Fulcrum for free');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.fulcrum).toBeInZone('hand', context.player1);
            });

            it('should return an upgrade to its owner\'s hand and play it for free if upgrade return to AP\'s hand (friendly upgrade on enemy unit)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.condemn);
                context.player1.clickCard(context.atst);

                context.player2.passAction();

                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickCard(context.condemn);

                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.phoenixSquadronAwing);

                expect(context.player2).toBeActivePlayer();
                expect(context.phoenixSquadronAwing).toHaveExactUpgradeNames(['condemn']);
            });

            it('should return an upgrade to its owner\'s hand and play it for free if upgrade return to AP\'s hand (pilot upgrade)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                context.player1.clickCard(context.awing);

                context.player2.passAction();

                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickCard(context.chewbacca);

                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player2).toBeActivePlayer();
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['chewbacca#faithful-first-mate']);
            });
        });

        it('should return an upgrade to its owner\'s hand and play it for free if upgrade return to AP\'s hand (pilot leader upgrade)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jabba-the-hutt#eminence-of-tatooine'],
                },
                player2: {
                    spaceArena: ['phoenix-squadron-awing'],
                    leader: 'luke-skywalker#hero-of-yavin',
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.lukeSkywalker);
            context.player2.clickPrompt('Deploy Luke Skywalker as a Pilot');
            context.player2.clickCard(context.phoenixSquadronAwing);

            context.player1.clickCard(context.jabbaTheHutt);
            context.player1.clickCard(context.lukeSkywalker);

            expect(context.player2).toBeActivePlayer();
            expect(context.lukeSkywalker.deployed).toBeFalse();
        });
    });
});
