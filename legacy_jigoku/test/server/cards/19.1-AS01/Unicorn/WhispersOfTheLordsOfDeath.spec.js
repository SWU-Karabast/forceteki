describe('Whispers of the Lords of Death', function () {
    integration(function () {
        describe('glory count effect', function () {
            it('adds the highest MIL skill from each player to their count', function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['whispers-of-the-lords-of-death', 'moto-conqueror', 'aggressive-moto'],
                        hand: ['curved-blade']
                    },
                    player2: {
                        inPlay: ['repentant-legion', 'hida-kisada']
                    }
                });

                this.curvedBlade = this.player1.findCardByName('curved-blade');
                this.motoConqueror = this.player1.findCardByName('moto-conqueror');

                this.player1.claimRing('earth');
                this.player1.claimRing('water');
                this.player2.claimRing('fire');
                this.player2.claimRing('void');
                this.player2.claimRing('air');

                this.player1.clickCard(this.curvedBlade);
                this.player1.clickCard(this.motoConqueror);

                this.flow.finishConflictPhase();
                /**
                 * p1 =  7 = 2 rings + 0 Glory + 5 MIL
                 * p2 = 13 = 3 rings + 1 Glory + 9 MIL
                 */
                expect(this.getChatLogs(5)).toContain('player2 wins the glory count 13 vs 7');
            });
        });

        describe('put into play ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['iuchi-wayfinder', 'miya-mystic'],
                        hand: ['whispers-of-the-lords-of-death', 'fine-katana']
                    },
                    player2: {
                        inPlay: ['solemn-scholar', 'isawa-tadaka-2'],
                        hand: ['assassination'],
                        dynastyDiscard: ['adept-of-the-waves']
                    }
                });

                this.wayfinder = this.player1.findCardByName('iuchi-wayfinder');
                this.mystic = this.player1.findCardByName('miya-mystic');
                this.whispers = this.player1.findCardByName('whispers-of-the-lords-of-death');
                this.katana = this.player1.findCardByName('fine-katana');

                this.solemnScholar = this.player2.findCardByName('solemn-scholar');
                this.assassination = this.player2.findCardByName('assassination');
                this.isawaTadaka = this.player2.findCardByName('isawa-tadaka-2');
                this.adeptOfTheWaves = this.player2.findCardByName('adept-of-the-waves');

                this.player1.clickCard(this.katana);
                this.player1.clickCard(this.wayfinder);
            });

            it('does not trigger outside conflicts', function () {
                this.player1.clickCard(this.mystic);
                this.player1.clickCard(this.katana);
                expect(this.player1).not.toHavePrompt('Triggered Abilities');

                this.player1.clickCard(this.whispers);
                expect(this.whispers.location).toBe('hand');
            });

            it('does not trigger when a character is removed from the game coming from the discard pile', function () {
                this.noMoreActions();

                this.initiateConflict({
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wayfinder],
                    defenders: []
                });

                this.player2.clickCard(this.isawaTadaka);
                this.player2.clickCard(this.adeptOfTheWaves);
                this.player2.clickPrompt('Done');
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).not.toBeAbleToSelect(this.whispers);
            });

            it('trigger on own character leaving play due to own action', function () {
                this.noMoreActions();

                this.initiateConflict({
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wayfinder],
                    defenders: []
                });

                this.player2.pass();
                this.player1.clickCard(this.mystic);
                this.player1.clickCard(this.katana);
                expect(this.player1).toHavePrompt('Triggered Abilities');

                this.player1.clickCard(this.whispers);
                expect(this.whispers.location).toBe('play area');
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Whispers of the Lords of Death to put Whispers of the Lords of Death into play and claim the Imperial Favor'
                );
                expect(this.getChatLogs(5)).toContain("player1 claims the Emperor's military favor!");
            });

            it('trigger on own character leaving play due to opponent action', function () {
                this.noMoreActions();

                this.initiateConflict({
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.wayfinder],
                    defenders: []
                });

                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.wayfinder);
                expect(this.player1).toHavePrompt('Triggered Abilities');

                this.player1.clickCard(this.whispers);
                expect(this.whispers.location).toBe('play area');
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Whispers of the Lords of Death to put Whispers of the Lords of Death into play and claim the Imperial Favor'
                );
                expect(this.getChatLogs(5)).toContain("player1 claims the Emperor's military favor!");
            });
        });
    });
});