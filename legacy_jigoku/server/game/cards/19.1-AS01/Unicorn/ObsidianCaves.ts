import { CardTypes, Players } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

export default class ObsidianCaves extends ProvinceCard {
    static id = 'obsidian-caves';

    public setupCardAbilities() {
        this.action({
            title: 'Attacker moves a character home',
            target: {
                cardType: CardTypes.Character,
                controller: (context) => (context.player.isAttackingPlayer() ? Players.Self : Players.Opponent),
                player: (context) => (context.player.isAttackingPlayer() ? Players.Self : Players.Opponent),
                activePromptTitle: 'Choose a character to send home',
                cardCondition: (card) => card.isAttacking(),
                gameAction: AbilityDsl.actions.sendHome()
            }
        });
    }
}
