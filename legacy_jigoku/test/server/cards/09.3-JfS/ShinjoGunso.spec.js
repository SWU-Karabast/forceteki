describe('Shinjo Gunso', function () {
    integration(function () {
        describe("Shinjo Gunso's ability", function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        dynastyDiscard: [
                            'shinjo-gunso',
                            'imperial-storehouse',
                            'favorable-ground',
                            'hida-kisada',
                            'borderlands-defender',
                            'hida-guardian',
                            'favorable-dealbroker',
                            'shinjo-yasamura',
                            'shinjo-yasamura'
                        ],
                        dynastyDeckSize: 4
                    }
                });

                this.gunso = this.player1.moveCard('shinjo-gunso', 'province 1');
                this.storehouse = this.player1.findCardByName('imperial-storehouse');
                this.favorableGround = this.player1.findCardByName('favorable-ground');
                this.kisada = this.player1.findCardByName('hida-kisada');
                this.hidaGuardian = this.player1.findCardByName('hida-guardian');
                this.borderlands = this.player1.findCardByName('borderlands-defender');
                this.dealbroker = this.player1.findCardByName('favorable-dealbroker');
                this.yas1 = this.player1.filterCardsByName('shinjo-yasamura')[0];
                this.yas2 = this.player1.filterCardsByName('shinjo-yasamura')[1];
                this.player1.moveCard(this.borderlands, 'dynasty deck');
                this.player1.moveCard(this.storehouse, 'dynasty deck');
                this.player1.moveCard(this.favorableGround, 'dynasty deck');
                this.player1.moveCard(this.kisada, 'dynasty deck');
                this.player1.moveCard(this.hidaGuardian, 'dynasty deck');
            });

            it('should react on entering play', function () {
                this.player1.clickCard(this.gunso);
                this.player1.clickPrompt('0');
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.gunso);
            });

            it('should allow you to put a character into play from the top 5 cards', function () {
                this.player1.clickCard(this.gunso);
                this.player1.clickPrompt('0');
                this.player1.clickCard(this.gunso);
                expect(this.player1).toHaveDisabledPromptButton('Imperial Storehouse');
                expect(this.player1).toHaveDisabledPromptButton('Favorable Ground');
                expect(this.player1).toHaveDisabledPromptButton('Hida Kisada');
                expect(this.player1).toHaveDisabledPromptButton('Borderlands Defender');
                expect(this.player1).toHavePromptButton('Hida Guardian');

                this.player1.clickPrompt('Hida Guardian');

                expect(this.hidaGuardian.location).toBe('play area');
                expect(this.storehouse.location).toBe('dynasty discard pile');
                expect(this.favorableGround.location).toBe('dynasty discard pile');
                expect(this.borderlands.location).toBe('dynasty discard pile');
                expect(this.kisada.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Shinjo Gunsō to search the top 5 cards of their dynasty deck for a character that costs 2 or less and put it into play'
                );
                expect(this.getChatLogs(5)).toContain(
                    'player1 puts Hida Guardian into play and discards Hida Kisada, Favorable Ground, Imperial Storehouse and Borderlands Defender'
                );
            });

            it('should allow you to put a character into play from the top 5 cards', function () {
                this.player1.clickCard(this.gunso);
                this.player1.clickPrompt('0');
                this.player1.clickCard(this.gunso);
                expect(this.player1).toHaveDisabledPromptButton('Imperial Storehouse');
                expect(this.player1).toHaveDisabledPromptButton('Favorable Ground');
                expect(this.player1).toHaveDisabledPromptButton('Hida Kisada');
                expect(this.player1).toHaveDisabledPromptButton('Borderlands Defender');
                expect(this.player1).toHavePromptButton('Hida Guardian');

                this.player1.clickPrompt('Hida Guardian');

                expect(this.hidaGuardian.location).toBe('play area');
                expect(this.storehouse.location).toBe('dynasty discard pile');
                expect(this.favorableGround.location).toBe('dynasty discard pile');
                expect(this.borderlands.location).toBe('dynasty discard pile');
                expect(this.kisada.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Shinjo Gunsō to search the top 5 cards of their dynasty deck for a character that costs 2 or less and put it into play'
                );
                expect(this.getChatLogs(5)).toContain(
                    'player1 puts Hida Guardian into play and discards Hida Kisada, Favorable Ground, Imperial Storehouse and Borderlands Defender'
                );
            });

            it('should work with less than 5 cards', function () {
                this.player1.moveCard(this.storehouse, 'dynasty discard pile');
                this.player1.moveCard(this.favorableGround, 'dynasty discard pile');
                this.player1.moveCard(this.kisada, 'dynasty discard pile');
                this.player1.moveCard(this.dealbroker, 'dynasty discard pile');

                this.player1.clickCard(this.gunso);
                this.player1.clickPrompt('0');
                this.player1.clickCard(this.gunso);
                expect(this.player1).toHavePromptButton('Hida Guardian');

                this.player1.clickPrompt('Hida Guardian');

                expect(this.hidaGuardian.location).toBe('play area');
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Shinjo Gunsō to search the top 5 cards of their dynasty deck for a character that costs 2 or less and put it into play'
                );
                expect(this.getChatLogs(5)).toContain(
                    'player1 puts Hida Guardian into play and discards Borderlands Defender'
                );
            });

            it('should work with 0 cards', function () {
                this.player1.moveCard(this.storehouse, 'dynasty discard pile');
                this.player1.moveCard(this.favorableGround, 'dynasty discard pile');
                this.player1.moveCard(this.kisada, 'dynasty discard pile');
                this.player1.moveCard(this.dealbroker, 'dynasty discard pile');
                this.player1.moveCard(this.borderlands, 'dynasty discard pile');
                this.player1.moveCard(this.hidaGuardian, 'dynasty discard pile');

                this.player1.clickCard(this.gunso);
                expect(this.player1).not.toHavePrompt('Triggered Abilities');
            });

            it('should work if no cards can be put into play', function () {
                this.player1.moveCard(this.hidaGuardian, 'dynasty discard pile');
                this.player1.moveCard(this.dealbroker, 'dynasty deck');

                this.player1.clickCard(this.gunso);
                this.player1.clickPrompt('0');
                this.player1.clickCard(this.gunso);
                expect(this.player1).toHavePromptButton('Take nothing');
                this.player1.clickPrompt('Take nothing');

                expect(this.dealbroker.location).toBe('dynasty discard pile');
                expect(this.storehouse.location).toBe('dynasty discard pile');
                expect(this.favorableGround.location).toBe('dynasty discard pile');
                expect(this.borderlands.location).toBe('dynasty discard pile');
                expect(this.kisada.location).toBe('dynasty discard pile');

                expect(this.getChatLogs(5)).toContain('player1 takes nothing');
            });

            it('should work if you take nothing', function () {
                this.player1.clickCard(this.gunso);
                this.player1.clickPrompt('0');
                this.player1.clickCard(this.gunso);
                expect(this.player1).toHaveDisabledPromptButton('Imperial Storehouse');
                expect(this.player1).toHaveDisabledPromptButton('Favorable Ground');
                expect(this.player1).toHaveDisabledPromptButton('Hida Kisada');
                expect(this.player1).toHaveDisabledPromptButton('Borderlands Defender');
                expect(this.player1).toHavePromptButton('Hida Guardian');

                this.player1.clickPrompt('Take Nothing');

                expect(this.hidaGuardian.location).toBe('dynasty discard pile');
                expect(this.storehouse.location).toBe('dynasty discard pile');
                expect(this.favorableGround.location).toBe('dynasty discard pile');
                expect(this.borderlands.location).toBe('dynasty discard pile');
                expect(this.kisada.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Shinjo Gunsō to search the top 5 cards of their dynasty deck for a character that costs 2 or less and put it into play'
                );
                expect(this.getChatLogs(5)).toContain('player1 takes nothing');
            });

            it('bug report - duplicate uniques', function () {
                this.player1.moveCard(this.yas1, 'play area');
                this.player1.moveCard(this.yas2, 'dynasty deck');

                this.player1.clickCard(this.gunso);
                this.player1.clickPrompt('0');
                this.player1.clickCard(this.gunso);
                expect(this.player1).toHaveDisabledPromptButton('Shinjo Yasamura');
            });

            it('should not shuffle', function () {
                this.player1.clickCard(this.gunso);
                this.player1.clickPrompt('0');
                this.player1.clickCard(this.gunso);
                this.player1.clickPrompt('Hida Guardian');
                expect(this.hidaGuardian.location).toBe('play area');
                expect(this.getChatLogs(5)).not.toContain('player1 is shuffling their dynasty deck');
            });
        });

        describe('Playing from Province via card', function () {
            integration(function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['shinjo-gunso', 'daidoji-uji'],
                            hand: ['prepared-ambush', 'way-of-the-crane'],
                            dynastyDiscard: ['hidden-moon-dojo']
                        },
                        player2: {}
                    });

                    this.gunso = this.player1.placeCardInProvince('shinjo-gunso', 'province 1');
                    this.uji = this.player1.findCardByName('daidoji-uji');
                    this.hmd = this.player1.findCardByName('hidden-moon-dojo');
                    this.ambush = this.player1.findCardByName('prepared-ambush');
                    this.crane = this.player1.findCardByName('way-of-the-crane');
                });

                it('should not react when played as if from hand', function () {
                    this.player1.clickCard(this.crane);
                    this.player1.clickCard(this.uji);
                    this.player2.pass();

                    this.player1.clickCard(this.gunso);
                    this.player1.clickPrompt('0');
                    expect(this.player1).not.toHavePrompt('Triggered Abilities');
                    expect(this.player2).toHavePrompt('Action Window');
                });
            });
        });
    });
});