describe('Togashi Dreamer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-dreamer', 'togashi-initiate'],
                    hand: ['iron-foundations-stance', 'lurking-affliction']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'togashi-dreamer', 'doji-challenger']
                }
            });
            this.dreamer = this.player1.findCardByName('togashi-dreamer');
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.stance = this.player1.findCardByName('iron-foundations-stance');
            this.lurk = this.player1.findCardByName('lurking-affliction');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.dreamer2 = this.player2.findCardByName('togashi-dreamer');
            this.challenger = this.player2.findCardByName('doji-challenger');

            this.dreamer.taint();
            this.dojiWhisperer.honor();
            this.dreamer2.dishonor();
            this.challenger.honor();
            this.challenger.fate = 5;
            this.dreamer.fate = 5;
            this.dojiWhisperer.fate = 3;
            this.initiate.fate = 2;

            this.player2.claimRing('earth');
        });

        it('should not react if not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate],
                defenders: [this.dojiWhisperer],
                ring: 'air'
            });
            this.player2.pass();
            this.player1.clickCard(this.stance);
            this.player1.clickCard(this.initiate);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should react to playing a kiho and prompt you to choose a character with a status token and fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.dreamer],
                defenders: [this.dojiWhisperer, this.dreamer2],
                ring: 'air'
            });
            this.player2.pass();
            this.player1.clickCard(this.stance);
            this.player1.clickCard(this.initiate);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.dreamer);
            this.player1.clickCard(this.dreamer);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).toBeAbleToSelect(this.dreamer);
            expect(this.player1).not.toBeAbleToSelect(this.dreamer2);
            expect(this.player1).not.toBeAbleToSelect(this.initiate);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
        });

        it('should prompt you to choose an unclaimed ring and move a fate from the character to the ring', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.dreamer],
                defenders: [this.dojiWhisperer, this.dreamer2],
                ring: 'air'
            });
            let fate = this.dojiWhisperer.fate;
            let ringFate = this.game.rings.water.fate;

            this.player2.pass();
            this.player1.clickCard(this.stance);
            this.player1.clickCard(this.initiate);
            this.player1.clickCard(this.dreamer);
            this.player1.clickCard(this.dojiWhisperer);

            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('water');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).not.toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');

            this.player1.clickRing('water');

            expect(this.dojiWhisperer.fate).toBe(fate - 1);
            expect(this.game.rings.water.fate).toBe(ringFate + 1);

            expect(this.getChatLogs(5)).toContain('player1 uses Togashi Dreamer to move 1 fate from Doji Whisperer to Water Ring');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not react to playing a non-kiho', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.dreamer],
                defenders: [this.dojiWhisperer, this.dreamer2],
                ring: 'air'
            });
            this.player2.pass();
            this.player1.clickCard(this.lurk);
            this.player1.clickCard(this.initiate);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
