describe('The Receding Tide', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker', 'ancient-master', 'togashi-hoshi', 'callow-delegate', 'fushicho'],
                    hand: ['fine-katana', 'ornate-fan', 'the-receding-tide', 'bayushi-traitor']
                },
                player2: {
                    inPlay: ['keeper-initiate'],
                    hand: ['assassination']
                }
            });

            this.berserker = this.player1.findCardByName('matsu-berserker');
            this.callowDelegate = this.player1.findCardByName('callow-delegate');
            this.ancientMaster = this.player1.findCardByName('ancient-master');
            this.hoshi = this.player1.findCardByName('togashi-hoshi');
            this.fushicho = this.player1.findCardByName('fushicho');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.ornateFan = this.player1.findCardByName('ornate-fan');
            this.recedingTide = this.player1.findCardByName('the-receding-tide');
            this.bayushiTraitor = this.player1.findCardByName('bayushi-traitor');

            this.p1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.pStronghold = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.p21 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p22 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p23 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p24 = this.player2.findCardByName('shameful-display', 'province 4');
            this.p2Stronghold = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.keeper = this.player2.findCardByName('keeper-initiate');
            this.assassination = this.player2.findCardByName('assassination');
        });

        it('should allow for you to target a non-mythic character you own', function() {
            this.player1.clickCard(this.recedingTide);

            expect(this.player1).toBeAbleToSelect(this.berserker);
            expect(this.player1).toBeAbleToSelect(this.callowDelegate);
            expect(this.player1).toBeAbleToSelect(this.ancientMaster);
            expect(this.player1).not.toBeAbleToSelect(this.hoshi); //mythic
            expect(this.player1).not.toBeAbleToSelect(this.fushicho); //mythic
            expect(this.player1).not.toBeAbleToSelect(this.keeper); //unowned
        });

        it('should correctly check owner - controlled by opponent', function() {
            this.player1.clickCard(this.bayushiTraitor);
            this.player1.clickPrompt('0');
            this.player2.pass();
            this.player1.clickCard(this.recedingTide);

            expect(this.player1).toBeAbleToSelect(this.berserker);
            expect(this.player1).toBeAbleToSelect(this.callowDelegate);
            expect(this.player1).toBeAbleToSelect(this.ancientMaster);
            expect(this.player1).not.toBeAbleToSelect(this.hoshi); //mythic
            expect(this.player1).not.toBeAbleToSelect(this.fushicho); //mythic
            expect(this.player1).not.toBeAbleToSelect(this.keeper); //unowned
            expect(this.player1).toBeAbleToSelect(this.bayushiTraitor); //not controlled, but owned
        });

        it('should allow you to pick a non-stronghold province you control and put the character in there', function() {
            this.player1.clickCard(this.recedingTide);
            this.player1.clickCard(this.berserker);

            expect(this.player1).toBeAbleToSelect(this.p1);
            expect(this.player1).toBeAbleToSelect(this.p2);
            expect(this.player1).toBeAbleToSelect(this.p3);
            expect(this.player1).toBeAbleToSelect(this.p4);
            expect(this.player1).not.toBeAbleToSelect(this.pStronghold);

            expect(this.player1).not.toBeAbleToSelect(this.p21);
            expect(this.player1).not.toBeAbleToSelect(this.p22);
            expect(this.player1).not.toBeAbleToSelect(this.p23);
            expect(this.player1).not.toBeAbleToSelect(this.p24);
            expect(this.player1).not.toBeAbleToSelect(this.p2Stronghold);

            this.player1.clickCard(this.p1);

            expect(this.berserker.location).toBe(this.p1.location);
        });
    });
});
