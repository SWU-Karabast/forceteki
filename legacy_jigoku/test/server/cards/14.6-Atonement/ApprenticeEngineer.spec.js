describe('Apprentice Engineer', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['apprentice-engineer'],
                    dynastyDiscard: ['imperial-storehouse', 'favorable-ground', 'hida-kisada', 'doji-challenger', 'kakita-toshimoko', 'artisan-academy']
                }
            });

            this.storehouse = this.player1.findCardByName('imperial-storehouse');
            this.favorableGround = this.player1.findCardByName('favorable-ground');
            this.kisada = this.player1.findCardByName('hida-kisada');
            this.challenger = this.player1.moveCard('doji-challenger', 'province 1');
            this.toshimoko = this.player1.moveCard('kakita-toshimoko', 'province 1');
            this.academy = this.player1.moveCard('artisan-academy', 'province 1');

            this.engineer = this.player1.findCardByName('apprentice-engineer');

            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.sd2.isBroken = true;
            this.sd3.isBroken = true;
        });

        it('should trigger when played', function() {
            this.player1.clickCard(this.engineer);
            this.player1.clickPrompt('0');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.engineer);
        });

        it('should allow you to target a holding from your conflict discard', function() {
            this.player1.clickCard(this.engineer);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.engineer);
            expect(this.player1).toHavePrompt('Choose a holding');
            expect(this.player1).toBeAbleToSelect(this.storehouse);
            expect(this.player1).toBeAbleToSelect(this.favorableGround);
            expect(this.player1).not.toBeAbleToSelect(this.kisada);
            expect(this.player1).not.toBeAbleToSelect(this.academy);
        });

        it('should let you pick a province', function() {
            this.player1.clickCard(this.engineer);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.engineer);
            this.player1.clickCard(this.storehouse);
            expect(this.player1).toHavePrompt('Choose an unbroken province');

            expect(this.player1).toBeAbleToSelect(this.sd1);
            expect(this.player1).not.toBeAbleToSelect(this.sd2);
            expect(this.player1).not.toBeAbleToSelect(this.sd3);
            expect(this.player1).toBeAbleToSelect(this.sd4);
            expect(this.player1).not.toBeAbleToSelect(this.sd5);
        });

        it('should discard all the cards in the picked', function() {
            this.player1.clickCard(this.engineer);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.engineer);
            this.player1.clickCard(this.storehouse);
            this.player1.clickCard(this.sd1);
            expect(this.challenger.location).toBe('dynasty discard pile');
            expect(this.toshimoko.location).toBe('dynasty discard pile');
            expect(this.academy.location).toBe('dynasty discard pile');
        });

        it('should put the chosen holding in the province faceup', function() {
            this.player1.clickCard(this.engineer);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.engineer);
            this.player1.clickCard(this.storehouse);
            this.player1.clickCard(this.sd1);
            expect(this.storehouse.location).toBe('province 1');
            expect(this.storehouse.facedown).toBe(false);
        });

        it('should let you use the chosen holding', function() {
            this.player1.clickCard(this.engineer);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.engineer);
            this.player1.clickCard(this.storehouse);
            this.player1.clickCard(this.sd1);
            this.player2.pass();
            let hand = this.player1.hand.length;
            this.player1.clickCard(this.storehouse);
            expect(this.player1.hand.length).toBe(hand + 1);
        });

        it('should not trigger if there are no eligible provinces', function() {
            this.sd1.isBroken = true;
            this.sd4.isBroken = true;
            this.player1.clickCard(this.engineer);
            this.player1.clickPrompt('0');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('chat messages', function() {
            this.player1.clickCard(this.engineer);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.engineer);
            this.player1.clickCard(this.storehouse);
            this.player1.clickCard(this.sd1);
            expect(this.getChatLogs(10)).toContain('player1 uses Apprentice Engineer to put Imperial Storehouse into a province');
            expect(this.getChatLogs(10)).toContain('player1 places Imperial Storehouse in province 1, discarding Adept of the Waves, Doji Challenger, Kakita Toshimoko and Artisan Academy');
        });

        it('chat messages (faceup province)', function() {
            this.sd1.facedown = false;
            this.player1.clickCard(this.engineer);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.engineer);
            this.player1.clickCard(this.storehouse);
            this.player1.clickCard(this.sd1);
            expect(this.getChatLogs(10)).toContain('player1 uses Apprentice Engineer to put Imperial Storehouse into a province');
            expect(this.getChatLogs(10)).toContain('player1 places Imperial Storehouse in Shameful Display, discarding Adept of the Waves, Doji Challenger, Kakita Toshimoko and Artisan Academy');
        });
    });
});
