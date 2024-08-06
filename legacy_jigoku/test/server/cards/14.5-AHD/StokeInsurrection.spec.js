describe('Stoke Insurrection', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['expert-interpreter', 'seeker-of-knowledge', 'fushicho', 'tainted-hero', 'ikoma-ujiaki'],
                    hand: ['charge', 'forebearer-s-echoes', 'young-harrier', 'shosuro-miyako-2'],
                    dynastyDiscard: [
                        'isawa-ujina',
                        'akodo-toturi',
                        'daidoji-kageyu',
                        'imperial-storehouse',
                        'iron-mine',
                        'favorable-ground',
                        'city-of-lies',
                        'moto-youth',
                        'eager-scout'
                    ]
                },
                player2: {
                    honor: 11,
                    inPlay: ['daidoji-uji', 'kitsu-spiritcaller'],
                    hand: ['charge', 'tattooed-wanderer', 'stoke-insurrection', 'finger-of-jade'],
                    dynastyDiscard: ['doji-challenger', 'doji-whisperer'],
                    provinces: ['gateway-to-meido']
                }
            });

            this.interpreter = this.player1.findCardByName('expert-interpreter');
            this.seekerOfKnowledge = this.player1.findCardByName('seeker-of-knowledge');
            this.hero = this.player1.findCardByName('tainted-hero');
            this.chargeP1 = this.player1.findCardByName('charge');
            this.echoes = this.player1.findCardByName('forebearer-s-echoes');
            this.harrier = this.player1.findCardByName('young-harrier');
            this.miyako = this.player1.findCardByName('shosuro-miyako-2');
            this.kageyu = this.player1.findCardByName('daidoji-kageyu');
            this.toturi = this.player1.placeCardInProvince('akodo-toturi', 'province 1');
            this.storehouse = this.player1.placeCardInProvince('imperial-storehouse', 'province 2');
            this.ujina = this.player1.placeCardInProvince('isawa-ujina', 'province 3');
            this.fushicho = this.player1.placeCardInProvince('fushicho', 'province 4');
            this.youth = this.player1.findCardByName('moto-youth');
            this.scout = this.player1.findCardByName('eager-scout');

            this.insurrection = this.player2.findCardByName('stoke-insurrection');
            this.jade = this.player2.findCardByName('finger-of-jade');

            this.ujina.facedown = true;
            this.fushicho.facedown = true;
            this.toturi.facedown = true;
            this.storehouse.facedown = true;
            this.ujiaki = this.player1.findCardByName('ikoma-ujiaki');

            this.uji = this.player2.findCardByName('daidoji-uji');
            this.spiritcaller = this.player2.findCardByName('kitsu-spiritcaller');
            this.chargeP2 = this.player2.findCardByName('charge');
            this.wanderer = this.player2.findCardByName('tattooed-wanderer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.whisperer = this.player2.placeCardInProvince('doji-whisperer', 'province 1');
            this.whisperer.facedown = true;
            this.meido = this.player2.findCardByName('gateway-to-meido');
            this.uji.honor();

            this.noMoreActions();

            this.initiateConflict({
                ring: 'fire',
                type: 'military',
                attackers: [this.interpreter, this.ujiaki],
                defenders: [],
                province: this.meido
            });
        });

        it('should cost 2 if your opponent has 4 or more facedown cards', function () {
            let fate = this.player2.fate;
            this.player2.clickCard(this.insurrection);
            expect(this.player2.fate).toBe(fate - 2);
        });

        it('should cost 4 if your opponent has 4 or more facedown cards', function () {
            let fate = this.player2.fate;
            this.ujina.facedown = false;
            this.game.checkGameState(true);
            this.player2.clickCard(this.insurrection);
            expect(this.player2.fate).toBe(fate - 4);
        });

        it('should flip up all facedown cards in your opponent\'s provinces and not your own', function () {
            expect(this.ujina.facedown).toBe(true);
            expect(this.fushicho.facedown).toBe(true);
            expect(this.toturi.facedown).toBe(true);
            expect(this.storehouse.facedown).toBe(true);
            expect(this.whisperer.facedown).toBe(true);

            this.player2.clickCard(this.insurrection);
            expect(this.ujina.facedown).toBe(false);
            expect(this.fushicho.facedown).toBe(false);
            expect(this.toturi.facedown).toBe(false);
            expect(this.storehouse.facedown).toBe(false);
            expect(this.whisperer.facedown).toBe(true);
        });

        it('should let you choose characters in your opponent\'s provinces', function () {
            this.whisperer.facedown = false;
            this.player2.clickCard(this.insurrection);
            expect(this.player2).toHavePrompt('Choose up to two characters');
            expect(this.player2).toBeAbleToSelect(this.ujina);
            expect(this.player2).toBeAbleToSelect(this.fushicho);
            expect(this.player2).toBeAbleToSelect(this.toturi);
            expect(this.player2).not.toBeAbleToSelect(this.storehouse);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
        });

        it('should let you choose up to 2 characters in your opponent\'s provinces (to a max cost of 6)', function () {
            this.player1.moveCard(this.youth, 'province 4');
            this.player1.moveCard(this.scout, 'province 4');

            this.player2.clickCard(this.insurrection);
            expect(this.player2).toHavePrompt('Choose up to two characters');
            expect(this.player2).toHavePromptButton('Done');

            this.player2.clickCard(this.ujina);
            expect(this.player2).toBeAbleToSelect(this.youth);
            expect(this.player2).toBeAbleToSelect(this.scout);
            expect(this.player2).not.toBeAbleToSelect(this.fushicho);
            expect(this.player2).not.toBeAbleToSelect(this.toturi);
            this.player2.clickCard(this.fushicho);
            expect(this.player2.player.promptState.selectedCards).toContain(this.ujina);
            expect(this.player2.player.promptState.selectedCards).not.toContain(this.fushicho);
            this.player2.clickCard(this.youth);
            this.player2.clickCard(this.scout);
            expect(this.player2.player.promptState.selectedCards).toContain(this.youth);
            expect(this.player2.player.promptState.selectedCards).not.toContain(this.scout);

            this.player2.clickCard(this.ujina);
            this.player2.clickCard(this.youth);
            expect(this.player2.player.promptState.selectedCards).not.toContain(this.ujina);
            this.player2.clickCard(this.fushicho);
            this.player2.clickCard(this.toturi);

            expect(this.player2.player.promptState.selectedCards).not.toContain(this.ujina);
            expect(this.player2.player.promptState.selectedCards).toContain(this.fushicho);
            expect(this.player2.player.promptState.selectedCards).not.toContain(this.toturi);
        });

        it('should put the characters into play', function () {
            this.player1.moveCard(this.youth, 'province 4');
            this.player2.clickCard(this.insurrection);
            this.player2.clickCard(this.ujina);
            this.player2.clickCard(this.youth);
            this.player2.clickPrompt('Done');

            expect(this.game.currentConflict.defenders).toContain(this.ujina);
            expect(this.game.currentConflict.defenders).toContain(this.youth);

            expect(this.getChatLogs(5)).toContain(
                'player2 plays Stoke Insurrection to reveal player1\'s dynasty cards and put up to two of them into play'
            );
            expect(this.getChatLogs(5)).toContain(
                'player2 puts Isawa Ujina and Moto Youth into play into the conflict'
            );
        });

        it('you should control the characters', function () {
            this.player2.clickCard(this.insurrection);
            this.player2.clickCard(this.ujina);
            this.player2.clickCard(this.fushicho);
            this.player2.clickPrompt('Done');

            this.player1.pass();
            this.player2.clickCard(this.jade);
            expect(this.player2).toBeAbleToSelect(this.ujina);
            this.player2.clickCard(this.ujina);
            expect(this.ujina.attachments).toContain(this.jade);
        });

        it('you should still control the characters after the conflict', function () {
            this.player2.clickCard(this.insurrection);
            this.player2.clickCard(this.ujina);
            this.player2.clickPrompt('Done');

            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');
            this.player1.pass();
            expect(this.ujina.controller).toBe(this.player2.player);

            this.player2.clickCard(this.jade);
            expect(this.player2).toBeAbleToSelect(this.ujina);
            this.player2.clickCard(this.ujina);
            expect(this.ujina.attachments).toContain(this.jade);
        });

        it('should work without any facedown', function () {
            this.ujina.facedown = false;
            this.fushicho.facedown = false;
            this.toturi.facedown = false;
            this.storehouse.facedown = false;
            this.game.checkGameState(true);

            this.player2.clickCard(this.insurrection);
            expect(this.player2).toHavePrompt('Choose up to two characters');
            expect(this.player2).toBeAbleToSelect(this.ujina);
            expect(this.player2).toBeAbleToSelect(this.fushicho);
            expect(this.player2).toBeAbleToSelect(this.toturi);
        });

        it('should not work without any characters or facedown cards', function () {
            this.mine = this.player1.placeCardInProvince('iron-mine', 'province 1');
            this.ground = this.player1.placeCardInProvince('favorable-ground', 'province 3');
            this.lies = this.player1.placeCardInProvince('city-of-lies', 'province 4');

            let locations = ['province 1', 'province 2', 'province 3', 'province 4'];

            locations.forEach((location) => {
                let cards = this.player1.player.getDynastyCardsInProvince(location);
                cards.forEach((card) => {
                    if(card.type !== 'holding') {
                        this.player1.moveCard(card, 'dynasty discard pile');
                    } else {
                        card.facedown = false;
                    }
                });
            });
            this.game.checkGameState(true);

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.insurrection);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not work outside of a conflict', function () {
            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t Resolve');
            this.player1.pass();
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.insurrection);
            expect(this.player2).toHavePrompt('Action Window');
        });
    });
});

