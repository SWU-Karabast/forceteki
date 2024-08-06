describe('Armor of the Fallen', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['borderlands-defender'],
                    hand: ['armor-of-the-fallen'],
                    conflictDiscard: ['way-of-the-crab', 'stowaway'],
                    dynastyDiscard: ['funeral-pyre', 'funeral-pyre', 'kaiu-envoy', 'kaiu-envoy', 'kaiu-envoy']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'brash-samurai', 'doji-challenger', 'benevolent-host', 'doji-kuwanan']
                }
            });

            this.borderlands = this.player1.findCardByName('borderlands-defender');
            this.armor = this.player1.findCardByName('armor-of-the-fallen');
            this.stowaway = this.player1.findCardByName('stowaway');
            this.wotc = this.player1.findCardByName('way-of-the-crab');
            this.pyre = this.player1.findCardByName('funeral-pyre');
            const envoys = this.player1.findAllCardsByName('kaiu-envoy');
            this.envoy1 = envoys[0];
            this.envoy2 = envoys[1];
            this.envoy3 = envoys[2];

            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.brash = this.player2.findCardByName('brash-samurai');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.host = this.player2.findCardByName('benevolent-host');
            this.kuwanan = this.player2.findCardByName('doji-kuwanan');

            this.player1.clickCard(this.armor);
            this.player1.clickCard(this.borderlands);
        });

        it('should prompt you to remove characters', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderlands],
                defenders: [this.whisperer, this.brash, this.challenger, this.host, this.kuwanan],
                type: 'military'
            });
            this.player2.pass();

            this.player1.clickCard(this.borderlands);
            expect(this.player1).toHavePrompt('Select card to remove from game');
            expect(this.player1).toBeAbleToSelect(this.envoy1);
            expect(this.player1).toBeAbleToSelect(this.envoy2);
            expect(this.player1).toBeAbleToSelect(this.envoy3);
            expect(this.player1).toBeAbleToSelect(this.stowaway);
            expect(this.player1).not.toBeAbleToSelect(this.wotc);
        });

        it('should prompt you to choose a participating character with cost <= characters chosen', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderlands],
                defenders: [this.whisperer, this.brash, this.challenger, this.host, this.kuwanan],
                type: 'military'
            });
            this.player2.pass();

            this.player1.clickCard(this.borderlands);
            this.player1.clickCard(this.envoy1);
            this.player1.clickCard(this.envoy2);
            this.player1.clickCard(this.stowaway);
            this.player1.clickPrompt('Done');
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.brash);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.host);
            expect(this.player1).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player1).toBeAbleToSelect(this.borderlands);

            this.player1.clickCard(this.challenger);
            expect(this.challenger.bowed).toBe(true);
            expect(this.envoy1.location).toBe('removed from game');
            expect(this.envoy2.location).toBe('removed from game');
            expect(this.stowaway.location).toBe('removed from game');
            expect(this.envoy3.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(5)).toContain(
                "player1 uses Borderlands Defender's gained ability from Armor of the Fallen, removing Kaiu Envoy, Kaiu Envoy and Stowaway from the game to bow Doji Challenger"
            );
        });

        it('if you remove too few cards should fizzle the effect', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderlands],
                defenders: [this.kuwanan],
                type: 'military'
            });
            this.player2.pass();
            this.player1.clickCard(this.borderlands);
            this.player1.clickCard(this.envoy1);
            this.player1.clickPrompt('Done');
            expect(this.envoy1.location).toBe('removed from game');
            expect(this.getChatLogs(5)).toContain(
                'player1 attempted to use Borderlands Defender, but there are insufficient legal targets'
            );
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
