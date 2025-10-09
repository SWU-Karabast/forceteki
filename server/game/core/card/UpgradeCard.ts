import type { Player } from '../Player';
import { WithPrintedHp } from './propertyMixins/PrintedHp';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithPrintedPower } from './propertyMixins/PrintedPower';
import * as Contract from '../utils/Contract';
import type { MoveZoneDestination } from '../Constants';
import { AbilityType, CardType, ZoneName, WildcardRelativePlayer, StandardTriggeredAbilityType } from '../Constants';
import { PlayUpgradeAction } from '../../actions/PlayUpgradeAction';
import type { IActionAbilityPropsWithGainCondition, IAttachCardContext, IConstantAbilityProps, IConstantAbilityPropsWithGainCondition, IDamagePreventionEffectAbilityPropsWithGainCondition, IKeywordPropertiesWithGainCondition, IReplacementEffectAbilityPropsWithGainCondition, ITriggeredAbilityBasePropsWithGainCondition, ITriggeredAbilityPropsWithGainCondition, WhenTypeOrStandard } from '../../Interfaces';
import OngoingEffectLibrary from '../../ongoingEffects/OngoingEffectLibrary';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import type { IPlayCardActionProperties } from '../ability/PlayCardAction';
import type { IUnitCard } from './propertyMixins/UnitProperties';
import type { IPlayableCard } from './baseClasses/PlayableOrDeployableCard';
import type { ICardCanChangeControllers, IUpgradeCard } from './CardInterfaces';
import type { ICardDataJson } from '../../../utils/cardData/CardDataInterfaces';
import type { IBasicAbilityRegistrar, IInPlayCardAbilityRegistrar, IUpgradeAbilityRegistrar } from './AbilityRegistrationInterfaces';
import type { IConstantAbilityRegistrar } from './propertyMixins/ConstantAbilityRegistration';
import type { IAbilityHelper } from '../../AbilityHelper';

const UpgradeCardParent = WithPrintedPower(WithPrintedHp(WithStandardAbilitySetup(InPlayCard)));

export class UpgradeCard extends UpgradeCardParent implements IUpgradeCard, IPlayableCard {
    public constructor(owner: Player, cardData: ICardDataJson) {
        super(owner, cardData);
        Contract.assertTrue([CardType.BasicUpgrade, CardType.TokenUpgrade].includes(this.printedType));
    }

    public override isUpgrade(): this is IUpgradeCard {
        return true;
    }

    public override isPlayable(): this is IPlayableCard {
        return true;
    }

    public override canChangeController(): this is ICardCanChangeControllers {
        return true;
    }

    public override getHp(): number {
        return this.printedUpgradeHp;
    }

