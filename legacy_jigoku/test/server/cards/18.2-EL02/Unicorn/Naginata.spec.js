describe('Daikyu Reprint', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-hotaru', 'togashi-initiate'],
                    hand: ['naginata']
                },
                player2: {
                    inPlay: ['akodo-toturi', 'doji-whisperer'],
                    hand: ['naginata', 'favored-mount', 'way-of-the-open-hand']
                }
            });

            this.hotaru = this.player1.findCardByName('doji-hotaru');
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.naginata1 = this.player1.findCardByName('naginata');
            this.naginata2 = this.player2.findCardByName('naginata');
            this.mount = this.player2.findCardByName('favored-mount');
            this.hand = this.player2.findCardByName('way-of-the-open-hand');

            this.player1.playAttachment(this.naginata1, this.hotaru);
            this.player2.playAttachment(this.naginata2, this.toturi);
            this.player1.pass();
            this.player2.playAttachment(this.mount, this.whisperer);
        });

        it('should give +2 mil when first player and +1 when 2nd', function () {
            expect(this.hotaru.getMilitarySkill()).toBe(3 + 2);
            expect(this.toturi.getMilitarySkill()).toBe(6 + 1);
        });

        it('should react when a character moves in', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.hotaru, this.initiate],
                defenders: [this.toturi],
                type: 'military'
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.mount);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.hotaru);
            this.player1.clickCard(this.hotaru);
            expect(this.player1).not.toBeAbleToSelect(this.hotaru);
            expect(this.player1).not.toBeAbleToSelect(this.toturi);
            expect(this.player1).toBeAbleToSelect(this.initiate);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            this.player1.clickCard(this.whisperer);
            expect(this.whisperer.bowed).toBe(true);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.toturi);
            this.player2.clickCard(this.toturi);
            expect(this.player2).toBeAbleToSelect(this.hotaru);
            expect(this.player2).not.toBeAbleToSelect(this.toturi);
            expect(this.player2).toBeAbleToSelect(this.initiate);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.hotaru);
            expect(this.hotaru.bowed).toBe(true);
        });

        it('should react when a character moves out', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.hotaru, this.initiate],
                defenders: [this.toturi, this.whisperer],
                type: 'military'
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.hand);
            this.player2.clickCard(this.hotaru);

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.toturi);
            this.player2.clickCard(this.toturi);
            expect(this.player2).not.toBeAbleToSelect(this.hotaru);
            expect(this.player2).not.toBeAbleToSelect(this.toturi);
            expect(this.player2).toBeAbleToSelect(this.initiate);
            expect(this.player2).toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.initiate);
            expect(this.initiate.bowed).toBe(true);
        });

        it('should not react in pol', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.hotaru, this.initiate],
                defenders: [this.toturi],
                type: 'political'
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.mount);

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });
    });
});
