describe('Fearless Sailor', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['fearless-sailor', 'togashi-initiate']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'togashi-dreamer', 'doji-challenger']
                }
            });
            this.sailor = this.player1.findCardByName('fearless-sailor');
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.dreamer2 = this.player2.findCardByName('togashi-dreamer');
            this.challenger = this.player2.findCardByName('doji-challenger');

            this.sailor.taint();
            this.dojiWhisperer.honor();
            this.dreamer2.dishonor();
            this.challenger.honor();
            this.game.checkGameState(true);
        });

        it('should not be able to trigger if not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate],
                defenders: [this.dojiWhisperer],
                ring: 'air'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.sailor);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should let you choose a character with a status token', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.sailor],
                defenders: [this.dojiWhisperer, this.dreamer2],
                ring: 'air'
            });
            this.player2.pass();
            this.player1.clickCard(this.sailor);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).toBeAbleToSelect(this.sailor);
            expect(this.player1).toBeAbleToSelect(this.dreamer2);
            expect(this.player1).not.toBeAbleToSelect(this.initiate);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
        });

        it('should give the chosen character -2 mil', function() {
            let skill = this.sailor.getMilitarySkill();

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.sailor],
                defenders: [this.dojiWhisperer, this.dreamer2],
                ring: 'air'
            });
            this.player2.pass();
            this.player1.clickCard(this.sailor);
            this.player1.clickCard(this.sailor);
            expect(this.sailor.getMilitarySkill()).toBe(skill - 2);
            expect(this.getChatLogs(5)).toContain('player1 uses Fearless Sailor to give Fearless Sailor -2military');
        });
    });
});
