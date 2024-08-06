describe('Favorable Alliance', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi'],
                    hand: ['favorable-alliance'],
                    conflictDiscard: [
                        'voice-of-honor',
                        'fine-katana',
                        'height-of-fashion',
                        'ornate-fan',
                        'way-of-the-crane',
                        'political-rival'
                    ]
                },
                player2: {
                    inPlay: ['utaku-tetsuko'],
                    hand: ['mirumoto-s-fury'],
                    provinces: ['blood-of-onnotangu', 'manicured-garden']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.alliance = this.player1.findCardByName('favorable-alliance');

            this.voice = this.player1.findCardByName('voice-of-honor');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fashion = this.player1.findCardByName('height-of-fashion');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.crane = this.player1.findCardByName('way-of-the-crane');
            this.rival = this.player1.findCardByName('political-rival');

            this.tetsuko = this.player2.findCardByName('utaku-tetsuko');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.blood = this.player2.findCardByName('blood-of-onnotangu');
            this.garden = this.player2.findCardByName('manicured-garden');

            this.player1.reduceDeckToNumber('conflict deck', 0);

            this.player1.moveCard(this.rival, 'conflict deck');
            this.player1.moveCard(this.crane, 'conflict deck');
            this.player1.moveCard(this.fan, 'conflict deck');
            this.player1.moveCard(this.fashion, 'conflict deck');
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player1.moveCard(this.voice, 'conflict deck');
        });

        it('should draw cards equal to the fate spent', function () {
            this.player1.fate = 4;
            let fate = this.player1.fate;
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.alliance);
            expect(this.player1).toHavePrompt('Choose a value for X');
            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).toHavePromptButton('2');
            expect(this.player1).toHavePromptButton('3');
            expect(this.player1).toHavePromptButton('4');
            this.player1.clickPrompt('3');
            expect(this.voice.location).toBe('removed from game');
            expect(this.katana.location).toBe('removed from game');
            expect(this.fashion.location).toBe('removed from game');

            expect(this.player1.hand.length).toBe(0);
            expect(this.getChatLogs(10)).toContain('player1 plays Favorable Alliance to set aside 3 cards');
            expect(this.getChatLogs(10)).toContain(
                'player1 sets aside the top 3 cards from their conflict deck: Voice of Honor, Fine Katana and Height of Fashion'
            );
            expect(this.player1.fate).toBe(fate - 3);
        });

        it('should work with Yoshi', function () {
            this.player1.fate = 2;
            this.player1.player.imperialFavor = 'military';
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'military',
                province: this.garden
            });

            this.player2.pass();
            this.player1.clickCard(this.yoshi);
            expect(this.voice.location).toBe('hand');
            expect(this.katana.location).toBe('hand');
            expect(this.fashion.location).toBe('hand');

            this.player1.moveCard(this.fashion, 'conflict deck');
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player1.moveCard(this.voice, 'conflict deck');

            this.player2.pass();

            let fate = this.player1.fate;
            this.player1.clickCard(this.alliance);
            expect(this.player1).toHavePrompt('Choose a value for X');
            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).toHavePromptButton('2');
            expect(this.player1).toHavePromptButton('3');
            expect(this.player1).toHavePromptButton('4');
            this.player1.clickPrompt('3');
            expect(this.voice.location).toBe('removed from game');
            expect(this.katana.location).toBe('removed from game');
            expect(this.fashion.location).toBe('removed from game');

            expect(this.player1.hand.length).toBe(0);
            expect(this.getChatLogs(10)).toContain('player1 plays Favorable Alliance to set aside 3 cards');
            expect(this.getChatLogs(10)).toContain(
                'player1 sets aside the top 3 cards from their conflict deck: Voice of Honor, Fine Katana and Height of Fashion'
            );
            expect(this.player1.fate).toBe(fate - 1);
        });

        it('should work with Blood of Onnotangu & Yoshi', function () {
            this.player1.fate = 6;
            this.player1.player.imperialFavor = 'military';
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'military',
                province: this.blood
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.alliance);
            expect(this.player1).toHavePrompt('Conflict Action Window');

            this.player1.clickCard(this.yoshi);
            expect(this.voice.location).toBe('hand');
            expect(this.katana.location).toBe('hand');
            expect(this.fashion.location).toBe('hand');

            this.player1.moveCard(this.fashion, 'conflict deck');
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player1.moveCard(this.voice, 'conflict deck');

            this.player2.pass();

            let fate = this.player1.fate;
            this.player1.clickCard(this.alliance);
            expect(this.player1).toHavePrompt('Choose a value for X');
            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).toHavePromptButton('2');
            expect(this.player1).not.toHavePromptButton('3');
            expect(this.player1).not.toHavePromptButton('4');
            this.player1.clickPrompt('2');
            expect(this.voice.location).toBe('removed from game');
            expect(this.katana.location).toBe('removed from game');

            expect(this.player1.hand.length).toBe(0);
            expect(this.getChatLogs(10)).toContain('player1 plays Favorable Alliance to set aside 2 cards');
            expect(this.getChatLogs(10)).toContain(
                'player1 sets aside the top 2 cards from their conflict deck: Voice of Honor and Fine Katana'
            );
            expect(this.player1.fate).toBe(fate);
        });

        it('should work with Tetsuko - able to afford to play the card', function () {
            this.player1.fate = 2;
            this.player1.player.imperialFavor = 'military';
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tetsuko],
                defenders: [],
                type: 'military'
            });

            let fate = this.player1.fate;
            this.player1.clickCard(this.alliance);
            expect(this.player1).toHavePrompt('Choose a value for X');
            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).not.toHavePromptButton('2');
            expect(this.player1).not.toHavePromptButton('3');
            expect(this.player1).not.toHavePromptButton('4');
            this.player1.clickPrompt('1');
            expect(this.voice.location).toBe('removed from game');
            expect(this.player1.hand.length).toBe(0);
            expect(this.getChatLogs(10)).toContain('player1 plays Favorable Alliance to set aside 1 card');
            expect(this.getChatLogs(10)).toContain(
                'player1 sets aside the top 1 card from their conflict deck: Voice of Honor'
            );
            expect(this.player1.fate).toBe(fate - 2);
        });

        it('should work with Tetsuko - unable to afford to play the card', function () {
            this.player1.fate = 1;
            this.player1.player.imperialFavor = 'military';
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.tetsuko],
                defenders: [],
                type: 'military'
            });

            this.player1.clickCard(this.alliance);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should only let you pick cards up to the amount in your discard', function () {
            this.player1.fate = 14;
            let fate = this.player1.fate;
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.alliance);
            expect(this.player1).toHavePrompt('Choose a value for X');
            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).toHavePromptButton('2');
            expect(this.player1).toHavePromptButton('3');
            expect(this.player1).toHavePromptButton('4');
            expect(this.player1).toHavePromptButton('5');
            expect(this.player1).toHavePromptButton('6');
            expect(this.player1).not.toHavePromptButton('7');
            expect(this.player1).not.toHavePromptButton('8');
            this.player1.clickPrompt('6');
            expect(this.player1.hand.length).toBe(0);
            expect(this.getChatLogs(10)).toContain('player1 plays Favorable Alliance to set aside 6 cards');
            expect(this.player1.fate).toBe(fate - 6);
        });

        it('should work with Yoshi and a maximum deck size', function () {
            this.player1.fate = 12;
            this.player1.player.imperialFavor = 'military';
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'military',
                province: this.garden
            });

            this.player2.pass();
            this.player1.clickCard(this.yoshi);
            expect(this.voice.location).toBe('hand');
            expect(this.katana.location).toBe('hand');
            expect(this.fashion.location).toBe('hand');

            this.player1.moveCard(this.fashion, 'conflict deck');
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player1.moveCard(this.voice, 'conflict deck');

            this.player2.pass();

            let fate = this.player1.fate;
            this.player1.clickCard(this.alliance);
            expect(this.player1).toHavePrompt('Choose a value for X');
            expect(this.player1).toHavePromptButton('1');
            expect(this.player1).toHavePromptButton('2');
            expect(this.player1).toHavePromptButton('3');
            expect(this.player1).toHavePromptButton('4');
            expect(this.player1).toHavePromptButton('5');
            expect(this.player1).toHavePromptButton('6');
            expect(this.player1).not.toHavePromptButton('7');
            expect(this.player1).not.toHavePromptButton('8');
            this.player1.clickPrompt('6');
            expect(this.player1.hand.length).toBe(0);
            expect(this.getChatLogs(10)).toContain('player1 plays Favorable Alliance to set aside 6 cards');
            expect(this.player1.fate).toBe(fate - 4);
        });

        describe('Playing cards from RFG', function () {
            beforeEach(function () {
                this.player1.fate = 10;
                this.player1.player.imperialFavor = 'military';
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [],
                    type: 'military',
                    province: this.garden
                });

                this.tetsuko.bowed = true;
                this.yoshi.fate = 1;
                this.yoshi.honor();
                this.player1.moveCard(this.crane, 'removed from game');
                this.player2.pass();
                this.player1.clickCard(this.alliance);
                this.player1.clickPrompt('3');
            });

            it('should not be able to play cards removed from the game by other means', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.crane);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should allow playing cards from RFG that were put there by Favorable Alliance', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.katana);
                expect(this.player1).toHavePrompt('Choose a card');
                this.player1.clickCard(this.yoshi);
                expect(this.yoshi.attachments).toContain(this.katana);
            });

            it('should not be able to play cards removed from the game by opponent', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.katana);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('should not allow re-playing cards that get moved back into RFG after being played', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.katana);
                expect(this.player1).toHavePrompt('Choose a card');
                this.player1.clickCard(this.yoshi);
                expect(this.yoshi.attachments).toContain(this.katana);
                this.player1.moveCard(this.katana, 'removed from game');
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.katana);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should allow triggering reactions', function () {
                this.player2.clickCard(this.fury);
                this.player2.clickCard(this.yoshi);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.voice);
                expect(this.voice.location).toBe('removed from game');
                this.player1.clickCard(this.voice);
                expect(this.voice.location).toBe('conflict discard pile');
                expect(this.yoshi.bowed).toBe(false);
            });

            it('should still let you play cards from RFG next turn', function () {
                this.noMoreActions();
                this.player1.clickPrompt('No');
                this.player1.clickPrompt('Don\'t Resolve');

                this.noMoreActions();
                this.noMoreActions();
                this.noMoreActions();
                this.noMoreActions();
                this.player1.clickPrompt('Military');
                this.player2.clickPrompt('Done');
                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');
                this.player2.clickPrompt('End Round');
                this.player1.clickPrompt('End Round');

                //New round!
                this.player2.pass();
                this.player1.pass();

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                this.player2.pass();
                expect(this.katana.location).toBe('removed from game');
                this.player1.clickCard(this.katana);
                this.player1.clickCard(this.yoshi);
                expect(this.yoshi.attachments).toContain(this.katana);
            });
        });
    });
});
