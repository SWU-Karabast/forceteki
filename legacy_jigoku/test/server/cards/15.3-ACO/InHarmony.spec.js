describe('In Harmony', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['miya-mystic', 'bayushi-manipulator'],
                    hand: [
                        'karmic-twist',
                        'shadow-steed',
                        'embrace-the-void',
                        'in-harmony',
                        'seal-of-the-unicorn',
                        'i-am-ready'
                    ],
                    dynastyDiscard: ['daidoji-kageyu']
                },
                player2: {
                    inPlay: ['alibi-artist', 'miya-mystic'],
                    hand: ['assassination', 'karmic-twist']
                }
            });
            this.inHarmony = this.player1.findCardByName('in-harmony');
            this.miyaMystic = this.player1.findCardByName('miya-mystic');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.karmicTwist = this.player1.findCardByName('karmic-twist');
            this.steed = this.player1.findCardByName('shadow-steed');
            this.etv = this.player1.findCardByName('embrace-the-void');
            this.alibi = this.player2.findCardByName('alibi-artist');
            this.assassination = this.player2.findCardByName('assassination');
            this.twist2 = this.player2.findCardByName('karmic-twist');
            this.unicorn = this.player1.findCardByName('seal-of-the-unicorn');
            this.ready = this.player1.findCardByName('i-am-ready');

            this.miyaMystic.fate = 0;
            this.manipulator.fate = 2;
            this.alibi.fate = 1;

            this.manipulatorFate = this.manipulator.fate;

            this.kageyu = this.player1.placeCardInProvince('daidoji-kageyu', 'province 1');
            this.kageyu.facedown = false;
        });

        it('should not be able to play without a claimed ring', function () {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.inHarmony);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should be able to play with a claimed ring', function () {
            this.player1.claimRing('air');
            this.game.checkGameState(true);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.inHarmony);
            expect(this.player1).toHavePrompt('In Harmony');
            this.player1.clickCard(this.manipulator);
            expect(this.manipulator.attachments).toContain(this.inHarmony);
        });

        describe('In Harmony - While Attached ', function () {
            beforeEach(function () {
                this.player1.claimRing('air');
                this.game.checkGameState(true);
                this.player1.clickCard(this.inHarmony);
                this.player1.clickCard(this.manipulator);
            });

            it('should prevent my card effect', function () {
                this.player2.pass();
                this.player1.clickCard(this.karmicTwist);
                expect(this.player1).not.toBeAbleToSelect(this.manipulator);
                expect(this.player1).toBeAbleToSelect(this.alibi);
            });

            it('should prevent my ring effect', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.manipulator],
                    defenders: [],
                    ring: 'void'
                });
                this.noMoreActions();
                expect(this.player1).not.toBeAbleToSelect(this.manipulator);
                expect(this.player1).toBeAbleToSelect(this.alibi);
            });

            it('should prevent opponent card effect', function () {
                this.player2.clickCard(this.twist2);
                expect(this.player2).not.toBeAbleToSelect(this.manipulator);
                expect(this.player2).toBeAbleToSelect(this.alibi);
            });

            it('should prevent opponent ring effect', function () {
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

            it('framework - should not prevent disguised', function () {
                this.player2.pass();
                this.player1.clickCard(this.kageyu);
                this.player1.clickCard(this.manipulator);
                expect(this.kageyu.fate).toBe(this.manipulatorFate);
            });

            it('framework - should not prevent removing fate from leaving play', function () {
                this.player2.pass();
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

            it('costs - should allow you to remove fate for maho', function () {
                this.player2.pass();
                this.player1.clickCard(this.steed);
                this.player1.clickCard(this.manipulator);
                this.player1.clickCard(this.manipulator);
                this.player1.clickPrompt('1');
                expect(this.manipulator.fate).toBe(this.manipulatorFate - 1);
            });

            it('costs - should allow you to remove fate as a cost', function () {
                this.player2.pass();
                this.player1.clickCard(this.unicorn);
                this.player1.clickCard(this.manipulator);
                this.manipulator.bow();
                this.player2.pass();
                this.player1.clickCard(this.ready);
                this.player1.clickCard(this.manipulator);
                expect(this.manipulator.fate).toBe(this.manipulatorFate - 1);
                expect(this.manipulator.bowed).toBe(false);
            });

            it('framework - should not prevent fate phase', function () {
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
