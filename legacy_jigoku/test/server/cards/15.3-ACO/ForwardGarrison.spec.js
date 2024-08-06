describe('Forward Garrison', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['miya-mystic', 'bayushi-manipulator'],
                    hand: ['karmic-twist', 'embrace-the-void', 'shadow-steed'],
                    dynastyDiscard: ['daidoji-kageyu', 'forward-garrison', 'favorable-ground']
                },
                player2: {
                    inPlay: ['alibi-artist', 'miya-mystic'],
                    hand: ['assassination', 'karmic-twist']
                }
            });
            this.miyaMystic = this.player1.findCardByName('miya-mystic');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.karmicTwist = this.player1.findCardByName('karmic-twist');
            this.steed = this.player1.findCardByName('shadow-steed');
            this.etv = this.player1.findCardByName('embrace-the-void');
            this.alibi = this.player2.findCardByName('alibi-artist');
            this.assassination = this.player2.findCardByName('assassination');
            this.twist2 = this.player2.findCardByName('karmic-twist');

            this.miyaMystic.fate = 0;
            this.manipulator.fate = 2;
            this.alibi.fate = 1;

            this.manipulatorFate = this.manipulator.fate;

            this.kageyu = this.player1.placeCardInProvince('daidoji-kageyu', 'province 1');
            this.garrison = this.player1.placeCardInProvince('forward-garrison', 'province 2');
            this.kageyu.facedown = false;
            this.garrison.facedown = false;
            this.game.checkGameState(true);
        });

        describe('No Battlefield', function() {
            it('should not prevent my card effect', function() {
                this.player1.clickCard(this.karmicTwist);
                expect(this.player1).toBeAbleToSelect(this.manipulator);
                expect(this.player1).toBeAbleToSelect(this.alibi);
            });

            it('should not prevent my ring effect', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.manipulator],
                    defenders: [],
                    ring: 'void'
                });
                this.noMoreActions();
                expect(this.player1).toBeAbleToSelect(this.manipulator);
                expect(this.player1).toBeAbleToSelect(this.alibi);
            });

            it('should not prevent opponent card effect', function() {
                this.player1.pass();
                this.player2.clickCard(this.twist2);
                expect(this.player2).toBeAbleToSelect(this.manipulator);
                expect(this.player2).toBeAbleToSelect(this.alibi);
            });

            it('should not prevent opponent ring effect', function() {
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.alibi],
                    defenders: [],
                    ring: 'void'
                });
                this.noMoreActions();
                expect(this.player2).toBeAbleToSelect(this.manipulator);
                expect(this.player2).toBeAbleToSelect(this.alibi);
            });

            it('framework - should not prevent disguised', function() {
                this.player1.clickCard(this.kageyu);
                this.player1.clickCard(this.manipulator);
                expect(this.kageyu.fate).toBe(this.manipulatorFate);
            });

            it('framework - should not prevent removing fate from leaving play', function() {
                this.player1.clickCard(this.etv);
                this.player1.clickCard(this.manipulator);

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.manipulator],
                    defenders: [],
                    ring: 'void'
                });
                let fate = this.player1.fate;
                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.manipulator);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.etv);
                this.player1.clickCard(this.etv);
                expect(this.player1.fate).toBe(fate + this.manipulatorFate);
            });

            it('costs - should allow you to remove fate for maho', function() {
                this.player1.clickCard(this.steed);
                this.player1.clickCard(this.manipulator);
                this.player1.clickCard(this.manipulator);
                this.player1.clickPrompt('1');
                expect(this.manipulator.fate).toBe(this.manipulatorFate - 1);
            });

            it('framework - should not prevent fate phase', function() {
                this.player1.togglePromptedActionWindow('fate', true);
                this.player2.togglePromptedActionWindow('fate', true);
                this.advancePhases('fate');

                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');
                expect(this.manipulator.fate).toBe(this.manipulatorFate - 1);
            });
        });

        describe('Battlefield', function() {
            beforeEach(function() {
                this.ground = this.player1.placeCardInProvince('favorable-ground', 'province 3');
                this.ground.facedown = false;
                this.game.checkGameState(true);
            });

            it('should not prevent my card effect', function() {
                this.player1.clickCard(this.karmicTwist);
                expect(this.player1).toBeAbleToSelect(this.manipulator);
                expect(this.player1).toBeAbleToSelect(this.alibi);
            });

            it('should not prevent my ring effect', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.manipulator],
                    defenders: [],
                    ring: 'void'
                });
                this.noMoreActions();
                expect(this.player1).toBeAbleToSelect(this.manipulator);
                expect(this.player1).toBeAbleToSelect(this.alibi);
            });

            it('should prevent opponent card effect', function() {
                this.player1.pass();
                this.player2.clickCard(this.twist2);
                expect(this.player2).not.toBeAbleToSelect(this.manipulator);
                expect(this.player2).toBeAbleToSelect(this.alibi);
            });

            it('should prevent opponent ring effect', function() {
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.alibi],
                    defenders: [],
                    ring: 'void'
                });
                this.noMoreActions();
                expect(this.player2).not.toBeAbleToSelect(this.manipulator);
                expect(this.player2).toBeAbleToSelect(this.alibi);
            });

            it('framework - should not prevent disguised', function() {
                this.player1.clickCard(this.kageyu);
                this.player1.clickCard(this.manipulator);
                expect(this.kageyu.fate).toBe(this.manipulatorFate);
            });

            it('framework - should not prevent removing fate from leaving play', function() {
                this.player1.clickCard(this.etv);
                this.player1.clickCard(this.manipulator);

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.manipulator],
                    defenders: [],
                    ring: 'void'
                });
                let fate = this.player1.fate;
                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.manipulator);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.etv);
                this.player1.clickCard(this.etv);
                expect(this.player1.fate).toBe(fate + this.manipulatorFate);
            });

            it('costs - should allow you to remove fate for maho', function() {
                this.player1.clickCard(this.steed);
                this.player1.clickCard(this.manipulator);
                this.player1.clickCard(this.manipulator);
                this.player1.clickPrompt('1');
                expect(this.manipulator.fate).toBe(this.manipulatorFate - 1);
            });

            it('framework - should not prevent fate phase', function() {
                this.player1.togglePromptedActionWindow('fate', true);
                this.player2.togglePromptedActionWindow('fate', true);
                this.advancePhases('fate');

                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');
                expect(this.manipulator.fate).toBe(this.manipulatorFate - 1);
            });
        });
    });
});