    public override getPower(): number {
        return this.printedUpgradePower;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override checkIsAttachable(): void { }

    public override buildPlayCardAction(properties: IPlayCardActionProperties) {
        return this.game.gameObjectManager.createWithoutRefsUnsafe(() => new PlayUpgradeAction(this.game, this, properties));
    }

    public override getSummary(activePlayer: Player) {
        return {
            ...super.getSummary(activePlayer)
        };
    }

    public override moveTo(targetZoneName: MoveZoneDestination) {
        Contract.assertTrue(!this.state.parentCard || targetZoneName === this.parentCard.zoneName, `Attempting to move upgrade ${this.internalName} while it is still attached to ${this.state.parentCard ? this.parentCard.internalName : ''}`);

        super.moveTo(targetZoneName);
    }

    /**
     * Helper that adds an effect that applies to the attached unit. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    private addConstantAbilityTargetingAttached(properties: Pick<IConstantAbilityProps<UpgradeCard>, 'title' | 'condition' | 'matchTarget' | 'ongoingEffect'>, registrar: IConstantAbilityRegistrar<UpgradeCard>) {
        registrar.addConstantAbility({
            title: properties.title,
            condition: properties.condition || (() => true),
            matchTarget: (card, context) => this.isInPlay() && card === context.source.parentCard && (!properties.matchTarget || properties.matchTarget(card, context)),
            targetController: WildcardRelativePlayer.Any,   // this means that the effect continues to work even if the other player gains control of the upgrade
            ongoingEffect: properties.ongoingEffect
        });
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    private addGainConstantAbilityTargetingAttached(properties: IConstantAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>, registrar: IConstantAbilityRegistrar<UpgradeCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Constant, ...gainedAbilityProperties })
        }, registrar);
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    private addGainTriggeredAbilityTargetingAttached(properties: ITriggeredAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>, registrar: IConstantAbilityRegistrar<UpgradeCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Triggered, ...gainedAbilityProperties })
        }, registrar);
    }

    private addReplacementEffectAbilityTargetingAttached(properties: IReplacementEffectAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>, registrar: IConstantAbilityRegistrar<UpgradeCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.ReplacementEffect, ...gainedAbilityProperties })
        }, registrar);
    }


    private addDamagePreventionAbilityTargetingAttached(properties: IDamagePreventionEffectAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>, registrar: IConstantAbilityRegistrar<UpgradeCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainDamagePreventionAbility({ type: AbilityType.DamagePrevention, ...gainedAbilityProperties })
        }, registrar);
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is an action ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    private addGainActionAbilityTargetingAttached(properties: IActionAbilityPropsWithGainCondition<UpgradeCard, IUnitCard>, registrar: IConstantAbilityRegistrar<UpgradeCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Action, ...gainedAbilityProperties })
        }, registrar);
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is an "on attack" triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    private addGainOnAttackAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<UpgradeCard, IUnitCard>, registrar: IConstantAbilityRegistrar<UpgradeCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;
        const when: WhenTypeOrStandard = { [StandardTriggeredAbilityType.OnAttack]: true };

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Triggered, ...gainedAbilityProperties, when })
        }, registrar);
    }

    // TODO THRAWN2: update the below to use the whenDefeated property

    /**
     * Adds an "attached card gains [X]" ability, where X is an "when defeated" triggered ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    private addGainWhenDefeatedAbilityTargetingAttached(properties: ITriggeredAbilityBasePropsWithGainCondition<UpgradeCard, IUnitCard>, registrar: IConstantAbilityRegistrar<UpgradeCard>) {
        const { gainCondition, ...gainedAbilityProperties } = properties;
        const when: WhenTypeOrStandard = { [StandardTriggeredAbilityType.WhenDefeated]: true };
        const propsWithWhen = Object.assign(gainedAbilityProperties, { when });

        this.addConstantAbilityTargetingAttached({
            title: 'Give ability to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainAbility({ type: AbilityType.Triggered, ...propsWithWhen })
        }, registrar);
    }

    /**
     * Adds an "attached card gains [X]" ability, where X is a keyword ability. You can provide a match function
     * to narrow down whether the effect is applied (for cases where the effect has conditions).
     */
    private addGainKeywordTargetingAttached(properties: IKeywordPropertiesWithGainCondition<UpgradeCard>, registrar: IConstantAbilityRegistrar<UpgradeCard>) {
        const { gainCondition, ...keywordProperties } = properties;

        this.addConstantAbilityTargetingAttached({
            title: 'Give keyword to the attached card',
            condition: this.addZoneCheckToGainCondition(gainCondition),
            ongoingEffect: OngoingEffectLibrary.gainKeyword(keywordProperties)
        }, registrar);
    }

    /** Adds a condition that must return true for the upgrade to be allowed to attach to the passed card. */
    private setAttachCondition(attachCondition: (context: IAttachCardContext<this>) => boolean) {
        Contract.assertIsNullLike(this.attachCondition, 'Attach condition is already set');

        this.attachCondition = attachCondition;
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        super.initializeForCurrentZone(prevZone);

        switch (this.zoneName) {
            case ZoneName.Resource:
                this.setExhaustEnabled(true);
                break;

            default:
                this.setExhaustEnabled(false);
                break;
        }
    }

    protected override getAbilityRegistrar(): IUpgradeAbilityRegistrar {
        const registrar = super.getAbilityRegistrar() as IBasicAbilityRegistrar<UpgradeCard> & IInPlayCardAbilityRegistrar<UpgradeCard>;

        return {
            ...registrar,
            addConstantAbilityTargetingAttached: (properties) => this.addConstantAbilityTargetingAttached(properties, registrar),
            addGainConstantAbilityTargetingAttached: (properties) => this.addGainConstantAbilityTargetingAttached(properties, registrar),
            addGainTriggeredAbilityTargetingAttached: (properties) => this.addGainTriggeredAbilityTargetingAttached(properties, registrar),
            addReplacementEffectAbilityTargetingAttached: (properties) => this.addReplacementEffectAbilityTargetingAttached(properties, registrar),
            addDamagePreventionAbilityTargetingAttached: (properties) => this.addDamagePreventionAbilityTargetingAttached(properties, registrar),
            addGainActionAbilityTargetingAttached: (properties) => this.addGainActionAbilityTargetingAttached(properties, registrar),
            addGainOnAttackAbilityTargetingAttached: (properties) => this.addGainOnAttackAbilityTargetingAttached(properties, registrar),
            addGainWhenDefeatedAbilityTargetingAttached: (properties) => this.addGainWhenDefeatedAbilityTargetingAttached(properties, registrar),
            addGainKeywordTargetingAttached: (properties) => this.addGainKeywordTargetingAttached(properties, registrar),
            setAttachCondition: (attachCondition) => this.setAttachCondition(attachCondition),
        };
    }

    protected override callSetupWithRegistrar() {
        this.setupCardAbilities(this.getAbilityRegistrar(), this.game.abilityHelper);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) { }
}