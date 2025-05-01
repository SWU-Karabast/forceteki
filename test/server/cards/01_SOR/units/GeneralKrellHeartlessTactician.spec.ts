describe('General Krell, Heartless Tactician', function() {
    integration(function(contextRef) {
        describe('Krell\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['syndicate-lackeys', 'general-krell#heartless-tactician'],
                        spaceArena: ['alliance-xwing', 'corporate-defense-shuttle'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['wampa', 'atat-suppressor'],
                        spaceArena: ['avenger#hunting-star-destroyer']
                    }
                });
            });

            it('grants a "draw card on defeat" ability to all other friendly units', function () {
                const { context } = contextRef;

                const startingHandSize = context.player1.handSize;

                // CASE 1: friendly and enemy unit trade, draw 1 card only
                context.player1.clickCard(context.syndicateLackeys);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                context.player1.clickPrompt('Trigger');
                expect(context.syndicateLackeys).toBeInZone('discard');
                expect(context.player1.handSize).toBe(startingHandSize + 1);

                // CASE 2: friendly leader dies, draw card
                context.player2.passAction();
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.atatSuppressor);
                expect(context.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                context.player1.clickPrompt('Trigger');
                expect(context.leiaOrgana).toBeInZone('base');
                expect(context.player1.handSize).toBe(startingHandSize + 2);

                // CASE 3: unit played while Krell is on the field gains the effect
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.readyCard(context.battlefieldMarine);
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atatSuppressor);
                expect(context.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                context.player1.clickPrompt('Trigger');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player1.handSize).toBe(startingHandSize + 2);   // hand size goes down by 1 from playing the marine

                // CASE 4: Player2 takes control and doesnt trigger when defeated
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.corporateDefenseShuttle);
                expect(context.player2.handSize).toBe(0);

                // CASE 5: Krell dies, no card
                context.player1.clickCard(context.generalKrell);
                context.player1.clickCard(context.atatSuppressor);
                expect(context.generalKrell).toBeInZone('discard');
                expect(context.player1.handSize).toBe(startingHandSize + 2);

                // CASE 6: friendly unit dies after Krell, no card
                context.player2.passAction();
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.avenger);
                expect(context.allianceXwing).toBeInZone('discard');
                expect(context.player1.handSize).toBe(startingHandSize + 2);
            });
        });

        describe('Krell\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['general-krell#heartless-tactician'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('works when he is played onto the field after other units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.generalKrell);

                const startingHandSize = context.player1.handSize;
                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.handSize).toBe(startingHandSize + 1);
            });
        });
        describe('Krell\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-emperors-legion'],
                        groundArena: ['battlefield-marine', 'general-krell#heartless-tactician', 'reputable-hunter'],
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        hand: ['waylay']
                    }
                });
            });

            it('should draw only 1 card when returned to hand and played again.', function() {
                const { context } = contextRef;
                const startingHandSize = context.player1.handSize;

                // CASE 1: We defeat krell, return him to hand, play him again and defeat a friendly unit so we draw 1 card
                context.player1.clickCard(context.generalKrell);
                context.player1.clickCard(context.atst);

                context.player2.passAction();
                context.player1.clickCard(context.theEmperorsLegion);
                context.player2.passAction();

                context.player1.clickCard(context.generalKrell);
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                context.player1.clickPrompt('Trigger');
                expect(context.player2).toBeActivePlayer();

                // its the same as the starting hand since we play 1 card
                expect(context.player1.handSize).toBe(startingHandSize);

                // CASE 2: we Waylay krell and return him to hand and play him again
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.generalKrell);

                context.player1.clickCard(context.generalKrell);
                context.player2.passAction();
                context.player1.clickCard(context.reputableHunter);
                context.player1.clickCard(context.atst);

                expect(context.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.handSize).toBe(startingHandSize + 1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Krell\'s ability', function() {
            it('should work with No Glory, Only Results', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['battlefield-marine', 'general-krell#heartless-tactician'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Trigger');

                expect(context.player1.handSize).toBe(1);
            });
        });
    });
});
