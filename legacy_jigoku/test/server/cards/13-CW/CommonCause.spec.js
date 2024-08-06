describe('Common Cause', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['steadfast-witch-hunter', 'borderlands-defender'],
                    hand: ['common-cause']
                },
                player2: {
                    inPlay: ['doji-challenger']
                }
            });
            this.commonCause = this.player1.findCardByName('common-cause');
            this.steadfastWitchHunter = this.player1.findCardByName('steadfast-witch-hunter');
            this.defender = this.player1.findCardByName('borderlands-defender');

            this.challenger = this.player2.findCardByName('doji-challenger');
        });

        it('should stand someone after you sacrifice a character', function() {
            this.steadfastWitchHunter.bowed = true;
            this.player1.clickCard(this.commonCause);
            this.player1.clickCard(this.steadfastWitchHunter);
            expect(this.player1).toHavePrompt('Select card to sacrifice');
            this.player1.clickCard(this.defender);
            expect(this.defender.location).toBe('dynasty discard pile');
            expect(this.steadfastWitchHunter.bowed).toBe(false);
            expect(this.steadfastWitchHunter.isHonored).toBe(false);
            expect(this.getChatLogs(1)).toContain('player1 plays Common Cause, sacrificing Borderlands Defender to ready Steadfast Witch Hunter');
        });

        it('should honor if you stand an opponents character', function() {
            this.challenger.bowed = true;
            this.player1.clickCard(this.commonCause);
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Select card to sacrifice');
            this.player1.clickCard(this.defender);
            expect(this.defender.location).toBe('dynasty discard pile');
            expect(this.challenger.bowed).toBe(false);
            expect(this.challenger.isHonored).toBe(true);
            expect(this.getChatLogs(1)).toContain('player1 plays Common Cause, sacrificing Borderlands Defender to ready Doji Challenger and honor Doji Challenger');
        });

        it('should honor an opponents character who is not bowed', function() {
            this.player1.clickCard(this.commonCause);
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Select card to sacrifice');
            this.player1.clickCard(this.defender);
            expect(this.defender.location).toBe('dynasty discard pile');
            expect(this.challenger.bowed).toBe(false);
            expect(this.challenger.isHonored).toBe(true);
            expect(this.getChatLogs(1)).toContain('player1 plays Common Cause, sacrificing Borderlands Defender to honor Doji Challenger');
        });

        it('should be illegal when there are no legal targets', function() {
            this.challenger.honor();
            this.player1.clickCard(this.commonCause);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should display a message if the only legal target is sacrificed', function() {
            this.challenger.honor();
            this.steadfastWitchHunter.bowed = true;
            this.player1.clickCard(this.commonCause);
            expect(this.player1).toHavePrompt('Common Cause');
            this.player1.clickPrompt('Pay Costs First');
            this.player1.clickCard(this.steadfastWitchHunter);
            expect(this.steadfastWitchHunter.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(1)).toContain('player1 attempted to use Common Cause, but there are insufficient legal targets');
        });

        it('should still display a message if the target is chosen then sacrificed', function() {
            this.challenger.honor();
            this.steadfastWitchHunter.bowed = true;
            this.player1.clickCard(this.commonCause);
            expect(this.player1).toHavePrompt('Common Cause');
            this.player1.clickCard(this.steadfastWitchHunter);
            expect(this.player1).toHavePrompt('Select card to sacrifice');
            expect(this.player1).toBeAbleToSelect(this.steadfastWitchHunter);
            expect(this.player1).toBeAbleToSelect(this.defender);
            this.player1.clickCard(this.steadfastWitchHunter);
            expect(this.steadfastWitchHunter.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(1)).toContain('player1 attempted to use Common Cause, but there are insufficient legal targets');
            expect(this.player2).toHavePrompt('Action Window');
        });
    });
});
