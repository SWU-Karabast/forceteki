describe('Scouted Terrain', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 12,
                    inPlay: ['matsu-agetoki'],
                    hand: ['scouted-terrain']
                },
                player2: {
                    honor: 10,
                    inPlay: ['doji-whisperer'],
                    hand: ['talisman-of-the-sun']
                }
            });

            this.agetoki = this.player1.findCardByName('matsu-agetoki');
            this.terrain = this.player1.findCardByName('scouted-terrain');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.talisman = this.player2.findCardByName('talisman-of-the-sun');

            this.p1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.pStronghold = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.player1.pass();
            this.player2.playAttachment(this.talisman, this.dojiWhisperer);

            this.p1.facedown = true;
            this.p2.facedown = true;
            this.p3.facedown = true;
            this.p4.facedown = true;
            this.pStronghold.facedown = true;
        });

        it('should not be playable with less than 4 faceup provinces', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.terrain);
            expect(this.player1).toHavePrompt('Action Window');
            this.p1.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.terrain);
            expect(this.player1).toHavePrompt('Action Window');
            this.p2.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.terrain);
            expect(this.player1).toHavePrompt('Action Window');
            this.p3.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.terrain);
            expect(this.player1).toHavePrompt('Action Window');
            this.p4.facedown = false;
            this.game.checkGameState(true);
            this.player1.clickCard(this.terrain);
            expect(this.getChatLogs(1)).toContain('player1 plays Scouted Terrain to allow player2\'s stronghold to be attacked this phase');
        });

        it('should allow attacking the stronghold', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.p4.facedown = false;
            this.game.checkGameState(true);

            this.player1.clickCard(this.terrain);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.agetoki],
                defenders: [],
                province: this.pStronghold
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should allow moving the conflict to the stronghold', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.p4.facedown = false;
            this.game.checkGameState(true);

            this.player1.clickCard(this.terrain);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.agetoki],
                defenders: [],
                province: this.p1
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.talisman);
            expect(this.player2).toBeAbleToSelect(this.pStronghold);
        });

        it('should not allow moving the conflict to the stronghold without playing the card', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.agetoki],
                defenders: [],
                province: this.p1
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.talisman);
            expect(this.player2).not.toBeAbleToSelect(this.pStronghold);
        });

        it('should allow moving the conflict to the stronghold', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.p4.facedown = false;
            this.game.checkGameState(true);

            this.player1.clickCard(this.terrain);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.agetoki],
                defenders: [],
                province: this.p1
            });

            this.player2.pass();
            this.player1.clickCard(this.agetoki);
            expect(this.player1).toBeAbleToSelect(this.pStronghold);
        });

        it('should allow moving the conflict to the stronghold if the event is played after the conflict starts', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.p4.facedown = false;
            this.game.checkGameState(true);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.agetoki],
                defenders: [],
                province: this.p1
            });

            this.player2.pass();
            this.player1.clickCard(this.terrain);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.talisman);
            expect(this.player2).toBeAbleToSelect(this.pStronghold);
        });
    });
});
