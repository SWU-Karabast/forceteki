describe('Chain of Command', function() {
    integration(function() {
        describe('Ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['brash-samurai', 'kakita-toshimoko', 'daidoji-uji', 'doji-challenger'],
                        hand: ['chain-of-command', 'sharpen-the-mind']
                    },
                    player2: {
                        inPlay: ['naive-student','doji-kuwanan'],
                        hand: ['voice-of-honor', 'way-of-the-crane']
                    }
                });
                this.brashSamurai = this.player1.findCardByName('brash-samurai');
                this.brashSamurai.bowed = false;
                this.kakitaToshimoko = this.player1.findCardByName('kakita-toshimoko');
                this.kakitaToshimoko.bowed = false;
                this.daidojiUji = this.player1.findCardByName('daidoji-uji');
                this.daidojiUji.bowed = true;
                this.dojiChallenger = this.player1.findCardByName('doji-challenger');
                this.dojiChallenger.bowed = true;

                this.service = this.player1.findCardByName('chain-of-command', 'hand');
                this.sharpenTheMind = this.player1.findCardByName('sharpen-the-mind');

                this.naiveStudent = this.player2.findCardByName('naive-student');
                this.naiveStudent.bowed = false;
                this.dojiKuwanan = this.player2.findCardByName('doji-kuwanan');
                this.dojiKuwanan.bowed = true;
            });

            it('should bow a non-unique to stand a unique and remove from game', function() {
                this.player1.clickCard(this.service);
                expect(this.player1).toHavePrompt('Choose a unique character');
                expect(this.player1).not.toBeAbleToSelect(this.brashSamurai);
                expect(this.player1).not.toBeAbleToSelect(this.kakitaToshimoko);
                expect(this.player1).toBeAbleToSelect(this.daidojiUji);
                expect(this.player1).not.toBeAbleToSelect(this.dojiChallenger);
                expect(this.player1).not.toBeAbleToSelect(this.naiveStudent);
                expect(this.player1).toBeAbleToSelect(this.dojiKuwanan);

                expect(this.daidojiUji.bowed).toBe(true);
                this.player1.clickCard(this.daidojiUji);

                expect(this.brashSamurai.bowed).toBe(false);
                expect(this.player1).toHavePrompt('Select card to bow');
                expect(this.player1).toBeAbleToSelect(this.brashSamurai);
                expect(this.player1).not.toBeAbleToSelect(this.kakitaToshimoko);
                expect(this.player1).not.toBeAbleToSelect(this.daidojiUji);
                expect(this.player1).not.toBeAbleToSelect(this.dojiChallenger);
                expect(this.player1).not.toBeAbleToSelect(this.naiveStudent);
                expect(this.player1).not.toBeAbleToSelect(this.dojiKuwanan);
                this.player1.clickCard(this.brashSamurai);
                expect(this.brashSamurai.bowed).toBe(true);
                expect(this.daidojiUji.bowed).toBe(false);
                expect(this.getChatLogs(5)).toContain('player1 plays Chain of Command, bowing Brash Samurai to ready Daidoji Uji');
                expect(this.getChatLogs(5)).toContain('Chain of Command is removed from the game due the effects of Chain of Command');
            });

            it('should remove from the game if cancelled', function() {
                this.player1.pass();
                this.player2.clickCard('way-of-the-crane');
                this.player2.clickCard(this.dojiKuwanan);
                expect(this.dojiKuwanan.isHonored).toBe(true);
                this.player1.clickCard(this.service);
                this.player1.clickCard(this.daidojiUji);
                this.player1.clickCard(this.brashSamurai);

                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect('voice-of-honor');
                this.player2.clickCard('voice-of-honor');
                expect(this.player2).toHavePrompt('Action Window');
                expect(this.daidojiUji.bowed).toBe(true);
                expect(this.brashSamurai.bowed).toBe(true);
                expect(this.service.location).toBe('removed from game');
                expect(this.getChatLogs(5)).toContain('Chain of Command is removed from the game due the effects of Chain of Command');
            });

            it('should be playable from discard and remove from game', function() {
                this.player1.playAttachment(this.sharpenTheMind, this.brashSamurai);
                this.noMoreActions();

                this.initiateConflict({
                    type: 'military',
                    attackers: [this.brashSamurai],
                    defenders: []
                });

                this.player2.pass();

                this.player1.clickCard(this.sharpenTheMind);
                this.player1.clickCard(this.service);
                this.player2.pass();
                this.player1.clickCard(this.service);
                this.player1.clickCard(this.daidojiUji);
                this.player1.clickCard(this.brashSamurai);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.daidojiUji.bowed).toBe(false);
                expect(this.brashSamurai.bowed).toBe(true);
                expect(this.service.location).toBe('removed from game');
            });
        });

        describe('Special Interactions (From Hand)', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['guest-of-honor','master-of-gisei-toshi','utaku-tetsuko','akodo-toturi-2']
                    },
                    player2: {
                        fate: 30,
                        inPlay: ['doji-hotaru', 'doji-challenger'],
                        hand: ['chain-of-command']
                    }
                });
                this.hotaru = this.player2.findCardByName('doji-hotaru');
                this.dojiChallenger = this.player2.findCardByName('doji-challenger');
                this.service = this.player2.findCardByName('chain-of-command');
                this.hotaru.bowed = true;

                this.GoH = this.player1.findCardByName('guest-of-honor');
                this.MoGT = this.player1.findCardByName('master-of-gisei-toshi');
                this.tetsuko = this.player1.findCardByName('utaku-tetsuko');
                this.toturi = this.player1.findCardByName('akodo-toturi-2');
                this.player1.player.imperialFavor = 'political';

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                this.noMoreActions();
                this.player1.clickCard(this.MoGT);
                this.player1.clickRing('fire');

                this.noMoreActions();
            });

            it('GoH - should not be playable from hand', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.GoH],
                    defenders: [this.dojiChallenger]
                });

                this.player2.clickCard(this.service);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('Tetsuko - should increase cost from hand', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tetsuko],
                    defenders: [this.dojiChallenger]
                });

                this.player2.clickCard(this.service);
                this.player2.clickCard(this.hotaru);
                this.player2.clickCard(this.dojiChallenger);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.player2.fate).toBe(29);
            });

            it('Toturi2 - should not be playable from hand', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.toturi],
                    defenders: [this.dojiChallenger]
                });

                this.player2.pass();
                this.player1.clickCard(this.toturi);
                this.player2.clickCard(this.service);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('MoGT - should not be playable from hand', function() {
                this.initiateConflict({
                    type: 'military',
                    ring: 'fire',
                    attackers: [this.MoGT],
                    defenders: [this.dojiChallenger]
                });

                this.player2.clickCard(this.service);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });
        });

        describe('Special Interactions (From Discard)', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'draw',
                    player1: {
                        inPlay: ['guest-of-honor','master-of-gisei-toshi','utaku-tetsuko','akodo-toturi-2']
                    },
                    player2: {
                        fate: 30,
                        inPlay: ['doji-hotaru', 'doji-challenger'],
                        conflictDiscard: ['chain-of-command']
                    }
                });
                this.hotaru = this.player2.findCardByName('doji-hotaru');
                this.dojiChallenger = this.player2.findCardByName('doji-challenger');
                this.service = this.player2.findCardByName('chain-of-command');
                this.hotaru.bowed = true;

                this.GoH = this.player1.findCardByName('guest-of-honor');
                this.MoGT = this.player1.findCardByName('master-of-gisei-toshi');
                this.tetsuko = this.player1.findCardByName('utaku-tetsuko');
                this.toturi = this.player1.findCardByName('akodo-toturi-2');

                this.player1.player.imperialFavor = 'political';
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                this.noMoreActions();
                this.player1.clickCard(this.MoGT);
                this.player1.clickRing('fire');

                this.noMoreActions();
            });

            it('GoH - should not be playable from discard', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.GoH],
                    defenders: [this.dojiChallenger]
                });

                this.player2.clickCard(this.service);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('Tetsuko - should not increase cost from discard', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.tetsuko],
                    defenders: [this.dojiChallenger]
                });
                let fate = this.player2.fate;
                this.player2.clickCard(this.service);
                this.player2.clickCard(this.hotaru);
                this.player2.clickCard(this.dojiChallenger);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.player2.fate).toBe(fate);
            });

            it('Toturi2 - should be playable from discard', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.toturi],
                    defenders: [this.dojiChallenger]
                });

                expect(this.hotaru.bowed).toBe(true);
                this.player2.pass();
                this.player1.clickCard(this.toturi);
                this.player2.clickCard(this.service);
                this.player2.clickCard(this.hotaru);
                this.player2.clickCard(this.dojiChallenger);
                expect(this.hotaru.bowed).toBe(false);
            });

            it('MoGT - should not be playable from discard', function() {
                this.initiateConflict({
                    type: 'military',
                    ring: 'fire',
                    attackers: [this.MoGT],
                    defenders: [this.dojiChallenger]
                });

                this.player2.clickCard(this.service);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
