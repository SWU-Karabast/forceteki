describe('Bamboo Tattoo', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan']
                },
                player2: {
                    inPlay: ['impulsive-novice', 'doomed-shugenja', 'togashi-mitsu'],
                    provinces: ['courteous-greeting'],
                    hand: ['bamboo-tattoo', 'high-kick', 'being-and-becoming']
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.doomed = this.player2.findCardByName('doomed-shugenja');
            this.novice = this.player2.findCardByName('impulsive-novice');
            this.mitsu = this.player2.findCardByName('togashi-mitsu');

            this.bamboo = this.player2.findCardByName('bamboo-tattoo');
            this.kick = this.player2.findCardByName('high-kick');
            this.beingAndBecoming = this.player2.findCardByName('being-and-becoming');
            this.greeting = this.player2.findCardByName('courteous-greeting');

            this.game.rings.fire.fate = 2;
        });

        it('should only be playable on monks and cost 1 when played on someone expensive', function () {
            let fate = this.player2.fate;
            this.player1.pass();
            this.player2.clickCard(this.bamboo);

            expect(this.player2).toBeAbleToSelect(this.novice);
            expect(this.player2).not.toBeAbleToSelect(this.doomed);
            expect(this.player2).toBeAbleToSelect(this.mitsu);
            this.player2.clickCard(this.mitsu);

            expect(this.player2.fate).toBe(fate - 1);
        });

        it('should only be playable on monks and cost 0 when played on someone cheap', function () {
            let fate = this.player2.fate;
            this.player1.pass();
            this.player2.clickCard(this.bamboo);

            expect(this.player2).toBeAbleToSelect(this.novice);
            expect(this.player2).not.toBeAbleToSelect(this.doomed);
            expect(this.player2).toBeAbleToSelect(this.mitsu);
            this.player2.clickCard(this.novice);

            expect(this.player2.fate).toBe(fate);
        });

        it('should add tattooed trait', function () {
            this.player1.pass();
            expect(this.novice.hasTrait('tattooed')).toBe(false);
            this.player2.clickCard(this.bamboo);
            this.player2.clickCard(this.novice);
            expect(this.novice.hasTrait('tattooed')).toBe(true);
        });

        it('should prompt you to ready when you bow attached character for a cost', function () {
            this.player1.pass();
            this.player2.clickCard(this.bamboo);
            this.player2.clickCard(this.novice);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [this.novice]
            });
            this.player2.clickCard(this.kick);
            this.player2.clickCard(this.kuwanan);
            this.player2.clickCard(this.novice);

            expect(this.novice.bowed).toBe(true);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.bamboo);
            this.player2.clickCard(this.bamboo);
            expect(this.novice.bowed).toBe(false);
            expect(this.novice.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses Bamboo Tattoo to ready and dishonor Impulsive Novice');
        });

        it('should prompt you to ready when you bow attached character for an effect', function () {
            this.player1.pass();
            this.player2.clickCard(this.bamboo);
            this.player2.clickCard(this.novice);

            this.noMoreActions();
            this.initiateConflict({
                province: this.greeting,
                attackers: [this.kuwanan],
                defenders: [this.novice]
            });
            this.player2.clickCard(this.greeting);
            this.player2.clickCard(this.novice);
            this.player2.clickCard(this.kuwanan);

            expect(this.novice.bowed).toBe(true);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.bamboo);
            this.player2.clickCard(this.bamboo);
            expect(this.novice.bowed).toBe(false);
            expect(this.novice.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses Bamboo Tattoo to ready and dishonor Impulsive Novice');
        });

        it('should prompt you to ready when attached character is bowed by opponent', function () {
            this.player1.pass();
            this.player2.clickCard(this.bamboo);
            this.player2.clickCard(this.novice);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [this.novice]
            });
            this.player2.pass();
            this.player1.clickCard(this.kuwanan);
            this.player1.clickCard(this.novice);

            expect(this.novice.bowed).toBe(true);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.bamboo);
            this.player2.clickCard(this.bamboo);
            expect(this.novice.bowed).toBe(false);
            expect(this.novice.isDishonored).toBe(false);

            expect(this.getChatLogs(5)).toContain('player2 uses Bamboo Tattoo to ready Impulsive Novice');
        });

        it('should also prompt you to ready outside conflicts', function () {
            this.player1.pass();
            this.player2.clickCard(this.bamboo);
            this.player2.clickCard(this.novice);

            this.player1.pass();
            this.player2.clickCard(this.beingAndBecoming);
            this.player2.clickCard(this.novice);

            this.player1.pass();
            this.player2.clickCard(this.beingAndBecoming);
            this.player2.clickRing('fire');

            expect(this.novice.bowed).toBe(true);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.bamboo);

            this.player2.clickCard(this.bamboo);
            expect(this.novice.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain('player2 uses Bamboo Tattoo to ready and dishonor Impulsive Novice');
        });

        it('should not prompt you to ready when attached character is bowed by framework', function () {
            this.player1.pass();
            this.player2.clickCard(this.bamboo);
            this.player2.clickCard(this.novice);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [this.novice, this.mitsu]
            });
            this.noMoreActions();

            expect(this.novice.bowed).toBe(true);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not prompt you to ready when attached character is bowed by ring', function () {
            this.player1.pass();
            this.player2.clickCard(this.bamboo);
            this.player2.clickCard(this.novice);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [this.mitsu],
                ring: 'water'
            });
            this.noMoreActions();
            this.player1.clickCard(this.novice);

            expect(this.novice.bowed).toBe(true);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
