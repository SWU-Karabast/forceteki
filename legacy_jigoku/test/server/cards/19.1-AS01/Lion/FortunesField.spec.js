const { GameModes } = require('../../../../../build/GameModes');

describe('Fortunes Field', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    fate: 30,
                    dynastyDiscard: ['kakita-yoshi', 'kakita-toshimoko', 'daidoji-kageyu', 'moto-chagatai'],
                    hand: ['ageless-crone', 'dutiful-assistant', 'watch-commander'],
                    provinces: ['fortune-s-field', 'manicured-garden']
                },
                gameMode: GameModes.Emerald
            });

            this.field = this.player1.findCardByName('fortune-s-field', 'province 1');
            this.manicured = this.player1.findCardByName('manicured-garden', 'province 2');
            this.yoshi = this.player1.placeCardInProvince('kakita-yoshi', this.field.location);
            this.toshimoko = this.player1.placeCardInProvince('kakita-toshimoko', 'province 2');
            this.kageyu = this.player1.moveCard('daidoji-kageyu', this.field.location);
            this.chagatai = this.player1.moveCard('moto-chagatai', this.field.location);
            this.crone = this.player1.findCardByName('ageless-crone');
            this.assistant = this.player1.findCardByName('dutiful-assistant');
            this.commander = this.player1.findCardByName('watch-commander');
        });

        it('should react after playing a character from self', function () {
            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('0');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.field);
            this.player1.clickCard(this.field);
            expect(this.getChatLogs(5)).toContain(
                "player1 uses Fortune's Field to reduce the cost of their next character or follower this round by 1"
            );
        });

        it('should react after playing a character from another province', function () {
            this.player1.clickCard(this.toshimoko);
            this.player1.clickPrompt('0');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.field);
        });

        xit('should react after playing a character from hand (dynasty)', function () {
            this.player1.clickCard(this.crone);
            this.player1.clickPrompt('0');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.field);
        });

        it('reduces next character', function () {
            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.field);
            this.player2.pass();

            let fate = this.player1.fate;
            let cost = this.toshimoko.printedCost;

            this.player1.clickCard(this.toshimoko);
            this.player1.clickPrompt('0');
            expect(this.player1.fate).toBe(fate - (cost - 1));

            fate = this.player1.fate;
            cost = this.chagatai.printedCost;

            this.player1.clickCard(this.chagatai);
            this.player1.clickPrompt('0');
            expect(this.player1.fate).toBe(fate - cost);
        });

        xit('reduces next follower', function () {
            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.field);
            this.player2.pass();

            let fate = this.player1.fate;
            let cost = this.assistant.printedCost;

            this.player1.clickCard(this.assistant);
            this.player1.clickCard(this.yoshi);
            expect(this.player1.fate).toBe(fate - (cost - 1));

            fate = this.player1.fate;
            cost = this.commander.printedCost;

            this.player1.clickCard(this.commander);
            this.player1.clickCard(this.yoshi);
            expect(this.player1.fate).toBe(fate - cost);
        });

        it('reduction should carry into the next phase', function () {
            this.player1.clickCard(this.yoshi);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.field);
            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            let fate = this.player1.fate;
            let cost = this.crone.printedCost;

            this.player1.clickCard(this.crone);
            this.player1.clickPrompt('0');
            expect(this.player1.fate).toBe(fate - (cost - 1));

            expect(this.crone.location).toBe('play area');
            this.player2.pass();

            fate = this.player1.fate;
            cost = this.commander.printedCost;

            this.player1.clickCard(this.commander);
            this.player1.clickCard(this.yoshi);
            expect(this.player1.fate).toBe(fate - cost);
            expect(this.commander.location).toBe('play area');
        });
    });
});
