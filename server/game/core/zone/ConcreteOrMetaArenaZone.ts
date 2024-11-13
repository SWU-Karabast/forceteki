import { InPlayCard } from '../card/baseClasses/InPlayCard';
import { Card } from '../card/Card';
import { Location, WildcardCardType } from '../Constants';
import Game from '../Game';
import Player from '../Player';
import { IZoneCardFilterProperties, ZoneAbstract } from './ZoneAbstract';

export interface IArenaZoneCardFilterProperties extends IZoneCardFilterProperties {
    controller?: Player;
}

export abstract class ConcreteOrMetaArenaZone extends ZoneAbstract<InPlayCard> {
    public override readonly hiddenForPlayers: null;
    public override readonly owner: Game;

    public abstract override get cards(): InPlayCard[];

    public constructor(owner: Game) {
        super(owner);
    }

    public abstract override getCards(filter?: IArenaZoneCardFilterProperties): InPlayCard[];

    public override hasSomeCard(filter: IArenaZoneCardFilterProperties): boolean {
        return super.hasSomeCard(filter);
    }

    public getUnitCards(filter?: Omit<IArenaZoneCardFilterProperties, 'type'>): InPlayCard[] {
        return this.getCards({ ...filter, type: WildcardCardType.Unit });
    }

    public getUpgradeCards(filter?: Omit<IArenaZoneCardFilterProperties, 'type'>): InPlayCard[] {
        return this.getCards({ ...filter, type: WildcardCardType.Upgrade });
    }
}
