const Discord = require("discord.js")
const {  ApplicationCommandOptionType } = require("discord.js");
const messages = require("../utils/message");
const ms = require("ms")
module.exports = {
  name: 'iniciar',
  description: '🎉 Iniciar um novo sorteio',

  options: [
    {
      name: 'duração',
      description: 'Quanto tempo a oferta deve durar.Exemplo de valores: 1m, 1h, 1d',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'vencedores',
      description: 'Quantos vencedores o sorteio deveria ter',
      type: ApplicationCommandOptionType.Integer,
      required: true
    },
    {
      name: 'prêmio',
      description: 'Qual o prêmio do sorteio',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'canal',
      description: 'O canal para iniciar o sorteio',
      type: ApplicationCommandOptionType.Channel,
      required: true
    },
    {
      name: 'image',
      description: 'Imagem para o sorteio',
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: 'cargo-bônus',
      description: 'Cargo que receberá entradas bônus',
      type: ApplicationCommandOptionType.Role,
      required: false
    },
    {
      name: 'bônus-quantidade',
      description: 'A quantidade de entradas de bônus que o cargo receberá',
      type: ApplicationCommandOptionType.Integer,
      required: false
    },
    {
      name: 'convite',
      description: 'Convite do servidor que você deseja adicionar como requisito do sorteio',
      type: ApplicationCommandOptionType.String,
      required: false
    },
    {
      name: 'cargo',
      description: 'Cargo que você deseja adicionar como sorteio de requisitos do sorteio',
      type: ApplicationCommandOptionType.Role,
      required: false
    },
  ],

  run: async (client, interaction) => {

    // If the member doesn't have enough permissions
    if (!interaction.member.permissions.has('ManageMessages') && !interaction.member.roles.cache.some((r) => r.name === "Moderador")) {
      return interaction.reply({
        content: ':x: Você precisa ter as permissões de gerenciamento de mensagens para iniciar sorteios.',
        ephemeral: true
      });
    }

    const giveawayChannel = interaction.options.getChannel('canal');
    const giveawayDuration = interaction.options.getString('duração');
    const giveawayWinnerCount = interaction.options.getInteger('vencedores');
    const giveawayPrize = interaction.options.getString('prêmio');
    const image = interaction.options.getString('image');

    if (!giveawayChannel.isTextBased()) {
      return interaction.reply({
        content: ':x: Selecione um canal de texto!',
        ephemeral: true
      });
    }
   if(isNaN(ms(giveawayDuration))) {
    return interaction.reply({
      content: ':x: Selecione uma duração válida!',
      ephemeral: true
    });
  }
    if (giveawayWinnerCount < 1) {
      return interaction.reply({
        content: ':x: Selecione uma contagem válida do vencedor! maior ou igual 1.',
      })
    }

    const bonusRole = interaction.options.getRole('cargo-bônus')
    const bonusEntries = interaction.options.getInteger('bônus-quantidade')
    let rolereq = interaction.options.getRole('cargo')
    let invite = interaction.options.getString('convite')

    if (bonusRole) {
      if (!bonusEntries) {
        return interaction.reply({
          content: `:x: Você deve especificar quantas entradas de bônus ${BonusRole} recebe!`,
          ephemeral: true
        });
      }
    }


    await interaction.deferReply({ ephemeral: true })
    let reqinvite;
    if (invite) {
      let invitex = await client.fetchInvite(invite)
      let client_is_in_server = client.guilds.cache.get(
        invitex.guild.id
      )
      reqinvite = invitex
      if (!client_is_in_server) {
          const gaEmbed = {
            author: {
              name: client.user.username,
              iconURL: client.user.displayAvatarURL() 
            },
            title: "Checagem de Servidor!",
            url: "https://discord.gg/V9GtxnXhBH",
            description:
              "Woah woah woah! Eu vejo um novo servidor! tem certeza de que estou nele? Você precisa me convidar lá para definir isso como um requisito! 😳",
            timestamp: new Date(),
            footer: {
              iconURL: client.user.displayAvatarURL(),
              text: "Checar Servidor"
            }
          }  
        return interaction.editReply({ embeds: [gaEmbed]})
      }
    }

    if (rolereq && !invite) {
      messages.inviteToParticipate = `**Reaja com 🎉 para participar! ** \n>>> - Somente membros com ${rolereq} podem participar deste sorteio!`
    }
    if (rolereq && invite) {
      messages.inviteToParticipate = `**Reaja com 🎉 para participar! ** \n>>> - Somente membros com ${rolereq} podem participar deste sorteio!`
    }
    if (!rolereq && invite) {
      messages.inviteToParticipate = `**Reaja com 🎉 para participar! ** \n>>> - Os membros são obrigados a entrar nesse [servidor](${invite}) para participar deste sorteio!`
    }


    // start giveaway
    client.giveawaysManager.start(giveawayChannel, {
      // The giveaway duration
      duration: ms(giveawayDuration),
      // The giveaway prize
      prize: giveawayPrize,
      // The giveaway winner count
      winnerCount: parseInt(giveawayWinnerCount),
      // Hosted by
      hostedBy: client.config.hostedBy ? interaction.user : null,
      // BonusEntries If Provided
      bonusEntries: [
        {
          // Members who have the role which is assigned to "rolename" get the amount of bonus entries which are assigned to "BonusEntries"
          bonus: new Function('member', `return member.roles.cache.some((r) => r.name === \'${bonusRole ?.name}\') ? ${bonusEntries} : null`),
          cumulative: false
        }
      ],
      // Messages
      messages,
      extraData: {
        server: reqinvite == null ? "null" : reqinvite.guild.id,
        role: rolereq == null ? "null" : rolereq.id,
      },
    });
    interaction.editReply({
      content:
        `Sorteio iniciado em ${giveawayChannel}!`,
      ephemeral: true
    })
    if (image) {
      let des = new Discord.EmbedBuilder()
        .setAuthor({ name: `Extra Details` })
        .setDescription(`${invite}`)
        .setImage(`${image}`)
        .setColor("#2F3136");

      const row = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
        .setLabel('Twitter')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://twitter.com/ivongiveaways`))

      giveawayChannel.send({ embeds: [des], components: [row] });
    }

    if (bonusRole) {
      let giveaway = new Discord.EmbedBuilder()
        .setAuthor({ name: `Alerta de entradas de bônus!` })
        .setDescription(
          `**${bonusRole}** Tem **${bonusEntries}** Entradas extras nesta oferta!`)
        .setColor("#2F3136")
        .setTimestamp();
      giveawayChannel.send({ embeds: [giveaway] });
    }

  }

};