describe('Stoke Insurrection with Rally', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['isawa-ujina'],
                    dynastyDiscard: [
                        'a-season-of-war',
                        'ikoma-tsanuri-2',
                        'fushicho',
                        'tainted-hero',
                        'ikoma-ujiaki',
                        'kakita-toshimoko'
                    ]
                },
                player2: {
                    hand: ['stoke-insurrection']
                }
            });

            this.ujina = this.player1.findCardByName('isawa-ujina');
            this.season = this.player1.placeCardInProvince('a-season-of-war', 'province 1');
            this.tsanuri = this.player1.placeCardInProvince('ikoma-tsanuri-2', 'province 2');
            this.fushicho = this.player1.placeCardInProvince('fushicho', 'province 3');
            this.hero = this.player1.placeCardInProvince('tainted-hero', 'province 4');

            this.player1.reduceDeckToNumber('dynasty deck', 0);
            this.ujiaki = this.player1.moveCard('ikoma-ujiaki', 'dynasty deck');
            this.toshimoko = this.player1.moveCard('kakita-toshimoko', 'dynasty deck');

            this.insurrection = this.player2.findCardByName('stoke-insurrection');

            this.season.facedown = true;
            this.fushicho.facedown = true;
            this.tsanuri.facedown = true;
            this.hero.facedown = true;

            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.ujina],
                defenders: []
            });
        });

        it('should trigger rally before character selection', function () {
            expect(this.season.facedown).toBe(true);
            expect(this.fushicho.facedown).toBe(true);
            expect(this.tsanuri.facedown).toBe(true);
            expect(this.hero.facedown).toBe(true);
            expect(this.toshimoko.location).toBe('dynasty deck');
            expect(this.ujiaki.location).toBe('dynasty deck');

            this.player2.clickCard(this.insurrection);
            expect(this.season.facedown).toBe(false);
            expect(this.fushicho.facedown).toBe(false);
            expect(this.tsanuri.facedown).toBe(false);
            expect(this.hero.facedown).toBe(false);
            expect(this.toshimoko.location).toBe('province 1');
            expect(this.ujiaki.location).toBe('province 2');
            expect(this.player2).toHavePrompt('Choose up to two characters');
        });
    });
});
