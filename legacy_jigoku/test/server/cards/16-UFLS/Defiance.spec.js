describe('Defiance', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-initiate', 'kitsuki-shomon'],
                    hand: ['defiance', 'fine-katana']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'daidoji-uji'],
                    hand: ['defiance', 'fine-katana']
                }
            });
            this.togashiInitiate = this.player1.findCardByName('togashi-initiate');
            this.kitsukiShomon = this.player1.findCardByName('kitsuki-shomon');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.defiance1 = this.player1.findCardByName('defiance');
            this.defiance2 = this.player2.findCardByName('defiance');

            this.katana1 = this.player1.findCardByName('fine-katana');
            this.katana2 = this.player2.findCardByName('fine-katana');

            this.player1.player.showBid = 3;
            this.player2.player.showBid = 5;
        });

        it('should not be playable outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.defiance1);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not be playable with equal cards', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate, this.kitsukiShomon],
                defenders: [this.daidojiUji]
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.defiance2);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not be playable with more cards', function() {
            this.player1.moveCard(this.katana1, 'conflict discard pile');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate, this.kitsukiShomon],
                defenders: [this.daidojiUji]
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.defiance2);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should allow targeting a character and give them +X/+X', function() {
            this.player2.moveCard(this.katana2, 'conflict discard pile');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate, this.kitsukiShomon],
                defenders: [this.daidojiUji]
            });
            this.player2.clickCard(this.defiance2);
            expect(this.player2).toBeAbleToSelect(this.togashiInitiate);
            expect(this.player2).toBeAbleToSelect(this.kitsukiShomon);
            expect(this.player2).toBeAbleToSelect(this.daidojiUji);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);

            let mil = this.daidojiUji.getMilitarySkill();
            let pol = this.daidojiUji.getPoliticalSkill();
            this.player2.clickCard(this.daidojiUji);
            expect(this.daidojiUji.getMilitarySkill()).toBe(mil + 3);
            expect(this.daidojiUji.getPoliticalSkill()).toBe(pol + 3);
            expect(this.getChatLogs(5)).toContain('player2 plays Defiance to give Daidoji Uji +3military/+3political');
        });

        it('should allow targeting a character and give them +X/+X', function() {
            this.player1.moveCard(this.katana1, 'conflict discard pile');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate, this.kitsukiShomon],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.clickCard(this.defiance1);
            expect(this.player1).toBeAbleToSelect(this.togashiInitiate);
            expect(this.player1).toBeAbleToSelect(this.kitsukiShomon);
            expect(this.player1).toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);

            let mil = this.daidojiUji.getMilitarySkill();
            let pol = this.daidojiUji.getPoliticalSkill();
            this.player1.clickCard(this.daidojiUji);
            expect(this.daidojiUji.getMilitarySkill()).toBe(mil + 5);
            expect(this.daidojiUji.getPoliticalSkill()).toBe(pol + 5);
            expect(this.getChatLogs(5)).toContain('player1 plays Defiance to give Daidoji Uji +5military/+5political');
        });
    });
});
