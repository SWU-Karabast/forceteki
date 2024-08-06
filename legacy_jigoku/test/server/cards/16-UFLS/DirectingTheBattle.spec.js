describe('Directing the Battle', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['void-wielder', 'iuchi-wayfinder'],
                    hand: ['directing-the-battle']
                },
                player2: {
                    inPlay: ['borderlands-defender', 'doji-whisperer'],
                    hand: ['mirumoto-s-fury']
                }
            });

            this.void = this.player1.findCardByName('void-wielder');
            this.wayfinder = this.player1.findCardByName('iuchi-wayfinder');
            this.defender = this.player2.findCardByName('borderlands-defender');
            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.directing = this.player1.findCardByName('directing-the-battle');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
        });

        it('should not be able to be triggered outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.directing);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should prompt for valid options on a character', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            this.player2.pass();
            this.player1.clickCard(this.directing);
            expect(this.player1).toBeAbleToSelect(this.void);
            expect(this.player1).toBeAbleToSelect(this.defender);
            expect(this.player1).toBeAbleToSelect(this.wayfinder);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            this.player1.clickCard(this.whisperer);
            expect(this.player2).toHavePromptButton('Move this character home');
            expect(this.player2).toHavePromptButton('Give +3 Military');
            expect(this.player2).toHavePromptButton('Prevent bowing during conflict');
        });

        it('should prompt for valid options on a character - at home', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            this.player2.pass();
            this.player1.clickCard(this.directing);
            expect(this.player1).toBeAbleToSelect(this.void);
            expect(this.player1).toBeAbleToSelect(this.defender);
            expect(this.player1).toBeAbleToSelect(this.wayfinder);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            this.player1.clickCard(this.void);
            expect(this.player1).not.toHavePromptButton('Move this character home');
            expect(this.player1).toHavePromptButton('Give +3 Military');
            expect(this.player1).toHavePromptButton('Prevent bowing during conflict');
        });

        it('send home', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            this.player2.pass();
            this.player1.clickCard(this.directing);
            this.player1.clickCard(this.whisperer);
            this.player2.clickPrompt('Move this character home');
            expect(this.whisperer.isParticipating()).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Directing the Battle to send Doji Whisperer home');
        });

        it('+3 Military', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            let mil = this.whisperer.getMilitarySkill();
            this.player2.pass();
            this.player1.clickCard(this.directing);
            this.player1.clickCard(this.whisperer);
            this.player2.clickPrompt('Give +3 Military');
            expect(this.whisperer.getMilitarySkill()).toBe(mil + 3);
            expect(this.getChatLogs(5)).toContain('player1 plays Directing the Battle to give Doji Whisperer +3military');
        });

        it('Prevent Bows', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.wayfinder, this.void],
                defenders: [this.defender, this.whisperer],
                ring: 'void'
            });
            this.whisperer.taint();
            this.player2.pass();
            this.player1.clickCard(this.directing);
            this.player1.clickCard(this.wayfinder);
            this.player1.clickPrompt('Prevent bowing during conflict');
            this.player2.clickCard(this.fury);
            expect(this.player2).toBeAbleToSelect(this.void);
            expect(this.player2).not.toBeAbleToSelect(this.wayfinder);
            expect(this.getChatLogs(5)).toContain('player1 plays Directing the Battle to prevent Iuchi Wayfinder from being bowed by opponent\'s card effects');
        });
    });
});
