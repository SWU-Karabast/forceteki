describe("Lord's Ascendancy", function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['adept-of-shadows', 'brash-samurai']
                },
                player2: {
                    inPlay: ['doji-whisperer'],
                    provinces: ['lord-s-ascendancy', 'fertile-fields']
                }
            });

            this.brash = this.player1.findCardByName('brash-samurai');
            this.adeptOfShadows = this.player1.findCardByName('adept-of-shadows');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');

            this.lords = this.player2.findCardByName('lord-s-ascendancy');
            this.fertile = this.player2.findCardByName('fertile-fields');
        });

        it('should be able to target participating characters who can be bowed', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows],
                defenders: [this.dojiWhisperer],
                province: this.lords
            });
            this.player2.clickCard(this.lords);
            expect(this.player2).toBeAbleToSelect(this.adeptOfShadows);
            expect(this.player2).not.toBeAbleToSelect(this.brash);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
        });

        it('should move a fate from the controllers pool to the character (opponent)', function() {
            let p1fate = this.player1.fate;
            let p2fate = this.player2.fate;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows],
                defenders: [this.dojiWhisperer],
                province: this.lords
            });
            this.player2.clickCard(this.lords);
            this.player2.clickCard(this.adeptOfShadows);
            expect(this.adeptOfShadows.fate).toBe(1);
            expect(this.player1.fate).toBe(p1fate - 1);
            expect(this.player2.fate).toBe(p2fate);
            expect(this.getChatLogs(5)).toContain('player2 uses Lord\'s Ascendancy to place a fate from player1\'s fate pool on Adept of Shadows');
        });

        it('should move a fate from the controllers pool to the character (opponent)', function() {
            let p1fate = this.player1.fate;
            let p2fate = this.player2.fate;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows],
                defenders: [this.dojiWhisperer],
                province: this.lords
            });
            this.player2.clickCard(this.lords);
            this.player2.clickCard(this.dojiWhisperer);
            expect(this.dojiWhisperer.fate).toBe(1);
            expect(this.player1.fate).toBe(p1fate);
            expect(this.player2.fate).toBe(p2fate - 1);
            expect(this.getChatLogs(5)).toContain('player2 uses Lord\'s Ascendancy to place a fate from player2\'s fate pool on Doji Whisperer');
        });

        it('should not be able to target someone if their controller has no fate', function() {
            this.player1.fate = 0;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows],
                defenders: [this.dojiWhisperer],
                province: this.lords
            });
            this.player2.clickCard(this.lords);
            expect(this.player2).not.toBeAbleToSelect(this.adeptOfShadows);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
        });

        it('should not be able to triggered if no one has fate', function() {
            this.player1.fate = 0;
            this.player2.fate = 0;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows],
                defenders: [this.dojiWhisperer],
                province: this.lords
            });
            this.player2.clickCard(this.lords);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not be able to triggered at a different province', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.adeptOfShadows],
                defenders: [this.dojiWhisperer],
                province: this.fertile
            });
            this.player2.clickCard(this.lords);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
