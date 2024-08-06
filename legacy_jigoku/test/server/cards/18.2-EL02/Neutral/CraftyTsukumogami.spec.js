const { GameModes } = require('../../../../build/GameModes');

describe('Crafty Tsukumogami', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['crafty-tsukumogami', 'crafty-tsukumogami', 'doji-challenger'],
                    hand: ['i-can-swim', 'way-of-the-scorpion', 'fine-katana']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'crafty-tsukumogami'],
                    hand: ['a-fate-worse-than-death', 'way-of-the-crane']
                },
                gameMode: GameModes.Emerald
            });

            this.crafty = this.player1.filterCardsByName('crafty-tsukumogami')[0];
            this.crafty2 = this.player1.filterCardsByName('crafty-tsukumogami')[1];
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.swim = this.player1.findCardByName('i-can-swim');
            this.scorpion = this.player1.findCardByName('way-of-the-scorpion');
            this.katana = this.player1.findCardByName('fine-katana');

            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.afwtd = this.player2.findCardByName('a-fate-worse-than-death');
            this.crane = this.player2.findCardByName('way-of-the-crane');
            this.craftyp2 = this.player2.findCardByName('crafty-tsukumogami');
        });

        it('should let you choose a ring', function() {
            this.player1.clickCard(this.crafty);
            expect(this.player1).toHavePrompt('Choose a ring to attach to');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('water');
            expect(this.player1).toBeAbleToSelectRing('void');
        });

        it('should attach to the ring', function() {
            this.player1.clickCard(this.crafty);
            this.player1.clickRing('fire');
            expect(this.game.rings['fire'].attachments).toContain(this.crafty);
            expect(this.crafty.getType()).toBe('attachment');
        });

        it('should remove attachments, status tokens, fate, and no longer count skill in a conflict', function() {
            this.crafty.fate = 5;
            this.crafty.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.crafty],
                defenders: [this.whisperer],
                type: 'political',
                ring: 'air'
            });

            this.player2.pass();
            this.player1.playAttachment(this.katana, this.crafty);
            expect(this.getChatLogs(10)).toContain('Political Air conflict - Attacker: 1 Defender: 3');
            this.player2.pass();

            this.player1.clickCard(this.crafty);
            this.player1.clickRing('fire');
            expect(this.game.rings['fire'].attachments).toContain(this.crafty);
            expect(this.crafty.getType()).toBe('attachment');
            expect(this.crafty.fate).toBe(0);
            expect(this.crafty.isHonored).toBe(false);
            expect(this.crafty.isDishonored).toBe(false);
            expect(this.katana.location).toBe('conflict discard pile');

            expect(this.getChatLogs(10)).toContain('player1 uses Crafty Tsukumogami to attach itself to the Fire Ring');
            expect(this.getChatLogs(10)).toContain('Fine Katana is discarded from Crafty Tsukumogami as it is no longer legally attached');
            expect(this.getChatLogs(5)).toContain('Political Air conflict - Attacker: 0 Defender: 3');
            expect(this.getChatLogs(5)).not.toContain('Political Air conflict - Attacker: 1 Defender: 3');
        });

        it('should force players who attack with the ring to discard a card', function() {
            this.player1.clickCard(this.crafty);
            this.player1.clickRing('fire');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                ring: 'fire'
            });
            expect(this.player1).toHavePrompt('Choose a card to discard');
            expect(this.player1).toBeAbleToSelect(this.swim);
            expect(this.player1).toBeAbleToSelect(this.scorpion);

            this.player1.clickCard(this.swim);
            expect(this.getChatLogs(5)).toContain('player1 uses Crafty Tsukumogami to make player1 discard 1 cards');
            expect(this.getChatLogs(5)).toContain('player1 discards I Can Swim');
        });

        it('should do nothing if you attack with another ring', function() {
            this.player1.clickCard(this.crafty);
            this.player1.clickRing('fire');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger],
                ring: 'air'
            });
            expect(this.player2).toHavePrompt('Choose defenders');
        });

        it('should force players who attack with the ring to discard a card', function() {
            this.player1.clickCard(this.crafty);
            this.player1.clickRing('fire');
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whisperer],
                ring: 'fire'
            });
            expect(this.player2).toHavePrompt('Choose a card to discard');
            expect(this.player2).toBeAbleToSelect(this.afwtd);
            expect(this.player2).toBeAbleToSelect(this.crane);

            this.player2.clickCard(this.crane);
            expect(this.getChatLogs(5)).toContain('player1 uses Crafty Tsukumogami to make player2 discard 1 cards');
            expect(this.getChatLogs(5)).toContain('player2 discards Way of the Crane');
        });

        it('should allow selecting a different ring if you already have one attached to a ring', function() {
            this.player1.clickCard(this.crafty);
            this.player1.clickRing('fire');
            expect(this.game.rings['fire'].attachments).toContain(this.crafty);

            this.player2.clickCard(this.craftyp2);
            this.player2.clickRing('air');
            expect(this.game.rings['air'].attachments).toContain(this.craftyp2);

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.crafty2);
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('water');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
        });
    });
});
