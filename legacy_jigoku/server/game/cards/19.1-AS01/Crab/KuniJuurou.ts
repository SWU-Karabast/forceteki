import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Phases, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class KuniJuurou extends DrawCard {
    static id = 'kuni-juurou';

    public setupCardAbilities() {
        this.controllerCannotPayHonorCostsEffect();

        this.persistentEffect({
            targetController: Players.Any,
            match: (card) => card.type === CardTypes.Character && (card.isTainted || card.hasTrait('shadowlands')),
            effect: AbilityDsl.effects.modifyBothSkills(-2)
        });

        this.action({
            title: 'Taint a character',
            effect: "identify the source of Crab's misfortune… it is {0}! {0} is tainted.",
            phase: Phases.Conflict,
            condition: (context) =>
                context.player.opponent && context.player.hand.size() <= context.player.opponent.hand.size(),
            target: {
                cardType: CardTypes.Character,
                gameAction: AbilityDsl.actions.taint()
            }
        });
    }

    private controllerCannotPayHonorCostsEffect() {
        this.persistentEffect({
            effect: AbilityDsl.effects.playerCannot({ cannot: 'loseHonor', restricts: 'loseHonorAsCost' })
        });

        /**
         * Shortcut to handle tainted characters.
         * Ideally it would be integrated when generating the conflict matrix etc.
         * Without this Tainted character get stopped from commiting into the conflict, but the declaration goes through
         */
        this.persistentEffect({
            match: (card) => card.controller === this.controller && card.isTainted,
            effect: AbilityDsl.effects.cardCannot('declareAsAttacker')
        });
        this.persistentEffect({
            match: (card) => card.controller === this.controller && card.isTainted,
            effect: AbilityDsl.effects.cardCannot('declareAsDefender')
        });
    }
}