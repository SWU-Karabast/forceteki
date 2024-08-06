describe('Exemplary Etiquette', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai', 'doji-challenger', 'daidoji-uji', 'hiruma-yoshino'],
                    hand: ['exemplary-etiquette', 'duelist-training'],
                    dynastyDiscard: ['favorable-ground']
                },
                player2: {
                    inPlay: ['cunning-negotiator', 'doji-hotaru', 'isawa-tsuke-2', 'reclusive-zokujin'],
                    hand: ['charge', 'called-to-war', 'duelist-training'],
                    dynastyDiscard: ['vanguard-warrior', 'moto-chagatai']
                }
            });

            this.brash = this.player1.findCardByName('brash-samurai');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.uji = this.player1.findCardByName('daidoji-uji');
            this.warrior = this.player2.placeCardInProvince('vanguard-warrior', 'province 2');
            this.negotiator = this.player2.findCardByName('cunning-negotiator');
            this.hotaru = this.player2.findCardByName('doji-hotaru');
            this.tsuke = this.player2.findCardByName('isawa-tsuke-2');
            this.yoshino = this.player1.findCardByName('hiruma-yoshino');
            this.dt = this.player1.findCardByName('duelist-training');
            this.dt2 = this.player2.findCardByName('duelist-training');

            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');

            this.ground = this.player1.placeCardInProvince('favorable-ground', 'province 1');
            this.etiquette = this.player1.findCardByName('exemplary-etiquette');
            this.charge = this.player2.findCardByName('charge');
            this.calledToWar = this.player2.findCardByName('called-to-war');
            this.chagatai = this.player2.placeCardInProvince('moto-chagatai', 'province 1');
            this.zokujin = this.player2.findCardByName('reclusive-zokujin');
        });

        it('should not trigger outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.etiquette);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should prevent characters from triggering abilities', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.negotiator],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.etiquette);
            this.player2.clickCard(this.negotiator);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.tsuke);
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.pass();
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should prevent characters from triggering gained abilities', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.negotiator],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.etiquette);
            this.player2.clickCard(this.negotiator);
            this.player2.pass();
            this.player1.clickCard(this.dt);
            this.player1.clickCard(this.challenger);
            this.player2.pass();
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should prevent characters that are put into play into the conflict from triggering abilities', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.negotiator],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.etiquette);
            this.player2.clickCard(this.charge);
            this.player2.clickCard(this.warrior);
            this.player1.pass();
            this.player2.clickCard(this.warrior);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        //This test fails - see #707
        // it('Zokujin should be immune during earth conflicts', function() {
        //     this.noMoreActions();

        //     this.initiateConflict({
        //         attackers: [this.challenger],
        //         defenders: [this.zokujin],
        //         ring: 'earth',
        //         type: 'military'
        //     });

        //     this.player2.clickCard(this.dt2);
        //     this.player2.clickCard(this.zokujin);
        //     this.player1.clickCard(this.etiquette);
        //     this.player2.clickCard(this.zokujin);
        //     expect(this.player2).toHavePrompt('hi')
        // });

        it('chat message', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.negotiator],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.etiquette);
            expect(this.getChatLogs(5)).toContain('player1 plays Exemplary Etiquette to make it so that characters cannot trigger abilities this conflict');
        });
    });
});
