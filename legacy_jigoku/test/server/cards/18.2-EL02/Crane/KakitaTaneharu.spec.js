describe('Kakita Taneharu', function () {
    integration(function () {
        describe('Constant ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['brash-samurai', 'kakita-taneharu'],
                        conflictDiscard: [
                            'assassination',
                            'let-go',
                            'a-new-name',
                            'voice-of-honor',
                            'ornate-fan',
                            'seal-of-the-crane',
                            'fine-katana',
                            'ready-for-battle',
                            'defend-your-honor'
                        ],
                        hand: ['way-of-the-crane', 'charge']
                    },
                    player2: {
                        inPlay: ['solemn-scholar'],
                        hand: ['mirumoto-s-fury', 'cloud-the-mind', 'mark-of-shame', 'i-can-swim']
                    }
                });

                this.player1.player.showBid = 1;
                this.player2.player.showBid = 5;

                this.uji = this.player1.findCardByName('kakita-taneharu');

                this.player1.reduceDeckToNumber('conflict deck', 0);
                this.assassination = this.player1.moveCard('assassination', 'conflict deck');
                this.letGo = this.player1.moveCard('let-go', 'conflict deck');
                this.dyh = this.player1.moveCard('defend-your-honor', 'conflict deck');
                this.ann = this.player1.moveCard('a-new-name', 'conflict deck');
                this.fan = this.player1.moveCard('ornate-fan', 'conflict deck');
                this.katana = this.player1.moveCard('fine-katana', 'conflict deck');
                this.seal = this.player1.moveCard('seal-of-the-crane', 'conflict deck');
                this.readyForBattle = this.player1.moveCard('ready-for-battle', 'conflict deck');
                this.voice = this.player1.moveCard('voice-of-honor', 'conflict deck');
                this.way = this.player1.findCardByName('way-of-the-crane');

                this.charge = this.player1.findCardByName('charge');
                this.brash = this.player1.findCardByName('brash-samurai');
                this.scholar = this.player2.findCardByName('solemn-scholar');
                this.cloud = this.player2.findCardByName('cloud-the-mind');
                this.fury = this.player2.findCardByName('mirumoto-s-fury');

                this.swim = this.player2.findCardByName('i-can-swim');
                this.mos = this.player2.findCardByName('mark-of-shame');

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.brash, this.uji],
                    defenders: [this.scholar],
                    type: 'military'
                });
            });

            it('should put a card underneath himself', function () {
                this.player2.pass();
                this.player1.clickCard(this.uji);
                expect(this.player1).toHavePromptButton('Voice of Honor');
                expect(this.player1).toHavePromptButton('Ready for Battle');
                expect(this.player1).toHavePromptButton('Seal of the Crane');
                expect(this.player1).toHavePromptButton('Fine Katana');
                this.player1.clickPrompt('Ready for Battle');
                expect(this.readyForBattle.location).toBe(this.uji.uuid);
                expect(this.getChatLogs(5)).toContain('player1 puts a card underneath Kakita Taneharu');
            });

            it('should allow you to play cards from under Uji', function () {
                this.player2.pass();
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('Fine Katana');
                this.player2.pass();
                expect(this.player1.player.additionalPiles[this.uji.uuid].cards).toContain(this.katana);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.katana);
                expect(this.player1).toHavePrompt('Fine Katana');
                this.player1.clickCard(this.uji);
                expect(this.uji.attachments).toContain(this.katana);
                expect(this.player1.player.additionalPiles[this.uji.uuid].cards).not.toContain(this.katana);
            });

            it('should allow you to play cards from under Uji - reactions', function () {
                this.game.rings.earth.claimRing(this.player2);
                this.player2.pass();
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('Ready for Battle');
                this.player2.clickCard(this.scholar);
                this.player2.clickCard(this.uji);
                expect(this.uji.bowed).toBe(true);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.readyForBattle);
                this.player1.clickCard(this.readyForBattle);
                expect(this.uji.bowed).toBe(false);
                expect(this.getChatLogs(10)).toContain(
                    'player1 plays Ready for Battle from their cards set aside by Kakita Taneharu'
                );
            });

            it('should allow you to play cards from under Uji - interrupts', function () {
                this.game.rings.earth.claimRing(this.player2);
                this.player2.pass();
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('Voice of Honor');
                this.player2.pass();
                this.player1.clickCard(this.way);
                this.player1.clickCard(this.uji);
                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.uji);
                expect(this.uji.bowed).toBe(false);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.voice);
                this.player1.clickCard(this.voice);
                expect(this.uji.bowed).toBe(false);
                expect(this.getChatLogs(10)).toContain(
                    'player1 plays Voice of Honor from their cards set aside by Kakita Taneharu'
                );
            });

            it('should not allow you to play cards from under Uji if he\'s blanked', function () {
                this.game.rings.earth.claimRing(this.player2);
                this.player2.pass();
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('Voice of Honor');
                this.player2.playAttachment(this.cloud, this.uji);
                this.player1.clickCard(this.way);
                this.player1.clickCard(this.uji);
                expect(this.uji.attachments).toContain(this.cloud);
                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.uji);
                expect(this.uji.bowed).toBe(true);
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).not.toBeAbleToSelect(this.voice);
            });

            it('should remove cards under Uji from the game if he leaves play', function () {
                this.player2.pass();
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('Ready for Battle');

                this.player2.pass();
                this.player1.clickCard(this.way);
                this.player1.clickCard(this.uji);
                expect(this.readyForBattle.anyEffect('hideWhenFaceUp')).toBe(true);
                this.player2.clickCard(this.mos);
                this.player2.clickCard(this.uji);
                this.player2.clickCard(this.mos);

                this.player1.pass();

                this.player2.clickCard(this.swim);
                this.player2.clickCard(this.uji);

                expect(this.uji.location).toBe('dynasty discard pile');
                expect(this.readyForBattle.location).toBe('removed from game');
                expect(this.readyForBattle.anyEffect('hideWhenFaceUp')).toBe(false);

                expect(this.getChatLogs(10)).toContain(
                    'Ready for Battle is removed from the game due to Kakita Taneharu leaving play'
                );
            });

            it('should not allow opponent to play cards', function () {
                this.player2.pass();
                this.player1.clickCard(this.uji);
                this.player1.clickPrompt('Fine Katana');

                this.player2.pass();
                this.player1.clickCard(this.way);
                this.player1.clickCard(this.uji);
                expect(this.player1.player.additionalPiles[this.uji.uuid].cards).toContain(this.katana);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.katana);
                expect(this.player2).not.toHavePrompt('Fine Katana');
            });

            it('should not work outside of a conflict', function () {
                this.noMoreActions();
                this.player1.clickPrompt('No');
                this.player1.clickPrompt('Don\'t resolve');

                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.uji);
                expect(this.player1).toHavePrompt('Action Window');
            });
        });
    });
});
