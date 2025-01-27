import { InitiateAttackAction } from '../../../actions/InitiateAttackAction';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class LurkingTIEPhantom extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1810342362',
            internalName: 'lurking-tie-phantom',
        };
    }

    public override setupCardAbilities() {
        this.addReplacementEffectAbility({
            title: 'This unit can\'t be captured, damaged, or defeated by enemy card abilities',
            when: {
                onCardCaptured: (event, context) => event.card === context.source && event.context.source.controller !== context.source.controller,
                onDamageDealt: (event, context) => event.card === context.source && event.context.source.controller !== context.source.controller &&
                  !(event.context.ability instanceof InitiateAttackAction),
                onCardDefeated: (event, context) => event.card === context.source && event.defeatSource && !event.defeatSource.attack &&
                  event.defeatSource.card?.controller !== context.source.controller
            }
        });
    }
}

LurkingTIEPhantom.implemented = true;
