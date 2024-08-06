describe('Mantra of Void', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['solemn-scholar', 'isawa-kaede']
                },
                player2: {
                    inPlay: ['child-of-the-plains', 'togashi-mitsu', 'kakita-toshimoko'],
                    hand: ['mantra-of-void', 'tattooed-wanderer', 'dragon-tattoo', 'talisman-of-the-sun'],
                    conflictDiscard: ['mantra-of-void']
                }
            });
            this.mantra = this.player2.findCardByName('mantra-of-void', 'hand');
            this.mantra2 = this.player2.findCardByName('mantra-of-void', 'conflict discard pile');
            this.tatooedWanderer = this.player2.findCardByName('tattooed-wanderer');
            this.dragonTattoo = this.player2.findCardByName('dragon-tattoo');
            this.talisman = this.player2.findCardByName('talisman-of-the-sun');
            this.childOfThePlains = this.player2.findCardByName('child-of-the-plains');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.mitsu = this.player2.findCardByName('togashi-mitsu');
        });

        it('it should trigger when the void ring is contested', function () {
            this.noMoreActions();
            this.initiateConflict({
                ring: 'void',
                attackers: ['solemn-scholar']
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.mantra);
        });

        it('it should not trigger when another ring is contested', function () {
            this.noMoreActions();
            this.initiateConflict({
                ring: 'earth',
                attackers: ['solemn-scholar']
            });
            expect(this.player2).toHavePrompt('Choose Defenders');
        });

        it('it should trigger when void is given to the contested ring', function () {
            this.noMoreActions();
            this.initiateConflict({
                ring: 'earth',
                attackers: ['isawa-kaede']
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.mantra);
        });

        it('it should allow you to target a monk or a character with a monk attachment', function () {
            this.player1.pass();
            this.player2.clickCard(this.tatooedWanderer);
            this.player2.clickPrompt('Play Tattooed Wanderer as an attachment');
            this.player2.clickCard(this.childOfThePlains);
            this.noMoreActions();

            this.initiateConflict({
                ring: 'void',
                attackers: ['solemn-scholar']
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.mantra);
            this.player2.clickCard(this.mantra);
            expect(this.player2).toBeAbleToSelect(this.childOfThePlains);
            expect(this.player2).toBeAbleToSelect(this.mitsu);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
        });

        it('it should draw a card', function () {
            this.noMoreActions();
            this.initiateConflict({
                ring: 'void',
                attackers: ['solemn-scholar']
            });
            let hand = this.player2.hand.length;
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.mantra);
            this.player2.clickCard(this.mantra);
            this.player2.clickCard(this.mitsu);
            this.player2.clickPrompt('Done');
            expect(this.player2).toHavePrompt('Conflict Action Window');
            expect(this.player2.hand.length).toBe(hand); //-1 from mantra, +1 from drawing
        });

        describe('Cost Reduction', function () {
            beforeEach(function () {
                this.noMoreActions();
                this.initiateConflict({
                    ring: 'void',
                    attackers: ['solemn-scholar']
                });
                this.player2.clickCard(this.mantra);
                this.player2.clickCard(this.mitsu);
                this.player2.clickCard(this.mitsu);
                this.player2.clickPrompt('Done');
                this.fate = this.player2.fate;
            });

            it('it should reduce the costs to play attachments', function () {
                this.player2.playAttachment(this.dragonTattoo, this.mitsu);
                expect(this.player2.fate).toBe(this.fate - 1);
            });

            it('it should reduce the costs to play multiple attachments', function () {
                this.player2.playAttachment(this.dragonTattoo, this.mitsu);
                this.player1.pass();
                this.player2.playAttachment(this.talisman, this.mitsu);
                expect(this.player2.fate).toBe(this.fate - 1);
            });

            it('it should reduce the costs to monks as attachments', function () {
                this.player2.clickCard(this.tatooedWanderer);
                this.player2.clickPrompt('Play Tattooed Wanderer as an attachment');
                this.player2.clickCard(this.mitsu);
                expect(this.player2.fate).toBe(this.fate);
            });

            it('it should not reduce the cost to play on other characters', function () {
                this.player2.playAttachment(this.dragonTattoo, this.toshimoko);
                expect(this.player2.fate).toBe(this.fate - 2);
            });

            it('reduction should end at the end of the conflict', function () {
                this.player2.playAttachment(this.dragonTattoo, this.mitsu);
                this.noMoreActions();
                this.player1.pass();
                this.player2.playAttachment(this.talisman, this.mitsu);
                expect(this.player2.fate).toBe(this.fate - 2);
            });
        });

        it('cost reduction should stack', function () {
            let fate = this.player2.fate;
            this.player2.moveCard(this.mantra2, 'hand');
            this.noMoreActions();
            this.initiateConflict({
                ring: 'void',
                attackers: ['solemn-scholar']
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.mantra);
            this.player2.clickCard(this.mantra);
            this.player2.clickCard(this.mitsu);

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.mantra2);
            this.player2.clickCard(this.mantra2);
            this.player2.clickCard(this.mitsu);
            this.player2.clickPrompt('Done');

            this.player2.playAttachment(this.dragonTattoo, this.mitsu);
            expect(this.player2.fate).toBe(fate);
        });

        it('chat messages', function () {
            this.player2.moveCard(this.mantra2, 'hand');
            this.noMoreActions();
            this.initiateConflict({
                ring: 'void',
                attackers: ['solemn-scholar']
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.mantra);
            this.player2.clickCard(this.mantra);
            this.player2.clickCard(this.mitsu);

            expect(this.getChatLogs(10)).toContain('player2 plays Mantra of Void to reduce the cost of attachments they play on Togashi Mitsu this conflict by 1 and draw a card');
        });
    });
});
