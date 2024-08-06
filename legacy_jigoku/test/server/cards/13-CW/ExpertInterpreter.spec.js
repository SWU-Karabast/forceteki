describe('Expert Interpreter', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'draw',
                player1: {
                    inPlay: ['expert-interpreter', 'seeker-of-knowledge', 'fushicho', 'tainted-hero', 'ikoma-ujiaki'],
                    hand: ['charge', 'forebearer-s-echoes', 'young-harrier', 'shosuro-miyako-2'],
                    dynastyDiscard: ['isawa-ujina', 'akodo-toturi', 'daidoji-kageyu']
                },
                player2: {
                    honor: 11,
                    inPlay: ['daidoji-uji', 'kitsu-spiritcaller'],
                    hand: ['charge', 'tattooed-wanderer'],
                    dynastyDiscard: ['doji-challenger', 'doji-whisperer'],
                    provinces: ['gateway-to-meido']
                }
            });
            this.interpreter = this.player1.findCardByName('expert-interpreter');
            this.seekerOfKnowledge = this.player1.findCardByName('seeker-of-knowledge');
            this.fushicho = this.player1.findCardByName('fushicho');
            this.hero = this.player1.findCardByName('tainted-hero');
            this.chargeP1 = this.player1.findCardByName('charge');
            this.echoes = this.player1.findCardByName('forebearer-s-echoes');
            this.harrier = this.player1.findCardByName('young-harrier');
            this.ujina = this.player1.findCardByName('isawa-ujina');
            this.miyako = this.player1.findCardByName('shosuro-miyako-2');
            this.toturi = this.player1.placeCardInProvince('akodo-toturi', 'province 1');
            this.toturi.facedown = false;
            this.kageyu = this.player1.placeCardInProvince('daidoji-kageyu', 'province 2');
            this.kageyu.facedown = false;
            this.ujiaki = this.player1.findCardByName('ikoma-ujiaki');

            this.uji = this.player2.findCardByName('daidoji-uji');
            this.spiritcaller = this.player2.findCardByName('kitsu-spiritcaller');
            this.chargeP2 = this.player2.findCardByName('charge');
            this.wanderer = this.player2.findCardByName('tattooed-wanderer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.whisperer = this.player2.placeCardInProvince('doji-whisperer', 'province 1');
            this.whisperer.facedown = false;
            this.meido = this.player2.findCardByName('gateway-to-meido');
            this.uji.honor();

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
        });

        it('should trigger at the start of the conflict phase', function () {
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.interpreter);
        });

        it('should let you choose a ring', function () {
            this.noMoreActions();
            this.player1.clickCard(this.interpreter);
            expect(this.player1).toHavePrompt('Choose a ring');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).toBeAbleToSelectRing('void');
            expect(this.player1).toBeAbleToSelectRing('fire');
            expect(this.player1).toBeAbleToSelectRing('water');
        });

        it('should let opponent optionally choose a ring', function () {
            this.noMoreActions();
            this.player1.clickCard(this.interpreter);
            this.player1.clickRing('air');
            expect(this.player2).toHavePrompt('Give an honor to your opponent?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            this.player2.clickPrompt('Yes');
            expect(this.getChatLogs(1)).toContain('player2 chooses to give player1 1 honor');
            expect(this.player2).toHavePrompt('Choose a ring');
            expect(this.player2).toBeAbleToSelectRing('air');
            expect(this.player2).toBeAbleToSelectRing('earth');
            expect(this.player2).toBeAbleToSelectRing('void');
            expect(this.player2).toBeAbleToSelectRing('fire');
            expect(this.player2).toBeAbleToSelectRing('water');
            expect(this.player2).toHavePromptButton('Done');
        });

        it('should transfer honor and display correct message (opponent chooses a ring)', function () {
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;
            this.noMoreActions();
            this.player1.clickCard(this.interpreter);
            this.player1.clickRing('air');
            this.player2.clickPrompt('Yes');
            this.player2.clickRing('fire');
            expect(this.getChatLogs(3)).toContain(
                'player1 uses Expert Interpreter to prevent characters from entering play while the Air Ring is contested.  player2 gives player1 1 honor to also apply this effect to the Fire Ring'
            );
            expect(this.player1.honor).toBe(p1Honor + 1);
            expect(this.player2.honor).toBe(p2Honor - 1);
        });

        it('should NOT transfer honor and display correct message (opponent does not choose a ring)', function () {
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;
            this.noMoreActions();
            this.player1.clickCard(this.interpreter);
            this.player1.clickRing('air');
            this.player2.clickPrompt('No');
            expect(this.getChatLogs(3)).toContain(
                'player1 uses Expert Interpreter to prevent characters from entering play while the Air Ring is contested'
            );
            expect(this.player1.honor).toBe(p1Honor);
            expect(this.player2.honor).toBe(p2Honor);
        });

        describe('Should stop characters from entering play during conflicts with the selected ring - ', function () {
            beforeEach(function () {
                this.noMoreActions();
                this.player1.clickCard(this.interpreter);
                this.player1.clickRing('air');
                this.player2.clickPrompt('No');
                this.noMoreActions();
                this.initiateConflict({
                    ring: 'air',
                    type: 'military',
                    attackers: [this.interpreter, this.ujiaki],
                    defenders: [],
                    province: this.meido
                });
            });

            it('playing characters from discard (meido)', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.challenger);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('playing characters from province (uji)', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.whisperer);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('charge', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.chargeP2);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('monk attachments', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.wanderer);
                this.player2.clickCard(this.uji);
                expect(this.wanderer.location).toBe('play area');
                expect(this.uji.attachments.length).toBe(1);
            });

            it('echoes', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.echoes);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('spiritcaller', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.spiritcaller);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('fushicho', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.hero);
                this.player1.clickCard(this.fushicho);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('ujiaki', function () {
                this.kageyu.facedown = true;
                this.player1.player.imperialFavor = 'military';
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.ujiaki);
                expect(this.kageyu.facedown).toBe(false);
                expect(this.player1).not.toHavePrompt('Ikoma Ujiaki');
                expect(this.player1).not.toHavePromptButton('Done');
                expect(this.player1).not.toBeAbleToSelect(this.kageyu);
            });

            it('character from hand', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.harrier);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('disguised character from hand', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.miyako);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('disguised character from province', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.kageyu);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });

        describe('Should stop characters from entering play during conflicts with the ring selected by opponent', function () {
            beforeEach(function () {
                this.noMoreActions();
                this.player1.clickCard(this.interpreter);
                this.player1.clickRing('air');
                this.player2.clickPrompt('Yes');
                this.player2.clickRing('earth');
                this.noMoreActions();
                this.initiateConflict({
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.interpreter],
                    defenders: [],
                    province: this.meido
                });
            });

            it('playing characters from discard (meido)', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.challenger);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });
        });

        describe('Should not stop characters from entering play during conflicts without the selected ring - ', function () {
            beforeEach(function () {
                this.noMoreActions();
                this.player1.clickCard(this.interpreter);
                this.player1.clickRing('air');
                this.player2.clickPrompt('No');
                this.noMoreActions();
                this.initiateConflict({
                    ring: 'fire',
                    type: 'military',
                    attackers: [this.interpreter, this.ujiaki],
                    defenders: [],
                    province: this.meido
                });
            });

            it('playing characters from discard (meido)', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.challenger);
                expect(this.player2).toHavePrompt('Doji Challenger');
            });

            it('playing characters from province (uji)', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.whisperer);
                expect(this.player2).toHavePrompt('Doji Whisperer');
            });

            it('charge', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.chargeP2);
                expect(this.player2).toHavePrompt('Charge!');
            });

            it('monk attachments', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.wanderer);
                expect(this.player2).toHavePromptButton('Play this character');
                expect(this.player2).toHavePromptButton('Play Tattooed Wanderer as an attachment');
            });

            it('echoes', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.echoes);
                expect(this.player1).toHavePrompt('Forebearer\'s Echoes');
            });

            it('spiritcaller', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.spiritcaller);
                expect(this.player2).toHavePrompt('Kitsu Spiritcaller');
            });

            it('fushicho', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.hero);
                this.player1.clickCard(this.fushicho);
                expect(this.player1).toHavePrompt('Any interrupts to Fushichō leaving play?');
            });

            it('ujiaki', function () {
                this.kageyu.facedown = true;
                this.player1.player.imperialFavor = 'military';
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.ujiaki);
                expect(this.kageyu.facedown).toBe(false);
                expect(this.player1).toHavePrompt('Ikoma Ujiaki');
                expect(this.player1).toHavePromptButton('Done');
                expect(this.player1).toBeAbleToSelect(this.kageyu);
            });

            it('character from hand', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.harrier);
                expect(this.player1).toHavePrompt('Young Harrier');
            });

            it('disguised character from hand', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.miyako);
                expect(this.player1).toHavePrompt('Shosuro Miyako');
            });

            it('disguised character from province', function () {
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.kageyu);
                expect(this.player1).toHavePrompt('Daidoji Kageyu');
            });
        });

        describe('Seeker of Knowledge should not impact - ', function () {
            beforeEach(function () {
                this.noMoreActions();
                this.player1.clickCard(this.interpreter);
                this.player1.clickRing('air');
                this.player2.clickPrompt('No');
                this.noMoreActions();
                this.initiateConflict({
                    ring: 'fire',
                    type: 'military',
                    attackers: [this.interpreter, this.seekerOfKnowledge],
                    defenders: [],
                    province: this.meido
                });
            });

            it('playing characters from discard (meido)', function () {
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.challenger);
                expect(this.player2).toHavePrompt('Doji Challenger');
            });
        });
    });
});
