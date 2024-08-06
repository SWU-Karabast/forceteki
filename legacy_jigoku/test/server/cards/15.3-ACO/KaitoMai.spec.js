describe('Kaito Mai', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kaito-mai', 'bayushi-manipulator'],
                    hand: ['shadow-steed']
                },
                player2: {
                    inPlay: ['alibi-artist', 'shosuro-actor'],
                    hand: ['assassination', 'a-new-name'],
                    dynastyDiscard: ['daidoji-kageyu'],
                    fate:7
                }
            });
            this.mai = this.player1.findCardByName('kaito-mai');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.steed = this.player1.findCardByName('shadow-steed');

            this.alibi = this.player2.findCardByName('alibi-artist');
            this.ass = this.player2.findCardByName('assassination');
            this.actor = this.player2.findCardByName('shosuro-actor');
            this.name = this.player2.findCardByName('a-new-name');

            this.kageyu = this.player2.placeCardInProvince('daidoji-kageyu', 'province 1');
            this.kageyu.facedown = false;
            this.mai.fate = 1;
            this.manipulator.fate = 2;
            this.alibi.fate = 1;
            this.actor.fate = 1;
        });

        it('should react to moving fate via card effects', function() {
            this.player1.playAttachment(this.steed, this.mai);
            this.player1.clickCard(this.mai);
            this.player1.clickPrompt('1');

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.mai);
        });

        it('should get +3 glory when dire', function() {
            this.player1.playAttachment(this.steed, this.mai);
            this.player1.clickCard(this.mai);
            this.player1.clickPrompt('1');

            expect(this.mai.getGlory()).toBe(this.mai.printedGlory + 3);
        });

        it('should let you remove a fate from an opponent character', function() {
            let fate = this.alibi.fate;
            this.player1.playAttachment(this.steed, this.mai);
            this.player1.clickCard(this.mai);
            this.player1.clickPrompt('1');

            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.mai);
            this.player1.clickCard(this.alibi);
            expect(this.alibi.fate).toBe(fate - 1);
        });

        it('should let you remove a fate from your own character', function() {
            let fate = this.manipulator.fate;
            this.player1.playAttachment(this.steed, this.mai);
            this.player1.clickCard(this.mai);
            this.player1.clickPrompt('1');

            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.mai);
            this.player1.clickCard(this.manipulator);
            expect(this.manipulator.fate).toBe(fate - 1);
        });

        it('should not react to leaving play with fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: []
            });
            this.player2.clickCard(this.ass);
            this.player2.clickCard(this.mai);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.mai);
        });
    });
});
