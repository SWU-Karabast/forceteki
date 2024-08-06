describe('Ganzu Warrior', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 5,
                    inPlay: ['ganzu-warrior', 'shinjo-outrider'],
                    dynastyDiscard: ['ganzu-warrior']
                },
                player2: {
                    fate: 5,
                    inPlay: ['akodo-toturi'],
                    provinces: ['border-fortress', 'kuroi-mori', 'toshi-ranbo'],
                    hand: ['talisman-of-the-sun']
                }
            });

            this.ganzu = this.player1.findCardByName('ganzu-warrior', 'play area');
            this.ganzu2 = this.player1.findCardByName('ganzu-warrior', 'dynasty discard pile');
            this.outrider = this.player1.findCardByName('shinjo-outrider');

            this.fortress = this.player2.findCardByName('border-fortress');
            this.kuroiMori = this.player2.findCardByName('kuroi-mori');
            this.ranbo = this.player2.findCardByName('toshi-ranbo');
            this.talisman = this.player2.findCardByName('talisman-of-the-sun');
            this.shameful = this.player1.findCardByName('shameful-display');

            this.toturi = this.player2.findCardByName('akodo-toturi');

            this.player1.pass();
            this.player2.playAttachment(this.talisman, this.toturi);
            this.fortress.facedown = true;
            this.shameful.facedown = true;
            this.kuroiMori.facedown = true;
            this.ranbo.facedown = true;
        });

        it('should activate when this character reveals a province when attacking', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ganzu],
                province: this.fortress
            });

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.ganzu);
        });

        it('should let you resolve a ring that matches an element on the revealed province', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ganzu],
                province: this.fortress
            });

            let honor = this.player1.honor;

            this.player1.clickCard(this.ganzu);
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).not.toBeAbleToSelectRing('void');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
            expect(this.player1).not.toBeAbleToSelectRing('water');

            this.player1.clickRing('air');
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.getChatLogs(5)).toContain('player1 uses Ganzu Warrior to resolve a ring effect');
            expect(this.getChatLogs(5)).toContain('player1 resolves the Air Ring\'s effect');
            expect(this.player1.honor).toBe(honor + 2);
        });

        it('should not activate when this character is not participating', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.outrider],
                province: this.fortress
            });
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should activate when a province is revealed mid-conflict', function () {
            this.fortress.facedown = false;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ganzu],
                defenders: [],
                province: this.fortress
            });

            this.player2.clickCard(this.talisman);
            this.player2.clickCard(this.ranbo);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.ganzu);
            this.player1.clickCard(this.ganzu);
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('water');
        });

        it('should activate when your province is revealed mid-conflict', function () {
            this.fortress.facedown = false;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ganzu],
                defenders: [],
                province: this.fortress
            });

            this.player2.clickCard(this.fortress);
            this.player2.clickCard(this.shameful);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.ganzu);
            this.player1.clickCard(this.ganzu);
            expect(this.player1).not.toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
            expect(this.player1).not.toBeAbleToSelectRing('water');
        });

        it('should be max 1 per conflict', function () {
            this.player1.moveCard(this.ganzu2, 'play area');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ganzu, this.ganzu2],
                province: this.fortress
            });

            this.player1.clickCard(this.ganzu);
            this.player1.clickRing('air');
            this.player1.clickPrompt('Gain 2 honor');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Choose Defenders');
        });
    });
});
