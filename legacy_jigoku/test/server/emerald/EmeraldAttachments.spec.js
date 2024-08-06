const { GameModes } = require('../../build/GameModes');

describe('Attachments - Emerald', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-mitsu', 'doji-challenger'],
                    hand: ['fine-katana', 'fine-katana', 'a-new-name']
                },
                player2: {
                    inPlay: ['hantei-sotorii'],
                    hand: ['fine-katana']
                },
                gameMode: GameModes.Emerald
            });

            this.mitsu = this.player1.findCardByName('togashi-mitsu');
            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.challenger = this.player1.findCardByName('doji-challenger');

            this.katana1 = this.player1.filterCardsByName('fine-katana')[0];
            this.katana2 = this.player1.filterCardsByName('fine-katana')[1];
            this.katana3 = this.player2.findCardByName('fine-katana');
            this.ann = this.player1.findCardByName('a-new-name');
        });

        it('should not let you attach two of the same attachment to the same character from the same controller', function () {
            this.player1.clickCard(this.katana1);
            expect(this.player1).toBeAbleToSelect(this.mitsu);
            expect(this.player1).toBeAbleToSelect(this.sotorii);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.mitsu);
            expect(this.mitsu.attachments).toContain(this.katana1);

            this.player2.clickCard(this.katana3);
            expect(this.player2).toBeAbleToSelect(this.mitsu);
            expect(this.player2).toBeAbleToSelect(this.sotorii);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            this.player2.clickCard(this.challenger);

            this.player1.clickCard(this.katana2);
            expect(this.player1).not.toBeAbleToSelect(this.mitsu);
            expect(this.player1).toBeAbleToSelect(this.sotorii);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.mitsu);
            expect(this.mitsu.attachments).toContain(this.katana1);
            expect(this.mitsu.attachments).not.toContain(this.katana2);
            expect(this.player1).toHavePrompt('Fine Katana');
        });

        it('should let you attach two of the same attachment to the same character from different controllers', function () {
            this.player1.clickCard(this.katana1);
            expect(this.player1).toBeAbleToSelect(this.mitsu);
            expect(this.player1).toBeAbleToSelect(this.sotorii);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.mitsu);
            expect(this.mitsu.attachments).toContain(this.katana1);

            this.player2.clickCard(this.katana3);
            expect(this.player2).toBeAbleToSelect(this.mitsu);
            expect(this.player2).toBeAbleToSelect(this.sotorii);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            this.player2.clickCard(this.mitsu);

            this.player1.clickCard(this.katana2);
            expect(this.player1).not.toBeAbleToSelect(this.mitsu);
            expect(this.player1).toBeAbleToSelect(this.sotorii);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.mitsu);
            expect(this.mitsu.attachments).toContain(this.katana1);
            expect(this.mitsu.attachments).toContain(this.katana3);
            expect(this.mitsu.attachments).not.toContain(this.katana2);
            expect(this.player1).toHavePrompt('Fine Katana');
        });

        it('should let you attach two different attachments to the same character', function () {
            this.player1.clickCard(this.katana1);
            expect(this.player1).toBeAbleToSelect(this.mitsu);
            expect(this.player1).toBeAbleToSelect(this.sotorii);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.mitsu);
            expect(this.mitsu.attachments).toContain(this.katana1);

            this.player2.pass();

            this.player1.clickCard(this.ann);
            expect(this.player1).toBeAbleToSelect(this.mitsu);
            expect(this.player1).toBeAbleToSelect(this.sotorii);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.mitsu);
            expect(this.mitsu.attachments).toContain(this.ann);
        });
    });
});

describe('Attachments - Emerald Solider Token', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'spiritcaller-prodigy'],
                    stronghold: ['pride'],
                    dynastyDiscard: ['noble-vanguard']
                },
                gameMode: GameModes.Emerald
            });

            this.challenger = this.player1.findCardByName('doji-challenger');

            this.pride = this.player1.findCardByName('pride');
            this.spiritcaller = this.player1.findCardByName('spiritcaller-prodigy');
            this.vanguard = this.player1.findCardByName('noble-vanguard');
        });

        it('should let you attach two soldiers to the same character', function () {
            this.player1.clickCard(this.pride);
            this.player1.clickCard(this.challenger);
            this.player2.pass();
            this.player1.clickCard(this.spiritcaller);
            this.player1.clickCard(this.vanguard);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.vanguard);
            expect(this.player1).toBeAbleToSelect(this.vanguard);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.challenger);

            const attachments = this.challenger.attachments;
            expect(attachments.length).toBe(2);
            expect(attachments[0].id).toBe('soldier');
            expect(attachments[1].id).toBe('soldier');
        });
    });
});
