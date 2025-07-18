import type { Player } from '../Player';
import { PlayUnitAction } from '../../actions/PlayUnitAction';
import * as Contract from '../utils/Contract';
import { CardType, PlayType, Trait, ZoneName } from '../Constants';
import type { IUnitCard } from './propertyMixins/UnitProperties';
import { WithUnitProperties } from './propertyMixins/UnitProperties';
import { InPlayCard } from './baseClasses/InPlayCard';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import type { IPlayCardActionProperties } from '../ability/PlayCardAction';
import type { IPlayableCard } from './baseClasses/PlayableOrDeployableCard';
import type { ICardCanChangeControllers } from './CardInterfaces';
import { PlayUpgradeAction } from '../../actions/PlayUpgradeAction';
import type { ICardDataJson } from '../../../utils/cardData/CardDataInterfaces';
import type { INonLeaderUnitAbilityRegistrar } from './AbilityRegistrationInterfaces';
import { type IAbilityHelper } from '../../AbilityHelper';

const NonLeaderUnitCardParent = WithUnitProperties(WithStandardAbilitySetup(InPlayCard));

export interface INonLeaderUnitCard extends IUnitCard, IPlayableCard {}

export class NonLeaderUnitCardInternal extends NonLeaderUnitCardParent implements INonLeaderUnitCard, ICardCanChangeControllers {
    public constructor(owner: Player, cardData: ICardDataJson) {
        super(owner, cardData);

        // superclasses check that we are a unit, check here that we are a non-leader unit
        Contract.assertFalse(this.printedType === CardType.Leader);
    }

    public override isNonLeaderUnit(): this is INonLeaderUnitCard {
        return !this.isAttached() && !this.isLeaderAttachedToThis();
    }

    public override canChangeController(): this is ICardCanChangeControllers {
        return true;
    }

    public override buildPlayCardAction(properties: IPlayCardActionProperties) {
        if (properties.playType === PlayType.Piloting) {
            return new PlayUpgradeAction(this.game, this, properties);
        }
        return new PlayUnitAction(this.game, this, properties);
    }

    public override isPlayable(): this is IPlayableCard {
        return true;
    }

    protected override getType(): CardType {
        return this.isAttached() ? CardType.NonLeaderUnitUpgrade : super.getType();
    }

    protected override initializeForCurrentZone(prevZone?: ZoneName): void {
        super.initializeForCurrentZone(prevZone);

        switch (this.zoneName) {
            case ZoneName.GroundArena:
            case ZoneName.SpaceArena:
                this.setActiveAttackEnabled(true);
                this.setDamageEnabled(true);
                this.setExhaustEnabled(true);
                this.setUpgradesEnabled(true);
                this.setCaptureZoneEnabled(true);
                break;

            case ZoneName.Resource:
                this.setActiveAttackEnabled(false);
                this.setDamageEnabled(false);
                this.setExhaustEnabled(true);
                this.setUpgradesEnabled(false);
                this.setCaptureZoneEnabled(false);
                break;

            default:
                this.setActiveAttackEnabled(false);
                this.setDamageEnabled(false);
                this.setExhaustEnabled(false);
                this.setUpgradesEnabled(false);
                this.setCaptureZoneEnabled(false);
                break;
        }
    }

    public override checkIsAttachable(): void {
        Contract.assertTrue(this.hasSomeTrait(Trait.Pilot));
    }
}

/** used for derived implementations classes. */
export class NonLeaderUnitCard extends NonLeaderUnitCardInternal {
    protected override state: never;

    protected override getAbilityRegistrar(): INonLeaderUnitAbilityRegistrar {
        return super.getAbilityRegistrar();
    }

    protected override callSetupWithRegistrar() {
        this.setupCardAbilities(this.getAbilityRegistrar(), this.game.abilityHelper);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) { }
}
