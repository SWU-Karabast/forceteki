import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class AurraSingCrackshotSniper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3693364726',
            internalName: 'aurra-sing#crackshot-sniper'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Ready when an enemy ground unit attack base',
            when: {
                onAttackDeclared: (event, context) =>
                    event.attack.attacker.controller !== context.source.controller &&
                    event.attack.attacker.zoneName === ZoneName.GroundArena &&
                    event.attack.target === context.source.controller.base,
            },
            immediateEffect: AbilityHelper.immediateEffects.ready(),
        });
    }
}

AurraSingCrackshotSniper.implemented = true;
