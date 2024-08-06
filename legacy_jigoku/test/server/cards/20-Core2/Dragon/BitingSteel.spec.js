const { GameModes } = require('../../../../build/GameModes');

describe('Bitting Steel', function () {
    integration(function () {
        describe('Duel Effect', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['akodo-makoto']
                    },
                    player2: {
                        inPlay: ['mirumoto-raitsugu', 'miya-mystic'],
                        hand: ['biting-steel', 'fine-katana']
                    },
                    gameMode: GameModes.Emerald
                });

                this.makoto = this.player1.findCardByName('akodo-makoto');

                this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
                this.bitingSteel = this.player2.findCardByName('biting-steel');
                this.katana = this.player2.findCardByName('fine-katana');
            });

            it("shouldn't attach if you don't have a weapon", function () {
                this.player1.pass();
                expect(this.player2).toHavePrompt('Action Window');
                this.player2.clickCard(this.bitingSteel);
                expect(this.player2).toHavePrompt('Action Window');
            });

            it('contributes to duel', function () {
                this.player1.pass();
                this.player2.playAttachment(this.katana, this.raitsugu);
                this.player1.pass();
                this.player2.playAttachment(this.bitingSteel, this.raitsugu);

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.makoto],
                    defenders: [this.raitsugu]
                });

                this.player2.clickCard(this.raitsugu);
                this.player2.clickCard(this.makoto);
                expect(this.player2).toHavePrompt('Any reactions?');

                this.player2.clickCard(this.bitingSteel);
                expect(this.player2).toHavePrompt('Choose an attachment');
                expect(this.player2).toBeAbleToSelect(this.katana);
                expect(this.player2).not.toBeAbleToSelect(this.bitingSteel);

                this.player2.clickCard(this.katana);
                expect(this.getChatLogs(5)).toContain(
                    'player2 uses Biting Steel to add the skill bonus of Fine Katana (2) to their duel total'
                );

                expect(this.player1).toHavePrompt('Honor Bid');

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('Mirumoto Raitsugu: 6 vs 5: Akodo Makoto');
            });
        });

        describe('Conflict Action', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-challenger', 'doji-kuwanan']
                    },
                    player2: {
                        inPlay: ['doomed-shugenja', 'enlightened-warrior'],
                        hand: ['biting-steel', 'fine-katana']
                    }
                });

                this.challenger = this.player1.findCardByName('doji-challenger');
                this.kuwanan = this.player1.findCardByName('doji-kuwanan');

                this.doomed = this.player2.findCardByName('doomed-shugenja');
                this.warrior = this.player2.findCardByName('enlightened-warrior');
                this.bitingSteel = this.player2.findCardByName('biting-steel');
                this.fineKatana = this.player2.findCardByName('fine-katana');

                this.player1.pass();
                this.player2.playAttachment(this.fineKatana, this.warrior);
                this.player1.pass();
                this.player2.playAttachment(this.bitingSteel, this.warrior);
            });

            it('gets bonus and send opponent home with affinity', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger, this.kuwanan],
                    defenders: [this.warrior, this.doomed]
                });

                this.player2.clickCard(this.bitingSteel);
                expect(this.player2).toHavePrompt('Choose a character');
                expect(this.player2).toBeAbleToSelect(this.challenger);
                expect(this.player2).not.toBeAbleToSelect(this.kuwanan);
                expect(this.player2).not.toBeAbleToSelect(this.warrior);
                expect(this.player2).not.toBeAbleToSelect(this.doomed);

                this.player2.clickCard(this.challenger);
                expect(this.challenger.isParticipating()).toBe(false);
                expect(this.getChatLogs(5)).toContain('player2 uses Biting Steel to send Doji Challenger home');
            });
        });
    });
});