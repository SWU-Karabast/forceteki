describe('Overcharged Transport', function() {
    integration(function(contextRef) {
        describe('Overcharged Transport\'s ability', function() {
            it('may defeat an upgrade attached to a space unit (when played)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['overcharged-transport'],
                        groundArena: [{ card: 'wampa', upgrades: ['experience'] }],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['battle-fury'] }]
                    },
                    player2: {
                        spaceArena: [{ card: 'graceful-purrgil', upgrades: ['the-darksaber', 'shield'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.overchargedTransport);
                expect(context.player1).toBeAbleToSelectExactly([context.theDarksaber, context.shield, context.battleFury]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.theDarksaber);

                expect(context.player2).toBeActivePlayer();
                expect(context.gracefulPurrgil).toHaveExactUpgradeNames(['shield']);
                expect(context.theDarksaber).toBeInZone('discard', context.player2);
            });

            it('may defeat an upgrade attached to a space unit (when defeated)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['experience'] }],
                        spaceArena: ['overcharged-transport', { card: 'green-squadron-awing', upgrades: ['battle-fury'] }]
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['takedown'],
                        spaceArena: [{ card: 'graceful-purrgil', upgrades: ['the-darksaber', 'shield'] }]
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.overchargedTransport);

                expect(context.player1).toBeAbleToSelectExactly([context.theDarksaber, context.shield, context.battleFury]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.theDarksaber);

                expect(context.player1).toBeActivePlayer();
                expect(context.gracefulPurrgil).toHaveExactUpgradeNames(['shield']);
                expect(context.theDarksaber).toBeInZone('discard', context.player2);
            });

            it('may defeat an upgrade attached to a space unit (when defeated with No Glory Only Results)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['experience'] }],
                        spaceArena: ['overcharged-transport', { card: 'green-squadron-awing', upgrades: ['battle-fury'] }]
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['no-glory-only-results'],
                        spaceArena: [{ card: 'graceful-purrgil', upgrades: ['the-darksaber', 'shield'] }]
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.overchargedTransport);

                expect(context.player2).toBeAbleToSelectExactly([context.theDarksaber, context.shield, context.battleFury]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.battleFury);

                expect(context.player1).toBeActivePlayer();
                expect(context.greenSquadronAwing).toHaveExactUpgradeNames([]);
                expect(context.battleFury).toBeInZone('discard', context.player1);
            });

            it('may defeat an upgrade attached to a space unit (may defeat leader upgrade or Pilot upgrade but not on unit which moved on ground arena)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['overcharged-transport', 'blue-leader#scarif-air-support'],
                        spaceArena: ['awing'],
                        leader: 'wedge-antilles#leader-of-red-squadron'
                    },
                    player2: {
                        hand: ['paige-tico#dropping-the-hammer'],
                        spaceArena: ['royal-security-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.blueLeader);
                context.player1.clickPrompt('Ambush');
                context.player1.clickPrompt('Pass');
                context.player1.clickPrompt('Trigger');

                context.player2.clickCard(context.paigeTico);
                context.player2.clickPrompt('Play Paige Tico with Piloting');
                context.player2.clickCard(context.royalSecurityFighter);

                context.player1.clickCard(context.wedgeAntilles);
                context.player1.clickPrompt('Deploy Wedge Antilles as a Pilot');
                context.player1.clickCard(context.awing);

                context.player2.passAction();

                context.player1.clickCard(context.overchargedTransport);

                // experience from blue leader cannot be targeted because he was moved on ground
                expect(context.player1).toBeAbleToSelectExactly([context.paigeTico, context.wedgeAntilles]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wedgeAntilles);

                expect(context.player2).toBeActivePlayer();
                expect(context.wedgeAntilles).toBeInZone('base', context.player1);
            });
        });
    });
});
