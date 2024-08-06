const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { TargetModes, Locations } = require('../../Constants');
const { GameModes } = require('../../../GameModes.js');

class DanceOfChikushoDo extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Put cards into provinces',
            target: {
                mode: TargetModes.Select,
                targets: true,
                activePromptTitle: 'Choose any number of players',
                choices: {
                    [this.owner.name]: this.fillProvinces(this.owner),
                    [this.owner.opponent && this.owner.opponent.name || 'NA']: this.fillProvinces(this.owner.opponent),
                    [this.owner.name + ' and ' + (this.owner.opponent && this.owner.opponent.name || 'NA')]: AbilityDsl.actions.multiple([
                        this.fillProvinces(this.owner),
                        this.fillProvinces(this.owner.opponent)
                    ])
                }
            },
            effect: 'have {1} place 2 cards in each unbroken province they control',
            effectArgs: context => context.select,
            max: AbilityDsl.limit.perRound(1)
        });
    }

    fillProvinces(player) {
        return AbilityDsl.actions.handler({
            handler: () => {
                const unbrokenProvinces = this.getUnbrokenProvinces(player);
                unbrokenProvinces.forEach(province => {
                    this.game.queueSimpleStep(() => player.putTopDynastyCardInProvince(province, true));
                    this.game.queueSimpleStep(() => player.putTopDynastyCardInProvince(province, true));
                });
            }
        });
    }

    getUnbrokenProvinces(player) {
        let unbrokenLocations = [];
        let baseLocations = [Locations.ProvinceOne, Locations.ProvinceTwo, Locations.ProvinceThree];
        if(this.game.gameMode !== GameModes.Skirmish) {
            baseLocations.push(Locations.ProvinceFour);
        }
        baseLocations.forEach(p => {
            const province = player.getProvinceCardInProvince(p);
            if(!province.isBroken) {
                unbrokenLocations.push(p);
            }
        });

        return unbrokenLocations;
    }

}

DanceOfChikushoDo.id = 'dance-of-chikusho-do';

module.exports = DanceOfChikushoDo;
