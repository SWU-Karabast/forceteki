describe('General Krell, Heartless Tactician', function() {
    integration(function() {
        describe('Krell\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                const startingHandSize = this.player1.handSize;

                // CASE 1: friendly and enemy unit trade, draw 1 card only
                this.player1.clickCard(this.syndicateLackeys);
                this.player1.clickCard(this.wampa);
                expect(this.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                this.player1.clickPrompt('Draw a card');
                expect(this.syndicateLackeys).toBeInLocation('discard');
                expect(this.player1.handSize).toBe(startingHandSize + 1);

                // CASE 2: friendly leader dies, draw card
                this.player2.passAction();
                this.player1.clickCard(this.leiaOrgana);
                this.player1.clickCard(this.atatSuppressor);
                expect(this.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                this.player1.clickPrompt('Draw a card');
                expect(this.leiaOrgana).toBeInLocation('base');
                expect(this.player1.handSize).toBe(startingHandSize + 2);

                // CASE 3: unit played while Krell is on the field gains the effect
                this.player2.passAction();
                this.player1.clickCard(this.battlefieldMarine);
                this.battlefieldMarine.exhausted = false;
                this.player2.passAction();
                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.atatSuppressor);
                expect(this.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                this.player1.clickPrompt('Draw a card');
                expect(this.battlefieldMarine).toBeInLocation('discard');
                expect(this.player1.handSize).toBe(startingHandSize + 2);   // hand size goes down by 1 from playing the marine

                // CASE 4: Krell dies, no card
                this.player2.passAction();
                this.player1.clickCard(this.generalKrell);
                this.player1.clickCard(this.atatSuppressor);
                expect(this.generalKrell).toBeInLocation('discard');
                expect(this.player1.handSize).toBe(startingHandSize + 2);

                // CASE 5: friendly unit dies after Krell, no card
                this.player2.passAction();
                this.player1.clickCard(this.allianceXwing);
                this.player1.clickCard(this.avenger);
                expect(this.allianceXwing).toBeInLocation('discard');
                expect(this.player1.handSize).toBe(startingHandSize + 2);
            });
        });

        describe('Krell\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                this.player1.clickCard(this.generalKrell);

                const startingHandSize = this.player1.handSize;
                this.player2.passAction();

                this.player1.clickCard(this.battlefieldMarine);
                this.player1.clickCard(this.wampa);

                expect(this.player1).toHavePrompt('Trigger the ability \'Draw a card\' or pass');
                this.player1.clickPrompt('Draw a card');

                expect(this.player1.handSize).toBe(startingHandSize + 1);
            });
        });

        // TODO: once we have a card implemented that can return cards from discard to hand, add a test confirming that the ability is regained correctly
    });
});
