const { OngoingEffectValueWrapper } = require('./OngoingEffectValueWrapper');
const { AbilityType, Location, WildcardLocation } = require('../../Constants');
const Contract = require('../../utils/Contract');

// UP NEXT: refactor this to support managing multiple targets
class GainAbility extends OngoingEffectValueWrapper {
    constructor(gainedAbilityProps) {
        super(true);

        this.abilityType = gainedAbilityProps.type;

        if (this.abilityType === AbilityType.Constant) {
            throw new Error('Gaining constant abilities is not yet implemented');
        }

        this.properties = Object.assign(gainedAbilityProps, { printedAbility: false });

        // TODO: is there anything in SWU that causes a card to gain a constant ability?
        // if (this.abilityType === AbilityType.Constant && !this.properties.locationFilter) {
        //     this.properties.locationFilter = WildcardLocation.AnyArena;
        //     this.properties.abilityType = AbilityType.Constant;
        // }
    }

    /**
     * @override
     */
    setContext(context) {
        Contract.assertNotNullLike(context.source);
        Contract.assertNotNullLike(context.ability);

        super.setContext(context);

        this.source = this.context.source;
        this.abilityIdentifier = `gained_from_${context.ability.abilityIdentifier}`;
    }

    /**
     * @override
     * @param {import('../../card/baseClasses/InPlayCard').InPlayCard} target The card receiving the gained ability
     */
    apply(target) {
        Contract.assertNotNullLike(this.context?.source, 'gainAbility.apply() called when this.context.source is not set');

        let properties = Object.assign(this.properties, { gainAbilitySource: this.context.source });

        switch (this.abilityType) {
            case AbilityType.Action:
                this.value = target.createActionAbility(properties);
                return;

            case AbilityType.Triggered:
                this.value = target.addGainedTriggeredAbility(properties);
                return;

            case AbilityType.Constant:
                // TODO: is there anything in SWU that causes a card to gain a constant ability?
                // this.value = properties;
                // if (EnumHelpers.isArena(target.location)) {
                //     this.value.registeredEffects = [target.addEffectToEngine(this.value)];
                // }
                // return;

                throw new Error('Gaining constant abilities is not yet implemented');

            default:
                Contract.fail(`Unknown ability type: ${this.abilityType}`);
        }
    }

    /**
     * @override
     */
    unapply(target) {
        switch (this.abilityType) {
            case AbilityType.Action:
                // TODO THIS PR
                // target.removeActionAbility(this.value);
                return;

            case AbilityType.Triggered:
                target.removeGainedTriggeredAbility(this.value);
                return;

            case AbilityType.Constant:
                // TODO: is there anything in SWU that causes a card to gain a constant ability?
                // target.removeEffectFromEngine(this.value.registeredEffects[0]);
                // delete this.value.registeredEffects;

                throw new Error('Gaining constant abilities is not yet implemented');

            default:
                Contract.fail(`Unknown ability type: ${this.abilityType}`);
        }
    }
}

module.exports = GainAbility;
