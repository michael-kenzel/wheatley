#!/usr/bin/env python3

import sys
import discord
import json


class Zeenoth(discord.Client):
	async def on_ready(self):
		print("connected")

		print("starting dig...")

		guild = self.get_guild(318590007881236480)
		thread = await guild.fetch_channel(1142751596858593372)

		escape = str.maketrans({
			ord("\""): "\\\"",
			ord("\\"): "\\\\",
			ord("\b"): "\\b",
			ord("\f"): "\\f",
			ord("\n"): "\\n",
			ord("\r"): "\\r",
			ord("\t"): "\\t",
		})

		users = {}

		with open("archive.json", "w") as file:
			file.write("{\n"
			           "\t\"messages\": [")

			open_next = "\n"

			async for message in thread.history(limit=None, oldest_first=True):
				users[message.author.id] = message.author
				file.write(open_next)
				file.write("\t\t{\n"
				           f"\t\t\t\"timestamp\": \"{message.created_at}\",\n"
				           f"\t\t\t\"author\": \"{message.author.id}\",\n"
				           f"\t\t\t\"content\": \"{message.content.translate(escape)}\"")

				if message.attachments:
					file.write(f",\n\t\t\t\"attachments\": [")

					open_next = "\n"

					for attachment in message.attachments:
						file.write(open_next)
						file.write("\t\t\t\t")
						json.dump(attachment.to_dict(), file)
						open_next = ",\n"

					file.write("\n\t\t\t]")

				if message.embeds:
					file.write(f",\n\t\t\t\"embeds\": [")

					open_next = "\n"

					for embed in message.embeds:
						file.write(open_next)
						file.write("\t\t\t\t")
						json.dump(embed.to_dict(), file)
						open_next = ",\n"

					file.write("\n\t\t\t]")

				file.write("\n\t\t}")
				open_next = ",\n"

			file.write("\n\t],\n"
			           "\t\"users\": {")

			open_next = "\n"

			for id, user in users.items():
				file.write(open_next)
				file.write(f"\t\t\"{id}\": {{\n"
				           f"\t\t\t\"name\": \"{user.display_name}\",\n"
				           f"\t\t\t\"avatar\": \"{user.display_avatar.url}\"")
				
				if user.bot:
					file.write(f",\n\t\t\t\"is_bot\": true")

				file.write("\n\t\t}")

				open_next = ",\n"

			file.write("\n\t}\n}\n")

		print("...done")

		await self.close()


def main():
	if len(sys.argv) != 2:
		print("usage: zeenoth.py <token>")
		exit(-1)

	token = sys.argv[1]

	intents = discord.Intents.default()
	intents.message_content = True

	client = Zeenoth(intents=intents)
	client.run(token)


if __name__ == "__main__":
	main()
