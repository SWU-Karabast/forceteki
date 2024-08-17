import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
import Player from '../Player';


export class NewCard extends OngoingEffectSource {
    protected override id: string;

    public constructor(
        public readonly owner: Player,
        private readonly cardData: any
    ) {
        super(owner.game);

        this.readCardData(cardData);
    }

    protected readCardData(cardData: any) {
        this.id = cardData.id;
    }
}