describe('A Season of War', function() {
    integration(function() {
        describe('Testing A Season of War', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['daidoji-nerishma', 'kakita-yoshi', 'kakita-toshimoko', 'matsu-berserker', 'ikoma-prodigy', 'doji-challenger', 'prodigy-of-the-waves', 'hida-kisada', 'aranat', 'kakita-ryoku'],
                        dynastyDeck: [],
                        hand: ['way-of-the-crane', 'those-who-serve'],
                        dynastyDiscard: ['a-season-of-war', 'a-season-of-war']
                    },
                    player2: {
                        inPlay: ['acolyte-of-koyane', 'adept-of-the-waves', 'agasha-hiyori', 'agasha-shunsen', 'agasha-sumiko', 'agasha-swordsmith', 'agasha-taiko', 'akodo-kaede', 'akodo-makoto'],
                        hand: ['those-who-serve'],
                        conflictDiscard: ['appeal-to-sympathy']
                    }
                });

                this.season = this.player1.filterCardsByName('a-season-of-war')[0];
                this.season2 = this.player1.filterCardsByName('a-season-of-war')[1];
                this.nerishma = this.player1.findCardByName('daidoji-nerishma');
                this.yoshi = this.player1.findCardByName('kakita-yoshi');
                this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.prodigy = this.player1.findCardByName('ikoma-prodigy');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.ikomaProdigy = this.player1.findCardByName('prodigy-of-the-waves');
                this.kisada = this.player1.findCardByName('hida-kisada');
                this.aranat = this.player1.findCardByName('aranat');
                this.ryoku = this.player1.findCardByName('kakita-ryoku');
                this.twsP1 = this.player1.findCardByName('those-who-serve');

                this.player1.placeCardInProvince(this.season, 'province 1');
                this.player1.placeCardInProvince(this.challenger, 'province 2');
                this.player1.placeCardInProvince(this.prodigy, 'province 3');
                this.player1.placeCardInProvince(this.kisada, 'province 4');

                this.player1.reduceDeckToNumber('dynasty deck', 0);
                this.player1.moveCard(this.aranat, 'dynasty deck');
                this.player1.moveCard(this.nerishma, 'dynasty deck');
                this.player1.moveCard(this.yoshi, 'dynasty deck');
                this.player1.moveCard(this.season2, 'dynasty deck');
                this.player1.moveCard(this.toshimoko, 'dynasty deck');
                this.player1.moveCard(this.berserker, 'dynasty deck');

                this.player1.moveCard(this.ikomaProdigy, 'province 2');
                this.season.facedown = false;

                this.acolyte = this.player2.findCardByName('acolyte-of-koyane');
                this.adept = this.player2.findCardByName('adept-of-the-waves');
                this.hiyori = this.player2.findCardByName('agasha-hiyori');
                this.shunsen = this.player2.findCardByName('agasha-shunsen');
                this.sumiko = this.player2.findCardByName('agasha-sumiko');
                this.swordsmith = this.player2.findCardByName('agasha-swordsmith');
                this.taiko = this.player2.findCardByName('agasha-taiko');
                this.kaede = this.player2.findCardByName('akodo-kaede');
                this.makoto = this.player2.findCardByName('akodo-makoto');

                this.player2.placeCardInProvince(this.sumiko, 'province 1');
                this.player2.placeCardInProvince(this.swordsmith, 'province 2');
                this.player2.placeCardInProvince(this.taiko, 'province 3');
                this.player2.placeCardInProvince(this.kaede, 'province 4');

                this.player2.reduceDeckToNumber('dynasty deck', 0);
                this.player2.moveCard(this.acolyte, 'dynasty deck');
                this.player2.moveCard(this.adept, 'dynasty deck');
                this.player2.moveCard(this.hiyori, 'dynasty deck');
                this.player2.moveCard(this.shunsen, 'dynasty deck');

                this.player2.moveCard(this.makoto, 'province 3');

                this.thoseWhoServe = this.player2.findCardByName('those-who-serve');
                this.appeal = this.player2.findCardByName('appeal-to-sympathy');
            });

            it('should discard each card in each province', function() {
                this.player1.clickCard(this.season);
                expect(this.season.location).toBe('dynasty discard pile');
                expect(this.challenger.location).toBe('dynasty discard pile');
                expect(this.prodigy.location).toBe('dynasty discard pile');
                expect(this.kisada.location).toBe('dynasty discard pile');
                expect(this.ikomaProdigy.location).toBe('dynasty discard pile');

                expect(this.sumiko.location).toBe('dynasty discard pile');
                expect(this.swordsmith.location).toBe('dynasty discard pile');
                expect(this.taiko.location).toBe('dynasty discard pile');
                expect(this.kaede.location).toBe('dynasty discard pile');
                expect(this.makoto.location).toBe('dynasty discard pile');
            });

            it('should refill each province faceup', function() {
                this.player1.clickCard(this.season);
                expect(this.berserker.location).toBe('province 1');
                expect(this.toshimoko.location).toBe('province 2');
                expect(this.season2.location).toBe('province 3');
                expect(this.yoshi.location).toBe('province 4');

                expect(this.shunsen.location).toBe('province 1');
                expect(this.hiyori.location).toBe('province 2');
                expect(this.adept.location).toBe('province 3');
                expect(this.acolyte.location).toBe('province 4');

                expect(this.berserker.facedown).toBe(false);
                expect(this.toshimoko.facedown).toBe(false);
                expect(this.season2.facedown).toBe(false);
                expect(this.yoshi.facedown).toBe(false);

                expect(this.shunsen.facedown).toBe(false);
                expect(this.hiyori.facedown).toBe(false);
                expect(this.adept.facedown).toBe(false);
                expect(this.acolyte.facedown).toBe(false);
            });

            it('should start a new dynasty phase - testing with on phase started reactions', function() {
                this.player1.player.imperialFavor = 'military';
                this.player1.clickCard(this.season);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.ryoku);
                this.player1.clickCard(this.ryoku);
                this.player1.clickCard(this.ryoku);
                expect(this.ryoku.isHonored).toBe(true);
            });

            it('should start a new dynasty phase - testing with Those Who Serve', function() {
                this.player1.clickCard('way-of-the-crane');
                this.player1.clickCard(this.ryoku);
                this.player2.clickCard(this.thoseWhoServe);
                expect(this.player1).toHavePrompt('Play cards from provinces');
                this.player1.clickCard(this.season);
                expect(this.player1).toHavePrompt('Play cards from provinces');
                this.player1.pass();

                expect(this.acolyte.location).toBe('province 4');
                let fate = this.player2.fate;
                this.player2.clickCard(this.acolyte);
                this.player2.clickPrompt('0');
                expect(this.player2.fate).toBe(fate - 3); //no discount
                expect(this.acolyte.location).toBe('play area');
            });

            it('should start a new dynasty phase - testing with passing', function() {
                this.player1.clickCard('way-of-the-crane');
                this.player1.clickCard(this.ryoku);
                this.player2.pass();
                expect(this.player1).toHavePrompt('Play cards from provinces');
                this.player1.clickCard(this.season);
                expect(this.player1).toHavePrompt('Play cards from provinces');
                this.player1.pass();
                expect(this.player2).toHavePrompt('Play cards from provinces');
                expect(this.acolyte.location).toBe('province 4');
                this.player2.clickCard(this.acolyte);
                this.player2.clickPrompt('0');
                expect(this.acolyte.location).toBe('play area');
            });

            it('players should not collect fate', function() {
                let p1Fate = this.player1.fate;
                let p2Fate = this.player2.fate;
                this.player1.clickCard(this.season);
                expect(this.player1.fate).toBe(p1Fate - 1); //-1 from Season of War
                expect(this.player2.fate).toBe(p2Fate);
            });

            it('players should not start a new round', function() {
                this.player1.clickCard(this.season);
                expect(this.game.roundNumber).toBe(1);
            });

            it('players should not reset limited count', function() {
                this.player1.clickCard(this.twsP1);
                expect(this.player1.player.limitedPlayed).toBe(1);
                this.player2.pass();
                this.player1.clickCard(this.season);
                expect(this.player1.player.limitedPlayed).toBe(1);
            });

            it('should properly progress to the draw phase', function() {
                this.player1.clickCard(this.season);
                this.noMoreActions();
                expect(this.game.currentPhase).toBe('draw');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
            });

            it('cancel via appeal to sympathy', function() {
                this.player2.moveCard(this.appeal, 'hand');
                this.player1.clickCard(this.season);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.appeal);
                this.player2.clickCard(this.appeal);
                expect(this.season.location).toBe('dynasty discard pile');
            });

            it('chat messages', function() {
                this.player1.clickCard(this.season);
                expect(this.getChatLogs(10)).toContain('player1 plays A Season of War to discard all cards in all provinces, and refill each province faceup');
                expect(this.getChatLogs(10)).toContain('The dynasty phase is ended due to the effects of A Season of War');
                expect(this.getChatLogs(10)).toContain('A Season of War has started a new dynasty phase!');
            });

            it('decking yourself should not cause multiple honor losses', function() {
                this.player1.reduceDeckToNumber('dynasty deck', 1);
                this.player1.clickCard(this.season);
                expect(this.getChatLogs(10).filter(a => a === 'player1\'s dynasty deck has run out of cards, so they lose 5 honor').length).toBe(1);
            });
        });


        describe('Testing that a dynasty event can only be played in the dynasty phase', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        dynastyDeck: [],
                        hand: ['way-of-the-crane'],
                        dynastyDiscard: ['a-season-of-war']
                    },
                    player2: {
                        hand: ['those-who-serve']
                    }
                });

                this.season = this.player1.findCardByName('a-season-of-war');
                this.player1.placeCardInProvince(this.season, 'province 1');
                this.season.facedown = false;
                this.thoseWhoServe = this.player2.findCardByName('those-who-serve');
            });

            it('should be playable in the dynasty phase', function() {
                expect(this.game.currentPhase).toBe('dynasty');
                this.player1.clickCard(this.season);
                expect(this.getChatLogs(10)).toContain('player1 plays A Season of War to discard all cards in all provinces, and refill each province faceup');
            });

            it('should not be playable in the draw phase', function() {
                this.player1.player.promptedActionWindows.draw = true;
                this.player2.player.promptedActionWindows.draw = true;
                this.noMoreActions();
                expect(this.game.currentPhase).toBe('draw');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                expect(this.game.currentPhase).toBe('draw');
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.season);
                expect(this.player1).toHavePrompt('Action Window');
                expect(this.game.currentPhase).toBe('draw');
            });

            it('should not be playable in the conflict phase', function() {
                this.noMoreActions();
                expect(this.game.currentPhase).toBe('draw');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                expect(this.game.currentPhase).toBe('conflict');
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.season);
                expect(this.player1).toHavePrompt('Action Window');
                expect(this.game.currentPhase).toBe('conflict');
            });

            it('should not be playable in the fate phase', function() {
                this.player1.player.promptedActionWindows.fate = true;
                this.player2.player.promptedActionWindows.fate = true;
                this.noMoreActions();
                expect(this.game.currentPhase).toBe('draw');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                expect(this.game.currentPhase).toBe('conflict');
                expect(this.player1).toHavePrompt('Action Window');
                this.noMoreActions();
                this.noMoreActions();
                this.noMoreActions();
                this.noMoreActions();
                this.noMoreActions();

                expect(this.game.currentPhase).toBe('fate');
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.season);
                expect(this.player1).toHavePrompt('Action Window');
                expect(this.game.currentPhase).toBe('fate');
            });
        });

        describe('Testing A Season of War with Mirrors Gaze', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['daidoji-nerishma', 'kakita-yoshi', 'kakita-toshimoko', 'matsu-berserker', 'ikoma-prodigy', 'doji-challenger', 'prodigy-of-the-waves', 'hida-kisada', 'aranat', 'kakita-ryoku'],
                        dynastyDeck: [],
                        hand: ['way-of-the-crane'],
                        dynastyDiscard: ['a-season-of-war', 'a-season-of-war', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves']
                    },
                    player2: {
                        inPlay: ['acolyte-of-koyane', 'adept-of-the-waves', 'agasha-hiyori', 'agasha-shunsen', 'agasha-sumiko', 'agasha-swordsmith', 'agasha-taiko', 'akodo-kaede', 'akodo-makoto'],
                        dynastyDiscard: ['adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves', 'adept-of-the-waves'],
                        hand: ['the-mirror-s-gaze']
                    }
                });

                this.season = this.player1.filterCardsByName('a-season-of-war')[0];
                this.season2 = this.player1.filterCardsByName('a-season-of-war')[1];
                this.nerishma = this.player1.findCardByName('daidoji-nerishma');
                this.yoshi = this.player1.findCardByName('kakita-yoshi');
                this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                this.berserker = this.player1.findCardByName('matsu-berserker');
                this.prodigy = this.player1.findCardByName('ikoma-prodigy');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.ikomaProdigy = this.player1.findCardByName('prodigy-of-the-waves');
                this.kisada = this.player1.findCardByName('hida-kisada');
                this.aranat = this.player1.findCardByName('aranat');
                this.ryoku = this.player1.findCardByName('kakita-ryoku');

                this.player1.placeCardInProvince(this.season, 'province 1');
                this.player1.placeCardInProvince(this.challenger, 'province 2');
                this.player1.placeCardInProvince(this.prodigy, 'province 3');
                this.player1.placeCardInProvince(this.kisada, 'province 4');

                this.player1.moveCard(this.aranat, 'dynasty deck');
                this.player1.moveCard(this.nerishma, 'dynasty deck');
                this.player1.moveCard(this.yoshi, 'dynasty deck');
                this.player1.moveCard(this.season2, 'dynasty deck');
                this.player1.moveCard(this.toshimoko, 'dynasty deck');
                this.player1.moveCard(this.berserker, 'dynasty deck');

                this.player1.moveCard(this.ikomaProdigy, 'province 2');
                this.season.facedown = false;

                this.acolyte = this.player2.findCardByName('acolyte-of-koyane');
                this.adept = this.player2.findCardByName('adept-of-the-waves');
                this.hiyori = this.player2.findCardByName('agasha-hiyori');
                this.shunsen = this.player2.findCardByName('agasha-shunsen');
                this.sumiko = this.player2.findCardByName('agasha-sumiko');
                this.swordsmith = this.player2.findCardByName('agasha-swordsmith');
                this.taiko = this.player2.findCardByName('agasha-taiko');
                this.kaede = this.player2.findCardByName('akodo-kaede');
                this.makoto = this.player2.findCardByName('akodo-makoto');

                this.player2.placeCardInProvince(this.sumiko, 'province 1');
                this.player2.placeCardInProvince(this.swordsmith, 'province 2');
                this.player2.placeCardInProvince(this.taiko, 'province 3');
                this.player2.placeCardInProvince(this.kaede, 'province 4');

                this.player2.moveCard(this.adept, 'dynasty deck');
                this.player2.moveCard(this.hiyori, 'dynasty deck');
                this.player2.moveCard(this.shunsen, 'dynasty deck');

                this.player2.moveCard(this.makoto, 'province 3');
                this.mirror = this.player2.findCardByName('the-mirror-s-gaze');

                this.acolyte.fate = 1;
                this.ryoku.fate = 1;

                this.player1.pass();
                this.player2.playAttachment(this.mirror, this.acolyte);
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.player2.passConflict();
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.player2.passConflict();
                this.noMoreActions();

                this.player2.clickPrompt('military');

                this.player2.clickPrompt('Done');
                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');

                this.player2.clickPrompt('End Round');
                this.player1.clickPrompt('End Round');
            });

            it('mirrors gaze interaction', function() {
                this.player1.player.imperialFavor = 'military';
                this.player2.pass();
                this.player1.clickCard(this.season);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.mirror);
                this.player2.clickCard(this.mirror);
                expect(this.getChatLogs(4)).toContain('player2 resolves A Season of War to discard all cards in all provinces, and refill each province faceup');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.ryoku);
                this.player1.clickCard(this.ryoku);
                this.player1.clickCard(this.ryoku);
                expect(this.ryoku.isHonored).toBe(true);
            });

            it('mirrors gaze interaction - should progress to the draw phase', function() {
                this.player1.player.imperialFavor = 'military';
                this.player2.pass();
                this.player1.clickCard(this.season);
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.mirror);
                this.player2.clickCard(this.mirror);
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.ryoku);
                this.player1.clickCard(this.ryoku);
                this.player1.clickCard(this.ryoku);
                expect(this.ryoku.isHonored).toBe(true);

                this.noMoreActions();
                expect(this.game.currentPhase).toBe('draw');
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');
                expect(this.game.currentPhase).toBe('conflict');
            });
        });
    });
});
