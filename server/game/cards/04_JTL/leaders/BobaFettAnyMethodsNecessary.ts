import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class BobaFettAnyMethodsNecessary extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9831674351',
            internalName: 'boba-fett#any-methods-necessary',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addPilotDeploy();

        this.addTriggeredAbility({
            title: 'Exhaust leader and exhaust the damaged enemy unit',
            optional: true,
            when: {
                onDamageDealt: (event, context) => event.source !== context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: context.player.opponent.base
            }))
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Deal up to 4 damage divided as you choose among any number of units.',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 4,
                target: context.player.opponent.base
            }))
        });
    }
}