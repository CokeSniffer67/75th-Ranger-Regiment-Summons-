import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("summon")
  .setDescription("Summon a user to a channel")

  // USER
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("Select the user you want to summon")
      .setRequired(true)
  )

  // CHANNEL
  .addChannelOption((option) =>
    option
      .setName("channel")
      .setDescription("Select the voice channel")
      .addChannelTypes(
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice
      )
      .setRequired(true)
  )

  // REASON
  .addStringOption((option) =>
    option
      .setName("reason")
      .setDescription("Reason for summoning the user")
      .setRequired(false)
  )

  // Requires Move Members permission
  .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers);

export async function execute(interaction) {
  const user = interaction.options.getUser("user");
  const channel = interaction.options.getChannel("channel");
  const reason =
    interaction.options.getString("reason") || "No reason provided";

  // Make sure the user exists
  if (!user) {
    return interaction.reply({
      content: "❌ User not found.",
      ephemeral: true,
    });
  }

  // Make sure the channel exists
  if (!channel) {
    return interaction.reply({
      content: "❌ Voice channel not found.",
      ephemeral: true,
    });
  }

  // Get the member from the server
  const member = await interaction.guild.members
    .fetch(user.id)
    .catch(() => null);

  if (!member) {
    return interaction.reply({
      content: "❌ That user is not in this server.",
      ephemeral: true,
    });
  }

  // Make sure the user is currently in a voice channel
  if (!member.voice.channel) {
    return interaction.reply({
      content: "❌ That user is not currently in a voice channel.",
      ephemeral: true,
    });
  }

  // Check command user's permission
  if (
    !interaction.member.permissions.has(
      PermissionFlagsBits.MoveMembers
    )
  ) {
    return interaction.reply({
      content: "❌ You need the **Move Members** permission to use this command.",
      ephemeral: true,
    });
  }

  // Check bot's permission
  const botMember = interaction.guild.members.me;

  if (
    !botMember ||
    !botMember.permissions.has(PermissionFlagsBits.MoveMembers)
  ) {
    return interaction.reply({
      content: "❌ I need the **Move Members** permission to summon users.",
      ephemeral: true,
    });
  }

  // Check if the user is already in the selected channel
  if (member.voice.channel.id === channel.id) {
    return interaction.reply({
      content: `❌ ${user.username} is already in that channel.`,
      ephemeral: true,
    });
  }

  try {
    // Move the user
    await member.voice.setChannel(channel, reason);

    // ONLY SHOW THEIR USERNAME
    await interaction.reply({
      content: `✅ ${user.username}`,
      ephemeral: true,
    });

    console.log(
      `[SUMMON] ${user.username} was summoned to ${channel.name} by ${interaction.user.username}. Reason: ${reason}`
    );
  } catch (error) {
    console.error("[SUMMON ERROR]", error);

    await interaction.reply({
      content: "❌ I was unable to summon that user.",
      ephemeral: true,
    });
  }
}

export default {
  data,
  execute,
};
