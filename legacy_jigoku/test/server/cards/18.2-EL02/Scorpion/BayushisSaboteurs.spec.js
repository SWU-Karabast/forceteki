describe("Bayushi's Saboteurs", function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: [
                        'bayushi-s-saboteurs',
                        'daidoji-nerishma',
                        'kakita-yoshi',
                        'kakita-toshimoko',
                        'matsu-berserker',
                        'ikoma-prodigy',
                        'doji-challenger',
                        'prodigy-of-the-waves',
                        'hida-kisada',
                        'aranat',
                        'kakita-ryoku'
                    ],
                    dynastyDeck: [],
                    hand: ['way-of-the-crane', 'those-who-serve'],
                    dynastyDiscard: ['a-season-of-war', 'a-season-of-war']
                },
                player2: {
                    inPlay: [
                        'doji-whisperer',
                        'acolyte-of-koyane',
                        'adept-of-the-waves',
                        'agasha-hiyori',
                        'agasha-shunsen',
                        'agasha-sumiko',
                        'agasha-swordsmith',
                        'agasha-taiko',
                        'akodo-kaede',
                        'akodo-makoto'
                    ],
                    hand: ['those-who-serve'],
                    conflictDiscard: ['appeal-to-sympathy']
                }
            });

            this.spy = this.player1.findCardByName('bayushi-s-saboteurs');

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
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.shameful = this.player2.findCardByName('shameful-display', 'province 1');

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

        it('should have the defending player pick to discard or flip facedown', function () {
            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.shameful);
            this.player1.clickCard(this.spy);
            this.player1.clickPrompt('Initiate Conflict');
            expect(this.player1).toHavePrompt('Any reactions?');

            this.player1.clickCard(this.spy);
            expect(this.player2).toHavePrompt('Select one');
            expect(this.player2).toHavePromptButton('Discard all cards from your provinces');
            expect(this.player2).toHavePromptButton('Flip all cards in your provinces facedown');
        });

        it('discard - controller', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.whisperer],
                defenders: [this.spy]
            });

            this.player1.clickCard(this.spy);
            this.player1.clickPrompt('Discard all cards from your provinces');

            expect(this.season.location).toBe('dynasty discard pile');
            expect(this.challenger.location).toBe('dynasty discard pile');
            expect(this.prodigy.location).toBe('dynasty discard pile');
            expect(this.kisada.location).toBe('dynasty discard pile');
            expect(this.ikomaProdigy.location).toBe('dynasty discard pile');

            expect(this.sumiko.location).not.toBe('dynasty discard pile');
            expect(this.swordsmith.location).not.toBe('dynasty discard pile');
            expect(this.taiko.location).not.toBe('dynasty discard pile');
            expect(this.kaede.location).not.toBe('dynasty discard pile');
            expect(this.makoto.location).not.toBe('dynasty discard pile');

            expect(this.getChatLogs(10)).toContain(
                "player1 uses Bayushi's Saboteurs to discard all of player1's dynasty cards"
            );
        });

        it('should refill each province faceup', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.whisperer],
                defenders: [this.spy]
            });
            this.player1.clickCard(this.spy);
            this.player1.clickPrompt('Discard all cards from your provinces');

            expect(this.berserker.location).toBe('province 1');
            expect(this.toshimoko.location).toBe('province 2');
            expect(this.season2.location).toBe('province 3');
            expect(this.yoshi.location).toBe('province 4');

            expect(this.berserker.facedown).toBe(false);
            expect(this.toshimoko.facedown).toBe(false);
            expect(this.season2.facedown).toBe(false);
            expect(this.yoshi.facedown).toBe(false);
        });

        it('discard - player 2', function () {
            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.shameful);
            this.player1.clickCard(this.spy);
            this.player1.clickPrompt('Initiate Conflict');
            this.player1.clickCard(this.spy);

            this.player2.clickPrompt('Discard all cards from your provinces');

            expect(this.season.location).not.toBe('dynasty discard pile');
            expect(this.challenger.location).not.toBe('dynasty discard pile');
            expect(this.prodigy.location).not.toBe('dynasty discard pile');
            expect(this.kisada.location).not.toBe('dynasty discard pile');
            expect(this.ikomaProdigy.location).not.toBe('dynasty discard pile');

            expect(this.sumiko.location).toBe('dynasty discard pile');
            expect(this.swordsmith.location).toBe('dynasty discard pile');
            expect(this.taiko.location).toBe('dynasty discard pile');
            expect(this.kaede.location).toBe('dynasty discard pile');
            expect(this.makoto.location).toBe('dynasty discard pile');

            expect(this.getChatLogs(10)).toContain(
                "player1 uses Bayushi's Saboteurs to discard all of player2's dynasty cards"
            );
        });

        it('flip facedown - player 1', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.whisperer],
                defenders: [this.spy]
            });
            this.player1.clickCard(this.spy);
            this.player1.clickPrompt('Flip all cards in your provinces facedown');

            expect(this.season.facedown).toBe(true);
            expect(this.challenger.facedown).toBe(true);
            expect(this.prodigy.facedown).toBe(true);
            expect(this.kisada.facedown).toBe(true);
            expect(this.ikomaProdigy.facedown).toBe(true);

            expect(this.sumiko.facedown).toBe(false);
            expect(this.swordsmith.facedown).toBe(false);
            expect(this.taiko.facedown).toBe(false);
            expect(this.kaede.facedown).toBe(false);
            expect(this.makoto.facedown).toBe(false);

            expect(this.getChatLogs(10)).toContain(
                "player1 uses Bayushi's Saboteurs to flip facedown all of player1's dynasty cards"
            );
        });

        it('discard - player 2', function () {
            this.noMoreActions();
            this.player1.clickRing('air');
            this.player1.clickCard(this.shameful);
            this.player1.clickCard(this.spy);
            this.player1.clickPrompt('Initiate Conflict');
            this.player1.clickCard(this.spy);

            this.player2.clickPrompt('Flip all cards in your provinces facedown');

            expect(this.season.facedown).toBe(false);
            expect(this.challenger.facedown).toBe(false);
            expect(this.prodigy.facedown).toBe(false);
            expect(this.kisada.facedown).toBe(false);
            expect(this.ikomaProdigy.facedown).toBe(false);

            expect(this.sumiko.facedown).toBe(true);
            expect(this.swordsmith.facedown).toBe(true);
            expect(this.taiko.facedown).toBe(true);
            expect(this.kaede.facedown).toBe(true);
            expect(this.makoto.facedown).toBe(true);

            expect(this.getChatLogs(10)).toContain(
                "player1 uses Bayushi's Saboteurs to flip facedown all of player2's dynasty cards"
            );
        });
    });
});
