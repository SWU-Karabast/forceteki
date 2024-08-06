describe('Elegance and Grace', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai', 'border-rider', 'doji-whisperer', 'daidoji-uji', 'doji-challenger', 'guest-of-honor', 'moto-youth', 'kakita-toshimoko'],
                    hand: ['elegance-and-grace']
                },
                player2: {
                    inPlay: ['naive-student','doji-kuwanan']
                }
            });
            this.brashSamurai = this.player1.findCardByName('brash-samurai');
            this.brashSamurai.bowed = true;
            this.brashSamurai.honor();

            this.borderRider = this.player1.findCardByName('border-rider');
            this.borderRider.fate = 1;
            this.borderRider.bowed = true;

            this.dojiWhisperer = this.player1.findCardByName('doji-whisperer');
            this.dojiWhisperer.honor();

            this.daidojiUji = this.player1.findCardByName('daidoji-uji');
            this.daidojiUji.bowed = true;
            this.daidojiUji.honor();

            this.dojiChallenger = this.player1.findCardByName('doji-challenger');
            this.dojiChallenger.honor();
            this.dojiChallenger.bowed = true;

            this.guestOfHonor = this.player1.findCardByName('guest-of-honor');
            this.guestOfHonor.honor();
            this.guestOfHonor.bowed = true;

            this.motoYouth = this.player1.findCardByName('moto-youth');
            this.motoYouth.bowed = true;

            this.kakitaToshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.kakitaToshimoko.bowed = false;

            this.eleganceAndGrace = this.player1.findCardByName('elegance-and-grace');

            this.naiveStudent = this.player2.findCardByName('naive-student');
            this.naiveStudent.honor();
            this.naiveStudent.bowed = true;

            this.dojiKuwanan = this.player2.findCardByName('doji-kuwanan');
            this.dojiKuwanan.bowed = true;
        });

        it('should prompt you to target bowed honored characters', function() {
            this.player1.clickCard(this.eleganceAndGrace);
            expect(this.player1).toHavePrompt('Choose characters');
            expect(this.player1).toBeAbleToSelect(this.brashSamurai);
            expect(this.player1).not.toBeAbleToSelect(this.borderRider);
            expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).toBeAbleToSelect(this.dojiChallenger);
            expect(this.player1).toBeAbleToSelect(this.guestOfHonor);
            expect(this.player1).toBeAbleToSelect(this.naiveStudent);
            expect(this.player1).not.toBeAbleToSelect(this.motoYouth);
            expect(this.player1).not.toBeAbleToSelect(this.dojiKuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.kakitaToshimoko);
        });

        it('should not allow you to select zero characters', function() {
            this.player1.clickCard(this.eleganceAndGrace);
            expect(this.player1).toHavePrompt('Choose characters');
            expect(this.player1).not.toHavePromptButton('Done');
        });

        it('should not allow you to target characters greater than a total of 6 fate cost', function() {
            this.player1.clickCard(this.eleganceAndGrace);
            this.player1.clickCard(this.daidojiUji);
            this.player1.clickCard(this.dojiChallenger);
            expect(this.player1.player.promptState.selectedCards).toContain(this.daidojiUji);
            expect(this.player1.player.promptState.selectedCards).not.toContain(this.dojiChallenger);
        });

        it('should allow you to target up to 2 characters with a total of 6 fate cost or fewer', function() {
            this.player1.clickCard(this.eleganceAndGrace);
            this.player1.clickCard(this.dojiChallenger);
            expect(this.player1.player.promptState.selectedCards).toContain(this.dojiChallenger);
            expect(this.player1).toHavePromptButton('Done');
            this.player1.clickCard(this.brashSamurai);
            expect(this.player1.player.promptState.selectedCards).toContain(this.brashSamurai);
            expect(this.player1).toHavePromptButton('Done');
            this.player1.clickCard(this.motoYouth);
            expect(this.player1).toHavePromptButton('Done');
            expect(this.player1.player.promptState.selectedCards).not.toContain(this.motoYouth);
        });

        it('should ready the chosen characters', function() {
            this.player1.clickCard(this.eleganceAndGrace);
            this.player1.clickCard(this.dojiChallenger);
            this.player1.clickCard(this.brashSamurai);
            this.player1.clickCard(this.motoYouth);
            this.player1.clickPrompt('Done');
            expect(this.dojiChallenger.bowed).toBe(false);
            expect(this.brashSamurai.bowed).toBe(false);
            expect(this.motoYouth.bowed).toBe(true);
            expect(this.getChatLogs(1)).toContain('player1 plays Elegance and Grace to ready Doji Challenger and Brash Samurai');
        });
    });
});
