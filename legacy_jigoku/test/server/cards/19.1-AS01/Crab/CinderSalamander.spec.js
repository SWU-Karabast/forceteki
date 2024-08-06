describe('Cinder Salamander', function () {
    integration(function () {
        describe('Cinder Salamander Reaction Ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['cinder-salamander'],
                        hand: ['way-of-the-crab']
                    },
                    player2: {
                        inPlay: ['moto-chagatai'],
                        hand: ['assassination']
                    }
                });

                this.cinderSalamander = this.player1.findCardByName('cinder-salamander');
                this.wayOfTheCrab = this.player1.findCardByName('way-of-the-crab');

                this.chagatai = this.player2.findCardByName('moto-chagatai');
                this.assassination = this.player2.findCardByName('assassination');
            });

            it('shuffles itself back into the deck after being sacrificed', function () {
                this.player1.clickCard(this.wayOfTheCrab);
                this.player1.clickCard(this.cinderSalamander);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.cinderSalamander);
                this.player1.clickCard(this.cinderSalamander);

                expect(this.cinderSalamander.location).toBe('dynasty deck');
                expect(this.getChatLogs(5)).toContain(
                    "player1 uses Cinder Salamander to shuffle Cinder Salamander into player1's dynasty deck"
                );

                this.player2.clickCard(this.chagatai);
                expect(this.chagatai.location).toBe('dynasty discard pile');
            });

            it('shuffles itself back into the deck after being discarded from play', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.cinderSalamander],
                    defenders: [this.chagatai]
                });

                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.cinderSalamander);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.cinderSalamander);

                this.player1.clickCard(this.cinderSalamander);
                expect(this.cinderSalamander.location).toBe('dynasty deck');
                expect(this.getChatLogs(5)).toContain(
                    "player1 uses Cinder Salamander to shuffle Cinder Salamander into player1's dynasty deck"
                );
            });
        });

        describe('Cinder Salamander Action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['cinder-salamander', 'cinder-salamander', 'cinder-salamander']
                    }
                });

                let salamanders = this.player1.filterCardsByName('cinder-salamander');
                this.salamander1 = salamanders[0];
                this.salamander2 = salamanders[1];
                this.salamander3 = salamanders[2];

                this.player1.claimRing('fire');
                this.game.checkGameState(true);
            });

            it('when 3 salamanders are in play, shuffle dynasty deck', function () {
                this.player1.clickCard(this.salamander1);

                expect(this.player1).toHavePrompt('Select characters to put into play from your deck');
                expect(this.player1).toHavePromptButton('Take nothing');
                this.player1.clickPrompt('Take nothing');
                expect(this.getChatLogs(5)).toContain('player1 is shuffling their dynasty deck');

                expect(this.player2).toHavePrompt('Initiate an action');
            });

            it('find all salamanders from dynasty deck and allows to put them into play', function () {
                this.player1.player.moveCard(this.salamander2, 'dynasty deck');
                this.player1.player.moveCard(this.salamander3, 'dynasty deck');

                this.player1.clickCard(this.salamander1);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Cinder Salamander to search their deck and provinces for other copies of Cinder Salamander and put them into play'
                );
                expect(this.player1).toHavePrompt('Select characters to put into play from your deck');
                expect(this.player1).toHavePromptButton('Cinder Salamander (2)');

                this.player1.clickPrompt('Cinder Salamander (2)');
                expect(this.player1).toHavePromptButton('Cinder Salamander');
                this.player1.clickPrompt('Cinder Salamander');

                expect(this.salamander1.location).toBe('play area');
                expect(this.salamander2.location).toBe('play area');
                expect(this.salamander3.location).toBe('play area');

                expect(this.getChatLogs(5)).toContain('player1 finds 2 salamanders in their deck');
                expect(this.getChatLogs(5)).toContain('player1 is shuffling their dynasty deck');

                expect(this.player2).toHavePrompt('Initiate an action');
            });

            it('find all salamanders from provinces and allows to put them into play', function () {
                this.player1.placeCardInProvince(this.salamander2, 'province 2');
                this.player1.placeCardInProvince(this.salamander3, 'province 3');
                this.salamander3.facedown = true;

                this.player1.clickCard(this.salamander1);
                this.player1.clickPrompt('Take nothing');
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Cinder Salamander to search their deck and provinces for other copies of Cinder Salamander and put them into play'
                );
                expect(this.getChatLogs(5)).toContain('player1 takes nothing');

                expect(this.player1).toHavePrompt('Select characters to put into play from your provinces');
                expect(this.player1).toBeAbleToSelect(this.salamander2);
                expect(this.player1).not.toBeAbleToSelect(this.salamander3);

                this.player1.clickCard(this.salamander2);
                expect(this.player1).toHavePromptButton('Done');

                this.player1.clickPrompt('Done');
                expect(this.salamander1.location).toBe('play area');
                expect(this.salamander2.location).toBe('play area');
                expect(this.salamander3.location).toBe('province 3');

                expect(this.getChatLogs(5)).toContain('player1 finds 1 salamander in their provinces');

                expect(this.player2).toHavePrompt('Initiate an action');
            });
        });
    });
});