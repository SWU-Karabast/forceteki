describe('Hida Etsuji', function() {
    integration(function() {
        describe('Hida Etsuji\'s covert ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['iuchi-shahai']
                    },
                    player2: {
                        inPlay: ['hida-etsuji', 'doji-whisperer', 'tengu-sensei', 'doji-challenger'],
                        provinces: ['manicured-garden']
                    }
                });
                this.shahai = this.player1.findCardByName('iuchi-shahai');

                this.etsuji = this.player2.findCardByName('hida-etsuji');
                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.tengu = this.player2.findCardByName('tengu-sensei');
                this.challenger = this.player2.findCardByName('doji-challenger');
                this.garden = this.player2.findCardByName('manicured-garden');
            });

            it('should not allow being chosen by covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.garden);
                this.player1.clickCard(this.shahai);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Iuchi Shahai');
                expect(this.player1).not.toBeAbleToSelect(this.etsuji);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.tengu);
                expect(this.player1).toBeAbleToSelect(this.challenger);
            });
        });

        describe('Hida Etsuji\'s province ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['isawa-atsuko'],
                        hand: ['supernatural-storm', 'banzai', 'against-the-waves'],
                        provinces: ['manicured-garden'],
                        dynastyDiscard: ['contested-countryside']
                    },
                    player2: {
                        inPlay: ['hida-etsuji'],
                        provinces: ['manicured-garden', 'midnight-revels', 'effective-deception'],
                        dynastyDiscard: ['contested-countryside'],
                        role: ['keeper-of-void']
                    }
                });
                this.atsuko = this.player1.findCardByName('isawa-atsuko');
                this.etsuji = this.player2.findCardByName('hida-etsuji');
                this.garden = this.player2.findCardByName('manicured-garden');
                this.revels = this.player2.findCardByName('midnight-revels');
                this.deception = this.player2.findCardByName('effective-deception');

                this.garden2 = this.player1.findCardByName('manicured-garden');
                this.storm = this.player1.findCardByName('supernatural-storm');
                this.banzai = this.player1.findCardByName('banzai');
                this.waves = this.player1.findCardByName('against-the-waves');
            });

            it('should allow using actions twice', function() {
                let fate = this.player2.fate;

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.atsuko],
                    defenders: [this.etsuji],
                    type: 'military',
                    province: this.garden
                });

                this.player2.clickCard(this.garden);
                this.player1.pass();
                this.player2.clickCard(this.garden);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.pass();
                this.player2.clickCard(this.garden);
                expect(this.player2).toHavePrompt('Conflict Action Window');

                expect(this.player2.fate).toBe(fate + 2);
            });

            it('should allow using interrupts twice', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.atsuko],
                    defenders: [this.etsuji],
                    type: 'military',
                    province: this.deception
                });

                this.player2.pass();
                this.player1.clickCard(this.storm);
                this.player1.clickCard(this.atsuko);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.deception);
                this.player2.clickCard(this.deception);
                this.player2.pass();
                this.player1.clickCard(this.banzai);
                this.player1.clickCard(this.atsuko);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.deception);
                this.player2.clickCard(this.deception);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.pass();

                this.player1.clickCard(this.waves);
                this.player1.clickCard(this.atsuko);
                expect(this.player2).not.toHavePrompt('Triggered Abilities');
                expect(this.atsuko.bowed).toBe(true);
            });

            it('should allow using reactions twice', function() {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.atsuko],
                    type: 'military',
                    province: this.revels
                });

                this.player2.clickCard(this.revels);
                this.player2.clickCard(this.atsuko);
                expect(this.atsuko.bowed).toBe(true);
                this.player2.clickPrompt('Done');
                this.noMoreActions();
                this.player1.clickCard(this.waves);
                this.player1.clickCard(this.atsuko);

                this.noMoreActions();
                this.player2.passConflict();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.atsuko],
                    type: 'political',
                    province: this.revels
                });
                this.player2.clickCard(this.revels);
                this.player2.clickCard(this.atsuko);
                expect(this.atsuko.bowed).toBe(true);
            });

            it('Contested Countryside - should not allow your opponent to use abilities twice', function() {
                this.coco1 = this.player1.moveCard('contested-countryside', 'province 1');
                this.coco1.facedown = false;

                this.coco2 = this.player2.moveCard('contested-countryside', 'province 2');
                this.coco2.facedown = false;

                let fate = this.player1.fate;

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.atsuko],
                    defenders: [this.etsuji],
                    type: 'military',
                    province: this.garden
                });

                this.player2.pass();
                this.player1.clickCard(this.garden);
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.garden);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.player1.fate).toBe(fate + 1);
            });

            it('Contested Countryside - should not allow using your opponent\'s abilities twice', function() {
                this.coco1 = this.player1.moveCard('contested-countryside', 'province 1');
                this.coco1.facedown = false;

                this.coco2 = this.player2.moveCard('contested-countryside', 'province 2');
                this.coco2.facedown = false;

                let fate = this.player2.fate;

                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.etsuji],
                    defenders: [this.atsuko],
                    type: 'military',
                    province: this.garden2
                });

                this.player1.pass();
                this.player2.clickCard(this.garden2);
                this.player1.pass();
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.garden2);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.player2.fate).toBe(fate + 1);
            });
        });
    });
});
