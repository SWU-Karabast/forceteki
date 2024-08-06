const { discardFromPlay } = require('../../../../../build/game/GameActions/GameActions.js');

describe('Bake Kujira', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bake-kujira', 'doji-diplomat', 'doji-whisperer'],
                    hand: ['unleash-the-djinn', 'command-the-tributary'],
                    dynastyDiscard: ['funeral-pyre', 'iron-mine']
                },
                player2: {
                    inPlay: ['doji-kuwanan', 'doji-fumiki', 'daidoji-uji', 'isawa-skycaller'],
                    hand: ['way-of-the-scorpion', 'charge', 'forebearer-s-echoes', 'reprieve', 'fine-katana'],
                    conflictDiscard: ['mushin-no-shin'],
                    dynastyDiscard: ['bake-kujira', 'doji-challenger']
                }
            });

            this.whale = this.player1.findCardByName('bake-kujira');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.command = this.player1.findCardByName('command-the-tributary');
            this.pyre = this.player1.placeCardInProvince('funeral-pyre', 'province 1');
            this.mine = this.player1.findCardByName('iron-mine');
            this.djinn = this.player1.findCardByName('unleash-the-djinn');

            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.fumiki = this.player2.findCardByName('doji-fumiki');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.skycaller = this.player2.findCardByName('isawa-skycaller');

            this.scorp = this.player2.findCardByName('way-of-the-scorpion');
            this.charge = this.player2.findCardByName('charge');
            this.echoes = this.player2.findCardByName('forebearer-s-echoes');

            this.whale2 = this.player2.findCardByName('bake-kujira');
            this.uji = this.player2.findCardByName('daidoji-uji');
            this.reprieve = this.player2.findCardByName('reprieve');
            this.mushin = this.player2.findCardByName('mushin-no-shin');
            this.katana = this.player2.findCardByName('fine-katana');

            this.fumiki.fate = 5;
        });

        it('should not be able to be saved', function () {
            this.player2.moveCard(this.whale2, 'play area');
            this.player1.placeCardInProvince(this.mine, 'province 2');

            this.fumiki.action({
                title: 'Discard a character',
                target: {
                    gameAction: discardFromPlay()
                }
            });

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whale],
                defenders: [this.kuwanan, this.whale2, this.fumiki]
            });

            this.player2.clickCard(this.fumiki);
            this.player2.clickCard(this.whale);

            expect(this.whale.location).toBe('dynasty discard pile');

            expect(this.getChatLogs(5)).toContain('player2 uses Doji Fumiki to discard Bake-Kujira');
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('eats a character when it wins a conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whale],
                defenders: [this.kuwanan, this.fumiki],
                type: 'military'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Any reactions?');

            this.player1.clickCard(this.whale);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.fumiki);
            expect(this.player1).toBeAbleToSelect(this.kuwanan);

            this.player1.clickCard(this.kuwanan);
            expect(this.kuwanan.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Bake-Kujira to discard Doji Kuwanan');
        });
    });
});

describe('Bake Kujira - Dynasty', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    dynastyDiscard: ['bake-kujira', 'bake-kujira'],
                    provinces: ['tsuma', 'toshi-ranbo', 'manicured-garden'],
                    fate: 20
                },
                player2: {}
            });

            this.whale = this.player1.filterCardsByName('bake-kujira')[0];
            this.whale2 = this.player1.filterCardsByName('bake-kujira')[1];
            this.tsuma = this.player1.findCardByName('tsuma');
            this.ranbo = this.player1.findCardByName('toshi-ranbo');

            this.player1.placeCardInProvince(this.whale, this.tsuma.location);
            this.player1.placeCardInProvince(this.whale2, this.ranbo.location);
        });

        it('should not prompt you to add fate, but enter play with 1 fate', function () {
            this.player1.clickCard(this.whale);
            expect(this.player1).toHavePromptButton('0');
            expect(this.player1).not.toHavePromptButton('1');
            expect(this.player1).not.toHavePromptButton('2');
            this.player1.clickPrompt('0');
            expect(this.whale.location).toBe('play area');
            expect(this.whale.isHonored).toBe(true);
            expect(this.whale.fate).toBe(1);
        });

        it('should not be able to dupe for fate', function () {
            this.player1.clickCard(this.whale);
            this.player1.clickPrompt('0');
            expect(this.whale.fate).toBe(1);
            this.player2.pass();
            this.player1.clickCard(this.whale2);
            expect(this.whale.fate).toBe(1);
            expect(this.whale2.location).toBe(this.ranbo.location);
        });

        it('should not gain fate from Toshi Ranbo', function () {
            this.player1.clickCard(this.whale2);
            this.player1.clickPrompt('0');
            expect(this.whale2.fate).toBe(1);
        });
    });
});
