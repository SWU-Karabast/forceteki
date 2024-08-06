describe('Jade Talisman', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-initiate']
                },
                player2: {
                    inPlay: ['daidoji-uji'],
                    hand: ['jade-talisman']
                }
            });
            this.togashiInitiate = this.player1.findCardByName('togashi-initiate');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.talisman = this.player2.findCardByName('jade-talisman');
            this.player1.pass();
            this.player2.playAttachment(this.talisman, this.daidojiUji);
        });

        it('void ring', function() {
            this.daidojiUji.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'void'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Void Ring');
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.talisman);
            this.player2.clickCard(this.talisman);
            expect(this.daidojiUji.fate).toBe(1);
            expect(this.getChatLogs(5)).toContain('player2 uses Jade Talisman, sacrificing Jade Talisman to cancel the effects of the Void Ring');
        });

        it('fire ring - honor', function() {
            this.daidojiUji.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'fire'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.daidojiUji);
            this.player1.clickPrompt('Honor Daidoji Uji');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.talisman);
            this.player2.clickCard(this.talisman);
            expect(this.daidojiUji.isHonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player2 uses Jade Talisman, sacrificing Jade Talisman to cancel the effects of the Fire Ring');
        });

        it('fire ring - dishonor', function() {
            this.daidojiUji.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'fire'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.daidojiUji);
            this.player1.clickPrompt('Dishonor Daidoji Uji');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.talisman);
            this.player2.clickCard(this.talisman);
            expect(this.daidojiUji.isDishonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player2 uses Jade Talisman, sacrificing Jade Talisman to cancel the effects of the Fire Ring');
        });

        it('water ring - bow', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'water'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Water Ring');
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.talisman);
            this.player2.clickCard(this.talisman);
            expect(this.daidojiUji.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain('player2 uses Jade Talisman, sacrificing Jade Talisman to cancel the effects of the Water Ring');
        });

        it('water ring - ready', function() {
            this.daidojiUji.bow();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'water'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Water Ring');
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.talisman);
            this.player2.clickCard(this.talisman);
            expect(this.daidojiUji.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses Jade Talisman, sacrificing Jade Talisman to cancel the effects of the Water Ring');
        });
    });
});
