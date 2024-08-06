describe('Stowaway', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi'],
                    hand: ['battlefield-orders', 'stowaway'],
                    dynastyDiscard: ['iron-mine'],
                    conflictDiscard: ['let-go', 'fine-katana']
                },
                player2: {
                    inPlay: ['hida-yakamo'],
                    hand: ['assassination', 'battlefield-orders'],
                    dynastyDiscard: ['imperial-storehouse'],
                    conflictDiscard: ['ornate-fan']
                }
            });

            this.yakamo = this.player2.findCardByName('hida-yakamo');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.stowaway = this.player1.findCardByName('stowaway');
            this.mine = this.player1.findCardByName('iron-mine');
            this.letGo = this.player1.findCardByName('let-go');
            this.katana = this.player1.findCardByName('fine-katana');
            this.orders1 = this.player1.findCardByName('battlefield-orders');
            this.orders2 = this.player2.findCardByName('battlefield-orders');

            this.assassination = this.player2.findCardByName('assassination');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.storehouse = this.player2.findCardByName('imperial-storehouse');
        });

        it('should react on entering play during a conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.stowaway);
            this.player1.clickPrompt('0');
            this.player1.clickPrompt('Conflict');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.stowaway);

            this.player1.clickCard(this.stowaway);
            expect(this.player1).toBeAbleToSelect(this.mine);
            expect(this.player1).toBeAbleToSelect(this.letGo);
            expect(this.player1).toBeAbleToSelect(this.storehouse);
            expect(this.player1).toBeAbleToSelect(this.fan);
            expect(this.player1).toBeAbleToSelect(this.katana);

            let mil = this.stowaway.getMilitarySkill();

            this.player1.clickCard(this.katana);
            expect(this.player1).not.toBeAbleToSelect(this.mine);
            expect(this.player1).toBeAbleToSelect(this.letGo);
            expect(this.player1).not.toBeAbleToSelect(this.storehouse);
            expect(this.player1).not.toBeAbleToSelect(this.fan);
            expect(this.player1).toBeAbleToSelect(this.katana);
            this.player1.clickCard(this.letGo);

            this.player1.clickPrompt('Done');

            expect(this.stowaway.getMilitarySkill()).toBe(mil + 1);
            expect(this.katana.location).toBe(this.stowaway.uuid);
            expect(this.letGo.location).toBe(this.stowaway.uuid);

            expect(this.getChatLogs(5)).toContain('player1 uses Stowaway to place Fine Katana and Let Go beneath Stowaway');

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.stowaway);
            expect(this.katana.location).toBe('removed from game');
            expect(this.letGo.location).toBe('removed from game');
            expect(this.getChatLogs(5)).toContain('Fine Katana and Let Go are removed from the game due to Stowaway leaving play');
        });

        it('should not react on entering play outside of a conflict, but should on declaration', function() {
            this.player1.clickCard(this.stowaway);
            this.player1.clickPrompt('0');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.stowaway]
            });

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.stowaway);

            this.player1.clickCard(this.stowaway);
            expect(this.player1).toBeAbleToSelect(this.mine);
            expect(this.player1).toBeAbleToSelect(this.letGo);
            expect(this.player1).toBeAbleToSelect(this.storehouse);
            expect(this.player1).toBeAbleToSelect(this.fan);
            expect(this.player1).toBeAbleToSelect(this.katana);

            let mil = this.stowaway.getMilitarySkill();

            this.player1.clickCard(this.mine);
            expect(this.player1).toBeAbleToSelect(this.mine);
            expect(this.player1).not.toBeAbleToSelect(this.letGo);
            expect(this.player1).not.toBeAbleToSelect(this.storehouse);
            expect(this.player1).not.toBeAbleToSelect(this.fan);
            expect(this.player1).not.toBeAbleToSelect(this.katana);

            this.player1.clickPrompt('Done');

            expect(this.stowaway.getMilitarySkill()).toBe(mil);
            expect(this.mine.location).toBe(this.stowaway.uuid);

            expect(this.getChatLogs(5)).toContain('player1 uses Stowaway to place Iron Mine beneath Stowaway');
        });

        it('should not react on entering play outside of a conflict, but should on declaration as a defender', function() {
            this.player1.clickCard(this.stowaway);
            this.player1.clickPrompt('0');
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yakamo],
                defenders: [this.stowaway]
            });

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.stowaway);
        });
    });
});
