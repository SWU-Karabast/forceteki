describe('Shiba Pureheart', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'doji-whisperer'],
                    hand: ['suffer-the-consequences']
                },
                player2: {
                    inPlay: ['shiba-pureheart']
                }
            });
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.suffer = this.player1.findCardByName('suffer-the-consequences');
            this.shiba = this.player2.findCardByName('shiba-pureheart');
        });

        it('should do nothing on the first conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                type: 'military'
            });
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Choose Defenders');
        });

        it('should react when your opponent declares a second conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [],
                type: 'military'
            });
            this.challenger.bowed = true;
            this.noMoreActions(); //End the conflict
            this.challenger.bowed = false;
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                type: 'political'
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.shiba);
            expect(this.player2).not.toHavePrompt('Choose Defenders');
        });

        it('should let you honor a character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [],
                type: 'military'
            });
            this.challenger.bowed = true;
            this.noMoreActions(); //End the conflict
            this.challenger.bowed = false;
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                type: 'political'
            });

            this.player2.clickCard(this.shiba);
            expect(this.player2).toBeAbleToSelect(this.shiba);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.challenger.isHonored).toBe(false);
            this.player2.clickCard(this.challenger);
            expect(this.challenger.isHonored).toBe(true);
        });

        it('should not react when your opponent passes their first conflict', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                type: 'political'
            });

            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Choose Defenders');
        });

        it('should not react to your 2nd conflict', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.shiba],
                defenders: [],
                type: 'military'
            });
            this.shiba.bowed = true;
            this.noMoreActions(); //end the conflict

            this.shiba.bowed = false;
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.shiba],
                type: 'political'
            });

            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Choose Defenders');
        });

        it('should not count your conflict when determining if opponent has two', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.shiba],
                defenders: [],
                type: 'military'
            });
            this.shiba.bowed = true;
            this.noMoreActions(); //end the conflict

            this.shiba.bowed = false;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                type: 'military'
            });

            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Choose Defenders');
        });

        it('should not react when your opponent declares a third conflict', function() {
            this.whisperer.bowed = true;
            this.player1.clickCard(this.suffer);
            this.player1.clickCard(this.whisperer);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [],
                type: 'military'
            });
            this.challenger.bowed = true;
            this.noMoreActions(); //End the conflict
            this.challenger.bowed = false;
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                type: 'political'
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.shiba);
            this.player2.pass();
            expect(this.player2).toHavePrompt('Choose Defenders');
            this.player2.clickPrompt('Done');
            this.challenger.bowed = true;
            this.noMoreActions(); //End the conflict
            this.challenger.bowed = false;

            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                type: 'political'
            });
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Choose Defenders');
        });
    });
});
