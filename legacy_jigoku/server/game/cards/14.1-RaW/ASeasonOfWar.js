const DrawCard = require('../../drawcard.js');
const { Locations, Durations, Phases } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class ASeasonOfWar extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Discard all cards from provinces,  refill faceup, and start a new dynasty phase',
            effect: 'discard all cards in all provinces, and refill each province faceup',
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.discardCard(context => ({
                    target: context.player.getDynastyCardsInProvince(Locations.Provinces).concat(context.player.opponent ?
                        context.player.opponent.getDynastyCardsInProvince(Locations.Provinces) : [])
                })),
                AbilityDsl.actions.refillFaceup(context => ({
                    target: context.player,
                    location: [Locations.StrongholdProvince, Locations.ProvinceOne, Locations.ProvinceTwo, Locations.ProvinceThree, Locations.ProvinceFour]
                })),
                AbilityDsl.actions.refillFaceup(context => ({
                    target: context.player.opponent,
                    location: [Locations.StrongholdProvince, Locations.ProvinceOne, Locations.ProvinceTwo, Locations.ProvinceThree, Locations.ProvinceFour]
                })),
                AbilityDsl.actions.playerLastingEffect(context => ({
                    duration: Durations.Custom,
                    until: {
                        onPhaseStarted: event => event.phase === Phases.Dynasty
                    },
                    effect: AbilityDsl.effects.restartDynastyPhase(context.source)
                }))
            ])
        });
    }
}

ASeasonOfWar.id = 'a-season-of-war';

module.exports = ASeasonOfWar;
