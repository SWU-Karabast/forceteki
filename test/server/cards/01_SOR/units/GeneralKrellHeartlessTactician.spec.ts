describe('General Krell, Heartless Tactician', function() {
    integration(function(contextRef) {
        describe('Krell\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['syndicate-lackeys', 'general-krell#heartless-tactician'],
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true }
                    },
                    player2: {
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
                context.player1.clickPrompt('Draw a card');
                expect(context.syndicateLackeys).toBeInLocation('discard');
                expect(context.player1.handSize).toBe(startingHandSize + 1);

                // CASE 2: friendly leader dies, draw card
                context.player2.passAction();
                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.atatSuppressor);
                expect(context.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                context.player1.clickPrompt('Draw a card');
                expect(context.leiaOrgana).toBeInLocation('base');
                expect(context.player1.handSize).toBe(startingHandSize + 2);

                // CASE 3: unit played while Krell is on the field gains the effect
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.battlefieldMarine.exhausted = false;
                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atatSuppressor);
                expect(context.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                context.player1.clickPrompt('Draw a card');
                expect(context.battlefieldMarine).toBeInLocation('discard');
                expect(context.player1.handSize).toBe(startingHandSize + 2);   // hand size goes down by 1 from playing the marine

                // CASE 4: Krell dies, no card
                context.player2.passAction();
                context.player1.clickCard(context.generalKrell);
                context.player1.clickCard(context.atatSuppressor);
                expect(context.generalKrell).toBeInLocation('discard');
                expect(context.player1.handSize).toBe(startingHandSize + 2);

                // CASE 5: friendly unit dies after Krell, no card
                context.player2.passAction();
                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.avenger);
                expect(context.allianceXwing).toBeInLocation('discard');
                expect(context.player1.handSize).toBe(startingHandSize + 2);
            });
        });

        describe('Krell\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
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
                context.player1.clickPrompt('Draw a card');

                expect(context.player1.handSize).toBe(startingHandSize + 1);
            });
        });

        // TODO: once we have a card implemented that can return cards from discard to hand, add a test confirming that the ability is regained correctly
    });
});
