const DrawCard = require('../../drawcard.js');
const { Players, Elements } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

const elementKeys = {
    air: 'hallowed-ground-air',
    earth: 'hallowed-ground-earth',
    fire: 'hallowed-ground-fire'
};

class HallowedGround extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            targetController: Players.Opponent,
            condition: context => context.game.rings[this.getCurrentElementSymbol(elementKeys.fire)].isConsideredClaimed(context.player.opponent),
            effect: AbilityDsl.effects.playerCannot({
                cannot: 'placeFateWhenPlayingCharacter'
            })
        });

        this.persistentEffect({
            targetController: Players.Opponent,
            condition: context => context.game.rings[this.getCurrentElementSymbol(elementKeys.air)].isConsideredClaimed(context.player.opponent),
            effect: AbilityDsl.effects.playerDelayedEffect({
                when: {
                    afterConflict: (event, context) => event.conflict.loser === context.player.opponent && event.conflict.conflictUnopposed
                },
                message: '{0} loses 1 honor due to the constant effect of {1}',
                messageArgs: effectContext => [effectContext.player.opponent, effectContext.source],
                multipleTrigger: true,
                gameAction: AbilityDsl.actions.loseHonor()
            })
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKeys.air,
            prettyName: 'Honor Loss',
            element: Elements.Air
        });
        symbols.push({
            key: elementKeys.earth,
            prettyName: 'Cannot Claim Rings',
            element: Elements.Earth
        });
        symbols.push({
            key: elementKeys.fire,
            prettyName: 'Cannot Fate Characters',
            element: Elements.Fire
        });
        return symbols;
    }
}

HallowedGround.id = 'hallowed-ground';

module.exports = HallowedGround;
