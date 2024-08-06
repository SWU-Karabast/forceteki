describe('The Eternal Watch', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['adept-of-shadows', 'kakita-toshimoko', 'doji-kuwanan', 'ancient-master', 'solemn-scholar'],
                    hand: ['clarity-of-purpose']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'righteous-magistrate'],
                    provinces: ['the-eternal-watch', 'fertile-fields']
                }
            });

            this.adeptOfShadows = this.player1.findCardByName('adept-of-shadows');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.master = this.player1.findCardByName('ancient-master');
            this.scholar = this.player1.findCardByName('solemn-scholar');
            this.clarity = this.player1.findCardByName('clarity-of-purpose');

            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.magistrate = this.player2.findCardByName('righteous-magistrate');
            this.watch = this.player2.findCardByName('the-eternal-watch');
            this.fertile = this.player2.findCardByName('fertile-fields');
        });

        it('should be able to target attacking characters who can be bowed', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows, this.toshimoko, this.kuwanan, this.scholar],
                defenders: [this.dojiWhisperer],
                type: 'political',
                province: this.watch
            });
            this.toshimoko.bow();
            this.player2.pass();
            this.player1.clickCard(this.clarity);
            this.player1.clickCard(this.scholar);
            this.player2.clickCard(this.watch);
            expect(this.player2).toBeAbleToSelect(this.adeptOfShadows);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player2).toBeAbleToSelect(this.kuwanan);
            expect(this.player2).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).not.toBeAbleToSelect(this.master);
            expect(this.player2).not.toBeAbleToSelect(this.scholar);
        });

        it('should give the opponent the choice between options', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows, this.toshimoko, this.kuwanan, this.scholar],
                defenders: [this.dojiWhisperer],
                type: 'political',
                province: this.watch
            });
            this.player2.clickCard(this.watch);
            this.player2.clickCard(this.toshimoko);
            expect(this.player1).toHavePrompt('The Eternal Watch');
            expect(this.player1).toHavePromptButton('Bow this character');
            expect(this.player1).toHavePromptButton('Give your opponent 1 honor');
        });

        it('should bow if that is picked', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows, this.toshimoko, this.kuwanan, this.scholar],
                defenders: [this.dojiWhisperer],
                type: 'political',
                province: this.watch
            });
            let honor = this.player1.honor;
            let honor2 = this.player2.honor;
            this.player2.clickCard(this.watch);
            this.player2.clickCard(this.toshimoko);
            this.player1.clickPrompt('Bow this character');
            expect(this.toshimoko.bowed).toBe(true);
            expect(this.player1.honor).toBe(honor);
            expect(this.player2.honor).toBe(honor2);
            expect(this.getChatLogs(5)).toContain('player2 uses The Eternal Watch to bow Kakita Toshimoko');
        });

        it('should give an honor if that is picked', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows, this.toshimoko, this.kuwanan, this.scholar],
                defenders: [this.dojiWhisperer],
                type: 'political',
                province: this.watch
            });
            let honor = this.player1.honor;
            let honor2 = this.player2.honor;
            this.player2.clickCard(this.watch);
            this.player2.clickCard(this.toshimoko);
            this.player1.clickPrompt('Give your opponent 1 honor');
            expect(this.toshimoko.bowed).toBe(false);
            expect(this.player1.honor).toBe(honor - 1);
            expect(this.player2.honor).toBe(honor2 + 1);
            expect(this.getChatLogs(5)).toContain('player2 uses The Eternal Watch to take 1 honor from player1');
        });

        it('should bow without option if honor cannot be given', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows, this.toshimoko, this.kuwanan, this.scholar],
                defenders: [this.dojiWhisperer, this.magistrate],
                type: 'political',
                province: this.watch
            });
            this.player2.clickCard(this.watch);
            this.player2.clickCard(this.toshimoko);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.toshimoko.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses The Eternal Watch to bow Kakita Toshimoko');
        });

        it('should not work at a different province', function() {
            this.watch.facedown = false;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows, this.toshimoko, this.kuwanan, this.scholar],
                defenders: [this.dojiWhisperer, this.magistrate],
                type: 'political',
                province: this.fertile
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.watch);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
