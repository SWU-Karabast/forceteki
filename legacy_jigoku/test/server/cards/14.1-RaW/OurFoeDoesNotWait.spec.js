describe('Our Foe Does Not Wait', function() {
    integration(function() {
        describe('Our Foe Does Not Wait\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        dynastyDiscard: ['imperial-storehouse', 'shika-matchmaker', 'solemn-scholar', 'seventh-tower', 'watchtower-of-valor' ,'favorable-ground', 'hida-kisada', 'artisan-academy', 'hall-of-victories'],
                        inPlay: ['shrine-maiden'],
                        hand: ['our-foe-does-not-wait'],
                        conflictDiscard: ['our-foe-does-not-wait'],
                        dynastyDeckSize: 4
                    }
                });

                this.ourFoe = this.player1.findCardByName('our-foe-does-not-wait', 'hand');
                this.ourFoe2 = this.player1.findCardByName('our-foe-does-not-wait', 'conflict discard pile');
                this.shika = this.player1.findCardByName('shika-matchmaker');
                this.seventhTower = this.player1.findCardByName('seventh-tower');
                this.scholar = this.player1.findCardByName('solemn-scholar');
                this.storehouse = this.player1.findCardByName('imperial-storehouse');
                this.favorableGround = this.player1.findCardByName('favorable-ground');
                this.kisada = this.player1.findCardByName('hida-kisada');
                this.artisanAcademy = this.player1.findCardByName('artisan-academy');
                this.hallOfVictories = this.player1.findCardByName('hall-of-victories');
                this.player1.moveCard(this.storehouse, 'dynasty deck');
                this.player1.moveCard(this.shika, 'dynasty deck');
                this.player1.moveCard(this.scholar, 'dynasty deck');
                this.player1.moveCard(this.favorableGround, 'dynasty deck');
                this.player1.moveCard(this.kisada, 'dynasty deck');
                this.player1.moveCard(this.artisanAcademy, 'dynasty deck');
                this.player1.moveCard(this.hallOfVictories, 'dynasty deck');
                this.player1.moveCard(this.seventhTower, 'dynasty deck');

                this.p1 = this.player1.findCardByName('shameful-display', 'province 1');
                this.p2 = this.player1.findCardByName('shameful-display', 'province 2');
                this.p3 = this.player1.findCardByName('shameful-display', 'province 3');
                this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
                this.pStronghold = this.player1.findCardByName('shameful-display', 'stronghold province');

                this.noMoreActions();
                this.player1.clickPrompt('Pass Conflict');
                this.player1.clickPrompt('Yes');
            });

            it('should trigger when conflict is passed', function() {
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.ourFoe);
            });

            it('should let you trigger a non-stronghold province', function() {
                this.player1.clickCard(this.ourFoe);
                expect(this.player1).toHavePrompt('Choose a province');
                expect(this.player1).toBeAbleToSelect(this.p1);
                expect(this.player1).toBeAbleToSelect(this.p2);
                expect(this.player1).toBeAbleToSelect(this.p3);
                expect(this.player1).toBeAbleToSelect(this.p4);
                expect(this.player1).not.toBeAbleToSelect(this.pStronghold);
            });

            it('should let you pick any of the 8 cards', function() {
                this.player1.clickCard(this.ourFoe);
                this.player1.clickCard(this.p1);
                expect(this.player1).toHavePrompt('Select a card to reveal');
                expect(this.player1).toHavePromptButton('Imperial Storehouse');
                expect(this.player1).toHavePromptButton('Shika Matchmaker');
                expect(this.player1).toHavePromptButton('Solemn Scholar');
                expect(this.player1).toHavePromptButton('Favorable Ground');
                expect(this.player1).toHavePromptButton('Hida Kisada');
                expect(this.player1).toHavePromptButton('Artisan Academy');
                expect(this.player1).toHavePromptButton('Seventh Tower');
                expect(this.player1).toHavePromptButton('Hall of Victories');
            });

            it('should put the card selected in the province', function() {
                this.player1.clickCard(this.ourFoe);
                this.player1.clickCard(this.p1);
                this.player1.clickPrompt('Solemn Scholar');
                expect(this.scholar.location).toBe('province 1');
                expect(this.scholar.facedown).toBe(false);
            });

            it('should stack the card in the province', function() {
                let cards = this.player1.provinces['province 1'].dynastyCards.length;
                this.player1.clickCard(this.ourFoe);
                this.player1.clickCard(this.p1);
                this.player1.clickPrompt('Solemn Scholar');
                expect(this.player1.provinces['province 1'].dynastyCards.length).toBe(cards + 1);
            });

            it('should only let you use one per conflict', function() {
                this.player1.moveCard(this.ourFoe2, 'hand');
                this.player1.clickCard(this.ourFoe);
                this.player1.clickCard(this.p1);
                this.player1.clickPrompt('Solemn Scholar');
                expect(this.player1).toHavePrompt('Action Window');

                this.player1.pass();
                this.player2.pass();
                this.noMoreActions();
                this.player1.clickPrompt('Pass Conflict');
                this.player1.clickPrompt('Yes');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.ourFoe2);
            });
        });
    });
});
