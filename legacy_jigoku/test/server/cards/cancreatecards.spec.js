const { cards } = require('../../build/game/cards');

describe('All Cards:', function () {
    beforeEach(function () {
        this.gameSpy = jasmine.createSpyObj('game', [
            'on',
            'removeListener',
            'addPower',
            'addMessage',
            'addEffect',
            'getProvinceArray',
            'getPlayers'
        ]);
        this.gameSpy.rings = {
            air: {},
            earth: {},
            fire: {},
            void: {},
            water: {}
        };
        this.playerSpy = jasmine.createSpyObj('player', ['registerAbilityMax']);
        this.playerSpy.game = this.gameSpy;
        this.gameSpy.getProvinceArray.and.returnValue([
            'province 1',
            'province 2',
            'province 3',
            'province 4',
            'stronghold province'
        ]);
        this.gameSpy.getPlayers.and.returnValue([]);
    });

    cards.forEach((CardClass, cardId) => {
        it(`should be able to create '${cardId}' and set it up`, function () {
            expect(() => new CardClass(this.playerSpy, {})).not.toThrow();
        });
    });
});